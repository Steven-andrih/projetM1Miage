from rest_framework import permissions
from users.models import Utilisateur


class MissionPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.role == Utilisateur.Role.ADMIN:
            return True
        return (
            obj.proposition.prestataire.utilisateur == request.user
            or obj.proposition.demande.client.utilisateur == request.user
        )