from rest_framework import permissions
from users.models import Utilisateur


class PropositionPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if view.action == 'accepter':
            return request.user.role in (Utilisateur.Role.CLIENT, Utilisateur.Role.ADMIN)
        if request.method == 'POST':
            return request.user.role in (Utilisateur.Role.PRESTATAIRE, Utilisateur.Role.ADMIN)
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.role == Utilisateur.Role.ADMIN:
            return True
        if request.method in permissions.SAFE_METHODS:
            # visible par le prestataire qui l'a faite OU le client qui a reçu la demande
            return (
                obj.prestataire.utilisateur == request.user
                or obj.demande.client.utilisateur == request.user
            )

        if view.action == 'accepter':
            # seul le client propriétaire de la demande peut accepter
            return obj.demande.client.utilisateur == request.user

        # modification/suppression classiques : uniquement le prestataire auteur
        return obj.prestataire.utilisateur == request.user
