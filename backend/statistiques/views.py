from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Avg, F
from django.db.models.functions import TruncMonth

from demandes.models import Demande
from propositions.models import Proposition
from missions.models import Mission
from users.permissions import IsAdminRole

from django.db.models import Sum
from users.permissions import IsClientRole, IsPrestataireRole
from propositions.models import Proposition
from services.models import PrestataireService
from avis.models import Avis


class ClientDashboardView(APIView):
    permission_classes = [IsClientRole]

    def get(self, request):
        client = request.user.client_profile
        demandes = Demande.objects.filter(client=client)

        demandes_par_statut = {
            choix: demandes.filter(statut=choix).count()
            for choix, _ in Demande.Statut.choices
        }

        missions = Mission.objects.filter(proposition__demande__client=client)

        propositions_en_attente = Proposition.objects.filter(
            demande__client=client, statut=Proposition.Statut.EN_ATTENTE
        ).count()

        dernieres_demandes = list(
            demandes.order_by('-date_creation')[:5].values(
                'id', 'titre', 'statut', 'date_creation'
            )
        )
        for d in dernieres_demandes:
            d['nb_propositions'] = Proposition.objects.filter(demande_id=d['id']).count()

        return Response({
            'nb_demandes_total': demandes.count(),
            'demandes_par_statut': demandes_par_statut,
            'nb_missions_en_cours': missions.filter(statut=Mission.Statut.EN_COURS).count(),
            'nb_missions_terminees': missions.filter(statut=Mission.Statut.TERMINEE).count(),
            'propositions_en_attente_de_ma_decision': propositions_en_attente,
            'dernieres_demandes': dernieres_demandes,
        })


class PrestataireDashboardView(APIView):
    permission_classes = [IsPrestataireRole]

    def get(self, request):
        prestataire = request.user.prestataire_profile
        propositions = Proposition.objects.filter(prestataire=prestataire)
        missions = Mission.objects.filter(proposition__prestataire=prestataire)

        nb_propositions = propositions.count()
        nb_acceptees = propositions.filter(statut=Proposition.Statut.ACCEPTEE).count()
        taux_acceptation = (
            round((nb_acceptees / nb_propositions) * 100, 2) if nb_propositions > 0 else 0
        )

        note_moyenne = Avis.objects.filter(
            mission__proposition__prestataire=prestataire, visible=True
        ).aggregate(Avg('note'))['note__avg']

        revenu_total = missions.filter(statut=Mission.Statut.TERMINEE).aggregate(
            total=Sum('proposition__tarif_propose')
        )['total'] or 0

        # Opportunités : demandes pas encore engagées, sur les services proposés par ce prestataire
        services_ids = PrestataireService.objects.filter(
            prestataire=prestataire, actif=True
        ).values_list('service_id', flat=True)
        nb_opportunites = Demande.objects.filter(
            service_id__in=services_ids,
            statut__in=[Demande.Statut.BROUILLON, Demande.Statut.PUBLIEE],
        ).exclude(
            propositions__prestataire=prestataire  # déjà répondu
        ).count()

        return Response({
            'nb_missions_en_cours': missions.filter(statut=Mission.Statut.EN_COURS).count(),
            'nb_missions_terminees': missions.filter(statut=Mission.Statut.TERMINEE).count(),
            'note_moyenne': round(note_moyenne, 2) if note_moyenne else None,
            'nb_avis_recus': Avis.objects.filter(
                mission__proposition__prestataire=prestataire, visible=True
            ).count(),
            'propositions_en_attente': propositions.filter(
                statut=Proposition.Statut.EN_ATTENTE
            ).count(),
            'taux_acceptation_pct': taux_acceptation,
            'revenu_total_estime': revenu_total,
            'nb_opportunites_disponibles': nb_opportunites,
        })

class DashboardView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        # --- Compteurs simples ---
        nb_demandes = Demande.objects.count()
        nb_missions = Mission.objects.count()
        missions_terminees = Mission.objects.filter(statut=Mission.Statut.TERMINEE).count()
        missions_annulees = Mission.objects.filter(statut=Mission.Statut.ANNULEE).count()
        missions_en_cours = Mission.objects.filter(statut=Mission.Statut.EN_COURS).count()

        # --- Taux d'acceptation des propositions ---
        nb_propositions = Proposition.objects.count()
        nb_propositions_acceptees = Proposition.objects.filter(
            statut=Proposition.Statut.ACCEPTEE
        ).count()
        taux_acceptation = (
            round((nb_propositions_acceptees / nb_propositions) * 100, 2)
            if nb_propositions > 0 else 0
        )

        # --- Délai moyen de réponse (Proposition.date_reponse - date_demande) ---
        delai = Proposition.objects.filter(date_reponse__isnull=False).aggregate(
            moyenne=Avg(F('date_reponse') - F('date_proposition'))
        )['moyenne']
        delai_moyen_reponse_heures = round(delai.total_seconds() / 3600, 2) if delai else None

        # --- Temps moyen de réalisation (Mission.date_fin - date_debut) ---
        duree = Mission.objects.filter(date_fin__isnull=False).aggregate(
            moyenne=Avg(F('date_fin') - F('date_debut'))
        )['moyenne']
        temps_moyen_realisation_heures = round(duree.total_seconds() / 3600, 2) if duree else None

        # --- Répartition géographique des demandes (par ville du client) ---
        repartition_geo = list(
            Demande.objects.values('client__ville')
            .annotate(total=Count('id'))
            .order_by('-total')
        )

        # --- Catégories les plus recherchées ---
        categories_recherchees = list(
            Demande.objects.values('service__categorie__nom')
            .annotate(total=Count('id'))
            .order_by('-total')
        )

        # --- Évolution mensuelle de l'activité (nb demandes par mois) ---
        evolution_mensuelle = list(
            Demande.objects.annotate(mois=TruncMonth('date_creation'))
            .values('mois')
            .annotate(total=Count('id'))
            .order_by('mois')
        )

        return Response({
            'nb_demandes': nb_demandes,
            'nb_missions': nb_missions,
            'missions_terminees': missions_terminees,
            'missions_annulees': missions_annulees,
            'missions_en_cours': missions_en_cours,
            'taux_acceptation_pct': taux_acceptation,
            'delai_moyen_reponse_heures': delai_moyen_reponse_heures,
            'temps_moyen_realisation_heures': temps_moyen_realisation_heures,
            'repartition_geographique': repartition_geo,
            'categories_les_plus_recherchees': categories_recherchees,
            'evolution_mensuelle': evolution_mensuelle,
        })