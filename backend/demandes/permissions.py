from rest_framework import permissions
from users.models import Utilisateur


class DemandePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method == 'POST':
            return request.user.role in (Utilisateur.Role.CLIENT, Utilisateur.Role.ADMIN)
        return True

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == Utilisateur.Role.ADMIN:
            return True
        return obj.client.utilisateur == request.user