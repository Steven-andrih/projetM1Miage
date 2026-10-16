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
from users.models import Utilisateur, Prestataire
from users.utils import nom_affiche, photo_url


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

        evolution_mensuelle = list(
            demandes.annotate(mois=TruncMonth('date_creation'))
            .values('mois')
            .annotate(total=Count('id'))
            .order_by('mois')
        )

        from messagerie.services import total_non_lus

        missions_a_noter = [
            {
                'id': m.id,
                'titre': m.proposition.demande.titre,
                'prestataire': nom_affiche(m.proposition.prestataire.utilisateur),
                'prestataire_photo': photo_url(m.proposition.prestataire.utilisateur),
                'date_fin': m.date_fin,
            }
            for m in missions.filter(statut=Mission.Statut.TERMINEE, avis__isnull=True)
            .select_related('proposition__demande', 'proposition__prestataire__utilisateur')
            .order_by('-date_fin')[:5]
        ]

        return Response({
            'messages_non_lus': total_non_lus(request.user),
            'missions_a_noter': missions_a_noter,
            'nb_missions_a_noter': missions.filter(statut=Mission.Statut.TERMINEE, avis__isnull=True).count(),
            'nb_demandes_total': demandes.count(),
            'demandes_par_statut': demandes_par_statut,
            'nb_missions_en_cours': missions.filter(statut=Mission.Statut.EN_COURS).count(),
            'nb_missions_terminees': missions.filter(statut=Mission.Statut.TERMINEE).count(),
            'propositions_en_attente_de_ma_decision': propositions_en_attente,
            'dernieres_demandes': dernieres_demandes,
            'evolution_mensuelle': evolution_mensuelle,
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
            client__utilisateur__is_active=True,
            service_id__in=services_ids,
            statut__in=[Demande.Statut.BROUILLON, Demande.Statut.PUBLIEE],
        ).exclude(
            propositions__prestataire=prestataire  # déjà répondu
        ).count()

        propositions_par_statut = {
            choix: propositions.filter(statut=choix).count()
            for choix, _ in Proposition.Statut.choices
        }

        evolution_mensuelle_missions = list(
            missions.annotate(mois=TruncMonth('date_debut'))
            .values('mois')
            .annotate(total=Count('id'))
            .order_by('mois')
        )

        revenus_par_mois = list(
            missions.filter(statut=Mission.Statut.TERMINEE, date_fin__isnull=False)
            .annotate(mois=TruncMonth('date_fin'))
            .values('mois')
            .annotate(total=Sum('proposition__tarif_propose'))
            .order_by('mois')
        )

        from messagerie.services import total_non_lus

        nb_terminees = missions.filter(statut=Mission.Statut.TERMINEE).count()
        revenu_moyen = round(float(revenu_total) / nb_terminees, 2) if nb_terminees else None

        derniers_avis = [
            {
                'id': a.id,
                'note': a.note,
                'commentaire': a.commentaire,
                'date_creation': a.date_creation,
                'client': nom_affiche(a.mission.proposition.demande.client.utilisateur),
                'client_photo': photo_url(a.mission.proposition.demande.client.utilisateur),
                'demande': a.mission.proposition.demande.titre,
            }
            for a in Avis.objects.filter(mission__proposition__prestataire=prestataire, visible=True)
            .select_related('mission__proposition__demande__client__utilisateur')
            .order_by('-date_creation')[:3]
        ]

        completude = {
            'description': bool((prestataire.description or '').strip()),
            'adresse': bool((prestataire.adresse or '').strip()),
            'position': prestataire.latitude is not None and prestataire.longitude is not None,
            'service': PrestataireService.objects.filter(prestataire=prestataire, actif=True).exists(),
            'document': prestataire.a_document,
        }

        return Response({
            'statut_validation': prestataire.statut_validation,
            'a_document': prestataire.a_document,
            'motif_refus': prestataire.motif_refus,
            'completude': completude,
            'revenu_moyen_par_mission': revenu_moyen,
            'derniers_avis': derniers_avis,
            'messages_non_lus': total_non_lus(request.user),
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
            'propositions_par_statut': propositions_par_statut,
            'evolution_mensuelle_missions': evolution_mensuelle_missions,
            'revenus_par_mois': revenus_par_mois,
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

        # --- Utilisateurs (hors comptes supprimés) ---
        utilisateurs = Utilisateur.objects.filter(date_suppression__isnull=True)
        nb_clients = utilisateurs.filter(role=Utilisateur.Role.CLIENT).count()
        nb_prestataires = utilisateurs.filter(role=Utilisateur.Role.PRESTATAIRE).count()
        nb_prestataires_en_attente = Prestataire.objects.filter(
            statut_validation=Prestataire.StatutValidation.EN_ATTENTE,
            utilisateur__date_suppression__isnull=True,
        ).exclude(document_identite='').exclude(document_identite__isnull=True).count()

        demandes_par_statut = {
            choix: Demande.objects.filter(statut=choix).count() for choix in Demande.Statut.values
        }
        missions_par_statut = {
            choix: Mission.objects.filter(statut=choix).count() for choix in Mission.Statut.values
        }

        # --- Évolution mensuelle des missions terminées ---
        evolution_mensuelle_missions_terminees = list(
            Mission.objects.filter(statut=Mission.Statut.TERMINEE, date_fin__isnull=False)
            .annotate(mois=TruncMonth('date_fin'))
            .values('mois')
            .annotate(total=Count('id'))
            .order_by('mois')
        )

        # --- Évolution mensuelle des missions démarrées ---
        evolution_mensuelle_missions = list(
            Mission.objects.annotate(mois=TruncMonth('date_debut'))
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
            'evolution_mensuelle_missions': evolution_mensuelle_missions,
            'evolution_mensuelle_missions_terminees': evolution_mensuelle_missions_terminees,
            'nb_clients': nb_clients,
            'nb_prestataires': nb_prestataires,
            'nb_prestataires_en_attente': nb_prestataires_en_attente,
            'demandes_par_statut': demandes_par_statut,
            'missions_par_statut': missions_par_statut,
        })