from datetime import timedelta

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import serializers, status, viewsets
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import ConsultationTemporaire, ConsultationPaye, Doctor, Secreteur, Administration
from .serializers import (
    ConsultationTemporaireSerializer,
    ConsultationPayeSerializer,
    DoctorSerializer,
    SecreteurSerializer,
    AdministrationSerializer,
    UserSerializer,
    UserCreateSerializer,
    ConsultationTemporaireListSerializer,
    PayRequestSerializer,
    SecretaryReservationSerializer,
)
from .permissions import (
    IsAdministration,
    IsSecreteur,
    IsDoctor,
    IsSecreteurOrAdmin,
    IsDoctorOrSecreteurOrAdmin,
)
from .whatsapp import send_whatsapp_message
from .ocr_tools import ocr_image_to_text, extract_nni_from_text, parse_bankili_text


BANKILI_EXPECTED_RECEIVER = "26383942"
PAYMENT_WINDOW_MINUTES = 3
SESSION_KEY = "payment_window_start"


def nettoyer_consultations():
    """
    Supprime les consultations expirées.
    Ici je garde ta logique telle quelle.
    """
    today = timezone.localdate()
    ConsultationTemporaire.objects.filter(date_fin__date=today).delete()


def ok(data=None, http_status=status.HTTP_200_OK):
    return Response({"ok": True, "data": data}, status=http_status)


def err(message, http_status=status.HTTP_400_BAD_REQUEST, details=None):
    payload = {"ok": False, "error": message}
    if details is not None:
        payload["details"] = details
    return Response(payload, status=http_status)


class ConsultationTemporairePublicView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        consultations = ConsultationTemporaire.objects.filter(
            date_fin__gte=timezone.now()
        ).order_by("date_fin")

        serializer = ConsultationTemporaireSerializer(consultations, many=True)
        return Response(serializer.data)


class ConsultationTemporaireViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultationTemporaireSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "doctor"):
            return ConsultationTemporaire.objects.filter(doctor=user.doctor)
        return ConsultationTemporaire.objects.all()

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsSecreteurOrAdmin()]
        return [IsDoctorOrSecreteurOrAdmin()]


class ConsultationPayeViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultationPayeSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "doctor"):
            return ConsultationPaye.objects.filter(doctor=user.doctor)
        return ConsultationPaye.objects.all()

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            return [IsSecreteurOrAdmin()]
        elif self.action in ["partial_update", "update"]:
            return [IsDoctorOrSecreteurOrAdmin()]
        return [IsDoctorOrSecreteurOrAdmin()]

    def perform_create(self, serializer):
        temporaire_id = self.request.data.get("temporaire_id")
        if not temporaire_id:
            raise serializers.ValidationError({"temporaire_id": "Error"})

        try:
            temporaire = ConsultationTemporaire.objects.get(id=temporaire_id)
        except ConsultationTemporaire.DoesNotExist:
            raise serializers.ValidationError({"temporaire_id": "Error"})

        if temporaire.n_places <= 0:
            raise serializers.ValidationError({"temporaire_id": "Plain temporaire"})

        nombre_existant = ConsultationPaye.objects.filter(temporaire_id=temporaire_id).count()
        numero = nombre_existant + 1

        temporaire.n_places -= 1
        temporaire.save()

        serializer.save(
            doctor=temporaire.doctor,
            date=temporaire.date_fin,
            specialite=temporaire.doctor.specialite,
            temporaire_id=temporaire_id,
            numero_reservation=numero
        )

        if temporaire.n_places <= 0:
            temporaire.delete()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        if hasattr(user, "doctor"):
            if instance.doctor != user.doctor:
                return Response({"detail": "NOT_YOUR_CONSULTATION"}, status=403)

            if set(request.data.keys()) != {"diagnostic"}:
                return Response({"detail": "ONLY_DIAGNOSTIC_ALLOWED"}, status=400)

            diagnostic = request.data.get("diagnostic")
            if not diagnostic:
                return Response({"detail": "DIAGNOSTIC_REQUIRED"}, status=400)

            instance.diagnostic = diagnostic
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        return super().update(request, *args, **kwargs)


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
        # Secretaries (and admins) need to be able to fetch the list of doctors
        # so that the dropdown on the secrétaire page can be populated.  Only
        # administrators are allowed to create, update or delete doctors.
        if self.action in ["list", "retrieve"]:
            return [IsSecreteurOrAdmin()]
        return [IsAdministration()]


