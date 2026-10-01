from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Demande
from .serializers import DemandeSerializer
from .permissions import DemandePermission
from recommandations.logic import calculer_recommandations
from recommandations.serializers import RecommandationSerializer
from users.models import Utilisateur


class DemandeViewSet(viewsets.ModelViewSet):
    serializer_class = DemandeSerializer
    permission_classes = [DemandePermission]

    def get_queryset(self):
        user = self.request.user
        if user.role == Utilisateur.Role.ADMIN:
            return Demande.objects.all()
        if user.role == Utilisateur.Role.CLIENT:
            return Demande.objects.all()  # visibilité publique volontaire : un prestataire doit pouvoir parcourir les demandes ouvertes
        return Demande.objects.all()

    def perform_create(self, serializer):
        # 'statut' est en lecture seule dans le serializer (protection contre
        # toute modification arbitraire via PATCH), mais à la création
        # uniquement, on autorise le client à choisir entre BROUILLON et
        # PUBLIEE. Toute autre valeur (ou absence de valeur) retombe sur
        # BROUILLON par défaut.
        statut_demande = self.request.data.get('statut', Demande.Statut.BROUILLON)
        if statut_demande not in (Demande.Statut.BROUILLON, Demande.Statut.PUBLIEE):
            statut_demande = Demande.Statut.BROUILLON

        serializer.save(
            client=self.request.user.client_profile,
            statut=statut_demande,
        )

    @action(detail=True, methods=['get'])
    def recommandations(self, request, pk=None):
        demande = self.get_object()
        resultats = calculer_recommandations(demande)
        serializer = RecommandationSerializer(resultats, many=True)
        return Response(serializer.data)