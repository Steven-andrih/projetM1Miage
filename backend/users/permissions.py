from rest_framework import permissions
from .models import Utilisateur


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role == Utilisateur.Role.ADMIN
        )


class IsClientRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role == Utilisateur.Role.CLIENT
        )


class IsPrestataireRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role == Utilisateur.Role.PRESTATAIRE
        )