class SecreteurViewSet(viewsets.ModelViewSet):
    queryset = Secreteur.objects.all()
    serializer_class = SecreteurSerializer
    permission_classes = [IsAdministration]


class AdministrationViewSet(viewsets.ModelViewSet):
    queryset = Administration.objects.all()
    serializer_class = AdministrationSerializer
    permission_classes = [IsAdministration]


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response({"detail": "OLD_PASSWORD_AND_NEW_PASSWORD_REQUIRED"}, status=400)

        if not user.check_password(old_password):
            return Response({"detail": "OLD_PASSWORD_INCORRECT"}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "PASSWORD_CHANGED_SUCCESS"})


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "date_joined": user.date_joined,
        }

        if hasattr(user, "administration"):
            data["role"] = "admin"
            data["profile"] = AdministrationSerializer(user.administration).data
        elif hasattr(user, "secreteur"):
            data["role"] = "secretary"
            data["profile"] = SecreteurSerializer(user.secreteur).data
        elif hasattr(user, "doctor"):
            data["role"] = "doctor"
            data["profile"] = DoctorSerializer(user.doctor).data
        else:
            data["role"] = "unknown"

        return Response(data)


class VerifyAdminCodeView(APIView):
    """
    Vérifie le code secret de l'admin principal.
    Nécessite un JWT valide.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = (request.data.get("code") or "").strip()
        if not code:
            return Response({"detail": "CODE_REQUIRED"}, status=400)

        user = request.user
        if not hasattr(user, "administration"):
            return Response({"detail": "NOT_ADMIN"}, status=403)

        admin_profile = user.administration
        if not admin_profile.is_main_admin:
            return Response({"detail": "NOT_MAIN_ADMIN"}, status=403)

        if admin_profile.secret_code != code:
            return Response({"detail": "INVALID_CODE"}, status=401)

        return Response({"ok": True})


@api_view(["GET"])
@permission_classes([AllowAny])
def consultations_list(request):
    nettoyer_consultations()

    now = timezone.now()
    qs = ConsultationTemporaire.objects.filter(
        date_fin__gt=now,
        n_places__gt=0
    ).order_by("date_fin")

    return ok(ConsultationTemporaireListSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([AllowAny])  # <--- AJOUTEZ CETTE LIGNE
def open_window(request, consultation_id):
    nettoyer_consultations()

    c = get_object_or_404(ConsultationTemporaire, id=consultation_id)
    now = timezone.now()

    if c.n_places <= 0:
        c.delete()
        return err("Plus de places disponibles.", status.HTTP_409_CONFLICT)

    if SESSION_KEY not in request.session:
        request.session[SESSION_KEY] = now.isoformat()

    start = timezone.datetime.fromisoformat(request.session[SESSION_KEY])
    if timezone.is_naive(start):
        start = timezone.make_aware(start, timezone.get_current_timezone())

    end = start + timedelta(minutes=PAYMENT_WINDOW_MINUTES)

    return ok({
        "consultation_id": c.id,
        "window_start": start,
        "window_end": end,
        "receiver": BANKILI_EXPECTED_RECEIVER,
        "montant": c.montant,
        "window_minutes": PAYMENT_WINDOW_MINUTES,
    })


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def pay_consultation(request, consultation_id):
    nettoyer_consultations()

    c = get_object_or_404(ConsultationTemporaire, id=consultation_id)
    test_mode = request.GET.get("test") == "1"

    if c.n_places <= 0:
        c.delete()
        return err("Plus de places disponibles.", status.HTTP_409_CONFLICT)

    ser = PayRequestSerializer(data=request.data)
    if not ser.is_valid():
        return err("Données invalides.", details=ser.errors)

    start_str = request.session.get(SESSION_KEY)

    if not test_mode and not start_str:
        return err("Fenêtre expirée. Ré-ouvre la réservation.")

    if start_str:
        window_start = timezone.datetime.fromisoformat(start_str)
        if timezone.is_naive(window_start):
            window_start = timezone.make_aware(window_start, timezone.get_current_timezone())
        window_end = window_start + timedelta(minutes=PAYMENT_WINDOW_MINUTES)
    else:
        window_start = None
        window_end = None

    photo_nni = ser.validated_data["photo_nni"]
    capture_paiement = ser.validated_data["capture_paiement"]

    nni_text = ocr_image_to_text(photo_nni)
    nni = extract_nni_from_text(nni_text)
    if not nni:
        return err("NNI illisible.")

    pay_text = ocr_image_to_text(capture_paiement)
    info = parse_bankili_text(pay_text)

    if info["status_type"] != "transfert":
        return err("Capture invalide: il faut 'Transfert réussi'.")
    if not info["receiver"]:
        return err("Receveur illisible.")
    if info["receiver"] != BANKILI_EXPECTED_RECEIVER:
        return err("Receveur incorrect.")
    if info["amount"] is None:
        return err("Montant illisible.")
    if info["amount"] != c.montant:
        return err("Montant incorrect.")
    if not info["paiement_dt"]:
        return err("Date/heure illisible.")

    if not test_mode:
        if not (window_start <= info["paiement_dt"] <= window_end):
            return err("Paiement hors délai.")

    with transaction.atomic():
        locked = ConsultationTemporaire.objects.select_for_update().get(id=c.id)

        if locked.n_places <= 0:
            locked.delete()
            return err("Plus disponible.", status.HTTP_409_CONFLICT)

        ConsultationTemporaire.objects.filter(id=locked.id, n_places__gt=0).update(
            n_places=F("n_places") - 1
        )
        locked.refresh_from_db()

        paiement = ConsultationPaye.objects.create(
            nom_complet=ser.validated_data["nomComplet_patient"],
            numero_tel=ser.validated_data["numero_tel_patient"],
            date=timezone.now(),
            temporaire_id=locked.id,
            doctor=locked.doctor,
            specialite=locked.doctor.specialite,
        )

        if locked.n_places == 0:
            locked.delete()

        message_text = (
            f"Bonjour {ser.validated_data['nomComplet_patient']}, "
            f"votre réservation est confirmée avec le docteur "
            f"{c.doctor.user.username if c.doctor.user else c.doctor.id}. "
            f"Spécialité: {c.doctor.specialite}. "
            f"Montant: {c.montant} MRU."
        )

        wa_result = send_whatsapp_message(
            ser.validated_data["numero_tel_patient"],
            message_text
        )

    request.session.pop(SESSION_KEY, None)

    return ok({
        "paiement_id": paiement.id,
        "places_restantes": 0 if locked.n_places == 0 else locked.n_places,
        "message": "Paiement validé. Réservation confirmée.",
        "test_mode": test_mode,
        "whatsapp_result": wa_result,
    }, http_status=status.HTTP_201_CREATED)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def secretary_reservation(request, consultation_id):
    """
    Endpoint pour les secrétaires pour réserver une consultation sans paiement
    """
    nettoyer_consultations()

    c = get_object_or_404(ConsultationTemporaire, id=consultation_id)

    if c.n_places <= 0:
        c.delete()
        return err("Plus de places disponibles.", status.HTTP_409_CONFLICT)

    ser = SecretaryReservationSerializer(data=request.data)
    if not ser.is_valid():
        return err("Données invalides.", details=ser.errors)

    with transaction.atomic():
        locked = ConsultationTemporaire.objects.select_for_update().get(id=c.id)

        if locked.n_places <= 0:
            locked.delete()
            return err("Plus disponible.", status.HTTP_409_CONFLICT)

        ConsultationTemporaire.objects.filter(id=locked.id, n_places__gt=0).update(
            n_places=F("n_places") - 1
        )
        locked.refresh_from_db()

        paiement = ConsultationPaye.objects.create(
            nom_complet=ser.validated_data["nomComplet_patient"],
            numero_tel=ser.validated_data["numero_tel_patient"],
            date=timezone.now(),
            temporaire_id=locked.id,
            doctor=locked.doctor,
            specialite=locked.doctor.specialite,
            NNI=ser.validated_data["NNI"],
        )

        if locked.n_places == 0:
            locked.delete()

        message_text = (
            f"Bonjour {ser.validated_data['nomComplet_patient']}, "
            f"votre réservation est confirmée avec le docteur "
            f"{c.doctor.user.username if c.doctor.user else c.doctor.id}. "
            f"Spécialité: {c.doctor.specialite}. "
            f"Montant: {c.montant} MRU."
        )

        wa_result = send_whatsapp_message(
            ser.validated_data["numero_tel_patient"],
            message_text
        )

    return ok({
        "paiement_id": paiement.id,
        "places_restantes": 0 if locked.n_places == 0 else locked.n_places,
        "message": "Réservation créée avec succès.",
        "whatsapp_result": wa_result,
    }, http_status=status.HTTP_201_CREATED)
