from rest_framework import viewsets
from .models import Mission
from .serializers import MissionSerializer
from .permissions import MissionPermission
from users.models import Utilisateur


class MissionViewSet(viewsets.ModelViewSet):
    serializer_class = MissionSerializer
    permission_classes = [MissionPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role == Utilisateur.Role.ADMIN:
            return Mission.objects.all()
        if user.role == Utilisateur.Role.PRESTATAIRE:
            return Mission.objects.filter(proposition__prestataire__utilisateur=user)
        if user.role == Utilisateur.Role.CLIENT:
            return Mission.objects.filter(proposition__demande__client__utilisateur=user)
        return Mission.objects.none()