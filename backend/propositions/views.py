from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from demandes.models import Demande
from missions.models import Mission
from .models import Proposition
from .serializers import PropositionSerializer


class PropositionViewSet(viewsets.ModelViewSet):
    queryset = Proposition.objects.all()
    serializer_class = PropositionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(prestataire=self.request.user.prestataire_profile)

    @action(detail=True, methods=['post'])
    def accepter(self, request, pk=None):
        proposition = self.get_object()
        demande = proposition.demande

        if demande.client.utilisateur != request.user:
            return Response(
                {'detail': "Vous n'êtes pas autorisé à accepter cette proposition."},
                status=403,
            )

        if proposition.statut != Proposition.Statut.EN_ATTENTE:
            return Response(
                {'detail': 'Cette proposition a déjà été traitée.'},
                status=400,
            )

        proposition.statut = Proposition.Statut.ACCEPTEE
        proposition.date_reponse = timezone.now()
        proposition.save()

        demande.statut = Demande.Statut.EN_COURS
        demande.save()

        demande.propositions.exclude(pk=proposition.pk).update(
            statut=Proposition.Statut.REFUSEE,
            date_reponse=timezone.now(),
        )

        mission = Mission.objects.create(proposition=proposition)

        return Response(
            {'detail': 'Proposition acceptée, mission créée.', 'mission_id': mission.id},
            status=201,
        )