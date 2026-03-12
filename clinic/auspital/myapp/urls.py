from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Views (public booking flow)
from .views import consultations_list, open_window, pay_consultation, secretary_reservation

# API views / viewsets (dashboards + auth helpers)
from .views import (
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
    # Auth/profile helpers
    path("me/", CurrentUserView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("admin/verify-code/", VerifyAdminCodeView.as_view(), name="admin-verify-code"),

    # CRUD endpoints
    path("", include(router.urls)),

    # Public booking flow used by the patient (no account)
    path('consultations/', consultations_list, name='consultations'),
    path('open-window/<int:consultation_id>/', open_window, name='open-window'),
    path('pay-consultation/<int:consultation_id>/', pay_consultation, name='pay-consultation'),
    path('secretary-reservation/<int:consultation_id>/', secretary_reservation, name='secretary-reservation'),
]