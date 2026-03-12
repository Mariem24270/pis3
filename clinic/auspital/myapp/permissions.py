from rest_framework import permissions


class IsAdministration(permissions.BasePermission):
    message = "NOT_ADMIN"

    def has_permission(self, request, view):
        return hasattr(request.user, "administration")


class IsSecreteur(permissions.BasePermission):
    message = 'NOT_SECRETARY'
    
    def has_permission(self, request, view):
        return hasattr(request.user, 'secreteur')

class IsDoctor(permissions.BasePermission):
    message = "NOT_DOCTOR"

    def has_permission(self, request, view):
        return hasattr(request.user, "doctor")


class IsSecreteurOrAdmin(permissions.BasePermission):
    message = "NOT_SECRETARY_OR_ADMIN"

    def has_permission(self, request, view):
        return hasattr(request.user, "secreteur") or hasattr(request.user, "administration")


class IsDoctorOrSecreteurOrAdmin(permissions.BasePermission):
    message = "NOT_DOCTOR_OR_SECRETARY_OR_ADMIN"

    def has_permission(self, request, view):
        return (
            hasattr(request.user, "doctor")
            or hasattr(request.user, "secreteur")
            or hasattr(request.user, "administration")
        )
