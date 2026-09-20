from rest_framework import viewsets, permissions
from .models import Proposition
from .serializers import PropositionSerializer


class PropositionViewSet(viewsets.ModelViewSet):
    queryset = Proposition.objects.all()
    serializer_class = PropositionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(prestataire=self.request.user.prestataire_profile)