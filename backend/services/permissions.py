from rest_framework import permissions
from users.models import Utilisateur


class IsAdminOrReadOnly(permissions.BasePermission):
    """Catégories et Services : lecture libre, écriture réservée à l'admin."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == Utilisateur.Role.ADMIN


class PrestataireServicePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method == 'POST':
            return request.user.role in (Utilisateur.Role.PRESTATAIRE, Utilisateur.Role.ADMIN)
        return True

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == Utilisateur.Role.ADMIN:
            return True
        return obj.prestataire.utilisateur == request.user