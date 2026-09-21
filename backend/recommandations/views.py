from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from recommandations.logic import calculer_recommandations
from recommandations.serializers import RecommandationSerializer
from demandes.models import Demande
from demandes.serializers import DemandeSerializer

class DemandeViewSet(viewsets.ModelViewSet):
    queryset = Demande.objects.all()
    serializer_class = DemandeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user.client_profile)

    @action(detail=True, methods=['get'])
    def recommandations(self, request, pk=None):
        demande = self.get_object()
        resultats = calculer_recommandations(demande)
        serializer = RecommandationSerializer(resultats, many=True)
        return Response(serializer.data)