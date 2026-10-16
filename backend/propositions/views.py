from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from demandes.models import Demande
from missions.models import Mission
from messagerie import services as messagerie
from messagerie.serializers import ConversationSerializer
from users.models import Utilisateur
from .models import Proposition
from .serializers import PropositionSerializer
from .permissions import PropositionPermission


class PropositionViewSet(viewsets.ModelViewSet):
    serializer_class = PropositionSerializer
    permission_classes = [PropositionPermission]

    def get_queryset(self):
        user = self.request.user
        qs = Proposition.objects.select_related('prestataire__utilisateur', 'demande__client__utilisateur')
        if user.role == Utilisateur.Role.ADMIN:
            return qs
        if user.role == Utilisateur.Role.PRESTATAIRE:
            return qs.filter(prestataire__utilisateur=user)
        if user.role == Utilisateur.Role.CLIENT:
            # Les propositions des prestataires désactivés sont masquées.
            return qs.filter(demande__client__utilisateur=user, prestataire__utilisateur__is_active=True)
        return Proposition.objects.none()

    def perform_create(self, serializer):
        serializer.save(prestataire=self.request.user.prestataire_profile)

    def perform_update(self, serializer):
        ancien_tarif = serializer.instance.tarif_propose
        proposition = serializer.save()
        if ancien_tarif != proposition.tarif_propose:
            messagerie.message_systeme(
                proposition,
                f"Tarif modifié : {messagerie.format_ariary(ancien_tarif)} → "
                f"{messagerie.format_ariary(proposition.tarif_propose)}",
            )

    def _verifier_client_en_attente(self, request, proposition):
        if proposition.demande.client.utilisateur != request.user:
            return Response(
                {'detail': "Vous n'êtes pas autorisé à répondre à cette proposition."},
                status=403,
            )
        if proposition.statut != Proposition.Statut.EN_ATTENTE:
            return Response({'detail': 'Cette proposition a déjà été traitée.'}, status=400)
        return None

    @action(detail=True, methods=['post'])
    def accepter(self, request, pk=None):
        proposition = self.get_object()
        erreur = self._verifier_client_en_attente(request, proposition)
        if erreur:
            return erreur
        demande = proposition.demande
        maintenant = timezone.now()

        with transaction.atomic():
            proposition.statut = Proposition.Statut.ACCEPTEE
            proposition.date_reponse = maintenant
            proposition.save()

            demande.statut = Demande.Statut.EN_COURS
            demande.save()

            autres = list(
                demande.propositions.exclude(pk=proposition.pk).filter(statut=Proposition.Statut.EN_ATTENTE)
            )
            demande.propositions.exclude(pk=proposition.pk).update(
                statut=Proposition.Statut.REFUSEE,
                date_reponse=maintenant,
            )

            mission = Mission.objects.create(proposition=proposition)

            messagerie.message_systeme_si_conversation(
                proposition, 'Proposition acceptée par le client. La mission a démarré.'
            )
            for autre in autres:
                messagerie.message_systeme_si_conversation(
                    autre, 'Le client a retenu une autre proposition pour cette demande.'
                )

        return Response(
            {'detail': 'Proposition acceptée, mission créée.', 'mission_id': mission.id},
            status=201,
        )

    @action(detail=True, methods=['post'])
    def refuser(self, request, pk=None):
        proposition = self.get_object()
        erreur = self._verifier_client_en_attente(request, proposition)
        if erreur:
            return erreur
        proposition.statut = Proposition.Statut.REFUSEE
        proposition.date_reponse = timezone.now()
        proposition.save()
        messagerie.message_systeme_si_conversation(proposition, 'Proposition refusée par le client.')
        return Response(self.get_serializer(proposition).data)

    @action(detail=True, methods=['get', 'post'])
    def conversation(self, request, pk=None):
        """Ouvre (ou crée) la conversation liée à la proposition."""
        proposition = self.get_object()
        conversation = messagerie.obtenir_conversation(proposition)
        if not messagerie.peut_lire(conversation, request.user):
            return Response({'detail': 'Accès refusé.'}, status=403)
        return Response(ConversationSerializer(conversation, context={'request': request}).data)
