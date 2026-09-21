from rest_framework import permissions
from users.models import Utilisateur


class AvisPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == Utilisateur.Role.ADMIN:
            return True
        return obj.mission.proposition.demande.client.utilisateur == request.user