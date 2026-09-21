from django.db.models import Count, Avg, F
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from demandes.models import Demande
from propositions.models import Proposition
from missions.models import Mission


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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