from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    consultations_list,
    open_window,
    pay_consultation,
    secretary_reservation,
    valider_reservation,        # ← NOUVEAU
    CurrentUserView,
    ChangePasswordView,
    VerifyAdminCodeView,
    ConsultationTemporaireViewSet,
    ConsultationPayeViewSet,
    DoctorViewSet,
    SecreteurViewSet,
    AdministrationViewSet,
)

router = DefaultRouter()
router.register(r"consultations-temporaires", ConsultationTemporaireViewSet, basename="consultations-temporaires")
router.register(r"consultations-payees", ConsultationPayeViewSet, basename="consultations-payees")
router.register(r"doctors", DoctorViewSet, basename="doctors")
router.register(r"secreteurs", SecreteurViewSet, basename="secreteurs")
router.register(r"administrations", AdministrationViewSet, basename="administrations")

urlpatterns = [
    path("me/", CurrentUserView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("admin/verify-code/", VerifyAdminCodeView.as_view(), name="admin-verify-code"),
    path("", include(router.urls)),
    path('consultations/', consultations_list, name='consultations_list'),
    path('open-window/<int:consultation_id>/', open_window, name='open-window'),
    path('pay-consultation/<int:consultation_id>/', pay_consultation, name='pay-consultation'),
    path('secretary-reservation/<int:consultation_id>/', secretary_reservation, name='secretary-reservation'),
    path('valider-reservation/<int:paiement_id>/', valider_reservation, name='valider-reservation'),  # ← NOUVEAU
]