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


BANKILI_EXPECTED_RECEIVER = "37343466"
PAYMENT_WINDOW_MINUTES = 3
SESSION_KEY = "payment_window_start"


def nettoyer_consultations():
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
            numero_reservation=numero,
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

            instance.diagnostic = request.data.get("diagnostic")
            instance.save()
            return Response(self.get_serializer(instance).data)

        return super().update(request, *args, **kwargs)


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
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
        n_places__gt=0,
    ).order_by("date_fin")
    return ok(ConsultationTemporaireListSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def pay_consultation(request, consultation_id):
    """
    Patient → envoie NNI + reçu Bankily.
    Statut = 'en_attente' → apparaît dans la file d'attente du secrétaire.
    """
    nettoyer_consultations()
    c = get_object_or_404(ConsultationTemporaire, id=consultation_id)

    if c.n_places <= 0:
        c.delete()
        return err("Plus de places disponibles.", status.HTTP_409_CONFLICT)

    nom_complet      = request.data.get("nomComplet_patient", "").strip()
    numero_tel       = request.data.get("numero_tel_patient", "").strip()
    photo_nni        = request.FILES.get("photo_nni")
    capture_paiement = request.FILES.get("capture_paiement")

    if not nom_complet or not numero_tel:
        return err("Nom et téléphone requis.")
    if not photo_nni or not capture_paiement:
        return err("Les deux images sont requises (NNI + reçu Bankily).")

    with transaction.atomic():
        locked = ConsultationTemporaire.objects.select_for_update().get(id=c.id)

        if locked.n_places <= 0:
            return err("Plus disponible.", status.HTTP_409_CONFLICT)

        # ✅ statut = 'en_attente' → file d'attente secrétaire
        paiement = ConsultationPaye.objects.create(
            nom_complet=nom_complet,
            numero_tel=numero_tel,
            photo_nni=photo_nni,
            capture_paiement=capture_paiement,
            date=timezone.now(),
            temporaire_id=locked.id,
            doctor=locked.doctor,
            specialite=locked.doctor.specialite,
            montant=locked.montant,
            statut='en_attente',
        )

        if locked.n_places > 1:
            locked.n_places -= 1
            locked.save()
        else:
            locked.delete()

    return ok({
        "paiement_id": paiement.id,
        "message": "Votre demande a été reçue. Le secrétaire va vérifier votre dossier.",
    }, http_status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def valider_reservation(request, paiement_id):
    """
    Secrétaire valide ou rejette une réservation.
    Si validé → envoi automatique d'un message WhatsApp au patient.
    """
    paiement = get_object_or_404(ConsultationPaye, id=paiement_id)
    action = request.data.get("action")

    if action not in ["valide", "rejete"]:
        return err("Action invalide. Utilisez 'valide' ou 'rejete'.")

    paiement.statut = action
    paiement.save()

    wa_result = None
    if action == "valide":
        doctor_name = (
            paiement.doctor.user.get_full_name() or paiement.doctor.user.username
            if paiement.doctor and paiement.doctor.user
            else "votre médecin"
        )
        message_text = (
            f"Bonjour {paiement.nom_complet},\n"
            f"Votre réservation a été CONFIRMÉE.\n"
            f"Médecin : Dr. {doctor_name}\n"
            f"Spécialité : {paiement.specialite}\n"
            f"Montant payé : {paiement.montant} MRU\n"
            f"Merci de vous présenter à l'heure prévue."
        )
        wa_result = send_whatsapp_message(paiement.numero_tel, message_text)

    return ok({
        "message": f"Réservation {'validée' if action == 'valide' else 'rejetée'} avec succès.",
        "whatsapp_result": wa_result,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def secretary_reservation(request, consultation_id):
    """
    Secrétaire inscrit un patient directement.
    Statut = 'valide' → va directement dans la liste, sans file d'attente.
    """
    nettoyer_consultations()
    c = get_object_or_404(ConsultationTemporaire, id=consultation_id)

    if c.n_places <= 0:
        return Response({"error": "Plus de places disponibles"}, status=409)

    ser = SecretaryReservationSerializer(data=request.data)
    if not ser.is_valid():
        return Response({"error": "Données invalides", "details": ser.errors}, status=400)

    try:
        with transaction.atomic():
            locked = ConsultationTemporaire.objects.select_for_update().get(id=c.id)
            nombre_actuel = ConsultationPaye.objects.filter(temporaire_id=locked.id).count()

            # ✅ statut = 'valide' → liste directe, pas de file d'attente
            ConsultationPaye.objects.create(
                nom_complet=ser.validated_data["nomComplet_patient"],
                numero_tel=ser.validated_data["numero_tel_patient"],
                NNI=ser.validated_data["NNI"],
                date=timezone.now(),
                temporaire_id=locked.id,
                doctor=locked.doctor,
                specialite=locked.doctor.specialite,
                numero_reservation=nombre_actuel + 1,
                montant=locked.montant,
                statut='valide',
            )

            if locked.n_places > 1:
                locked.n_places -= 1
                locked.save()
            else:
                locked.delete()

        return Response({"ok": True, "message": "Réservation enregistrée !"}, status=201)
    except Exception as e:
        return Response({"error": f"Erreur : {str(e)}"}, status=500)