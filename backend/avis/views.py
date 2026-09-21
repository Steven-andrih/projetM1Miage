from rest_framework import viewsets
from .models import Avis
from .serializers import AvisSerializer
from .permissions import AvisPermission
from users.models import Utilisateur


class AvisViewSet(viewsets.ModelViewSet):
    serializer_class = AvisSerializer
    permission_classes = [AvisPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role == Utilisateur.Role.ADMIN:
            return Avis.objects.all()
        if user.role == Utilisateur.Role.PRESTATAIRE:
            return Avis.objects.filter(mission__proposition__prestataire__utilisateur=user, visible=True)
        if user.role == Utilisateur.Role.CLIENT:
            return Avis.objects.filter(mission__proposition__demande__client__utilisateur=user)