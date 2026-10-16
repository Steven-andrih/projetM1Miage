"""Endpoints réservés à l'administrateur : gestion des comptes et vérification d'identité."""
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from demandes.models import Demande
from missions.models import Mission
from propositions.models import Proposition
from .models import Prestataire, Utilisateur
from .permissions import IsAdminRole
from .serializers import avis_prestataire, services_prestataire
from .utils import nom_affiche, note_prestataire, photo_url, stats_missions
from .views import reponse_document


def _profil(utilisateur):
    if utilisateur.role == Utilisateur.Role.CLIENT:
        return getattr(utilisateur, 'client_profile', None)
    if utilisateur.role == Utilisateur.Role.PRESTATAIRE:
        return getattr(utilisateur, 'prestataire_profile', None)
    return None


def _missions_de(utilisateur):
    if utilisateur.role == Utilisateur.Role.CLIENT:
        return Mission.objects.filter(proposition__demande__client__utilisateur=utilisateur)
    return Mission.objects.filter(proposition__prestataire__utilisateur=utilisateur)


def resume_utilisateur(utilisateur):
    profil = _profil(utilisateur)
    data = {
        'id': utilisateur.id,
        'username': utilisateur.username,
        'nom': nom_affiche(utilisateur),
        'photo': photo_url(utilisateur),
        'email': utilisateur.email,
        'telephone': utilisateur.telephone,
        'role': utilisateur.role,
        'is_active': utilisateur.is_active,
        'est_supprime': utilisateur.est_supprime,
        'date_joined': utilisateur.date_joined,
        'ville': getattr(profil, 'ville', None),
        'profil_id': getattr(profil, 'id', None),
        'nb_missions': getattr(utilisateur, 'nb_missions', None),
    }
    if utilisateur.role == Utilisateur.Role.PRESTATAIRE and profil:
        data['statut_validation'] = profil.statut_validation
        data['a_document'] = profil.a_document
    return data


class UtilisateurListView(APIView):
    """
    Liste des clients ou des prestataires.
    Paramètres : role (CLIENT|PRESTATAIRE), search, actif (true|false), statut_validation.
    """

    permission_classes = [IsAdminRole]

    def get(self, request):
        role = request.query_params.get('role')
        qs = Utilisateur.objects.exclude(role=Utilisateur.Role.ADMIN).filter(date_suppression__isnull=True)
        if role in (Utilisateur.Role.CLIENT, Utilisateur.Role.PRESTATAIRE):
            qs = qs.filter(role=role)

        search = (request.query_params.get('search') or '').strip()
        if search:
            qs = qs.filter(
                Q(username__icontains=search) | Q(first_name__icontains=search)
                | Q(last_name__icontains=search) | Q(email__icontains=search)
                | Q(telephone__icontains=search)
                | Q(client_profile__ville__icontains=search)
                | Q(prestataire_profile__ville__icontains=search)
            )

        actif = request.query_params.get('actif')
        if actif in ('true', 'false'):
            qs = qs.filter(is_active=(actif == 'true'))

        statut = request.query_params.get('statut_validation')
        if statut in Prestataire.StatutValidation.values:
            qs = qs.filter(prestataire_profile__statut_validation=statut)

        qs = qs.select_related('client_profile', 'prestataire_profile').annotate(
            nb_missions=Count('client_profile__demandes__propositions__mission', distinct=True)
            + Count('prestataire_profile__propositions__mission', distinct=True)
        ).order_by('-date_joined')

        return Response([resume_utilisateur(u) for u in qs])


def _get_utilisateur_gerable(pk, admin):
    utilisateur = get_object_or_404(Utilisateur, pk=pk)
    if utilisateur.role == Utilisateur.Role.ADMIN or utilisateur.pk == admin.pk:
        return None, Response(
            {'detail': 'Les comptes administrateurs ne peuvent pas être gérés ici.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    return utilisateur, None


class UtilisateurDetailView(APIView):
    """GET : profil détaillé. DELETE : suppression (anonymisation, historique conservé)."""

    permission_classes = [IsAdminRole]

    def get(self, request, pk):
        utilisateur, erreur = _get_utilisateur_gerable(pk, request.user)
        if erreur:
            return erreur
        profil = _profil(utilisateur)
        data = resume_utilisateur(utilisateur)
        data.update({
            'first_name': utilisateur.first_name,
            'last_name': utilisateur.last_name,
            'last_login': utilisateur.last_login,
            'date_suppression': utilisateur.date_suppression,
            'adresse': getattr(profil, 'adresse', None),
            'latitude': getattr(profil, 'latitude', None),
            'longitude': getattr(profil, 'longitude', None),
            'missions': stats_missions(_missions_de(utilisateur)),
        })

        if utilisateur.role == Utilisateur.Role.CLIENT and profil:
            demandes = Demande.objects.filter(client=profil)
            data['demandes'] = {
                'total': demandes.count(),
                'par_statut': {s: demandes.filter(statut=s).count() for s in Demande.Statut.values},
            }

        if utilisateur.role == Utilisateur.Role.PRESTATAIRE and profil:
            note, nb_avis = note_prestataire(profil)
            propositions = Proposition.objects.filter(prestataire=profil)
            data.update({
                'description': profil.description,
                'annee_experience': profil.annee_experience,
                'disponible': profil.disponible,
                'statut_validation': profil.statut_validation,
                'date_validation': profil.date_validation,
                'type_document': profil.type_document,
                'date_soumission': profil.date_soumission,
                'motif_refus': profil.motif_refus,
                'note_moyenne': note,
                'nb_avis': nb_avis,
                'propositions': {
                    'total': propositions.count(),
                    'par_statut': {s: propositions.filter(statut=s).count() for s in Proposition.Statut.values},
                },
                'services': services_prestataire(profil),
                'avis': avis_prestataire(profil, visibles_seulement=False),
            })
        return Response(data)

    def delete(self, request, pk):
        utilisateur, erreur = _get_utilisateur_gerable(pk, request.user)
        if erreur:
            return erreur
        if utilisateur.est_supprime:
            return Response({'detail': 'Ce compte est déjà supprimé.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            profil = _profil(utilisateur)
            if profil is not None:
                profil.adresse = None
                profil.latitude = None
                profil.longitude = None
                if utilisateur.role == Utilisateur.Role.PRESTATAIRE:
                    if profil.document_identite:
                        profil.document_identite.delete(save=False)
                    profil.document_identite = None
                    profil.description = None
                    profil.disponible = False
                    profil.services_proposes.update(actif=False)
                    profil.propositions.filter(statut=Proposition.Statut.EN_ATTENTE).update(
                        statut=Proposition.Statut.ANNULEE, date_reponse=timezone.now()
                    )
                else:
                    profil.demandes.filter(
                        statut__in=(Demande.Statut.BROUILLON, Demande.Statut.PUBLIEE)
                    ).update(statut=Demande.Statut.ANNULEE)
                profil.save()

            if utilisateur.photo:
                utilisateur.photo.delete(save=False)
            utilisateur.username = f"supprime_{utilisateur.pk}"
            utilisateur.first_name = ''
            utilisateur.last_name = ''
            utilisateur.email = ''
            utilisateur.telephone = None
            utilisateur.is_active = False
            utilisateur.date_suppression = timezone.now()
            utilisateur.set_unusable_password()
            utilisateur.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UtilisateurActivationView(APIView):
    """POST /admin/utilisateurs/{id}/desactiver/ ou /reactiver/."""

    permission_classes = [IsAdminRole]
    activer = None  # défini dans urls_admin.py

    def post(self, request, pk):
        utilisateur, erreur = _get_utilisateur_gerable(pk, request.user)
        if erreur:
            return erreur
        if utilisateur.est_supprime:
            return Response(
                {'detail': 'Un compte supprimé ne peut pas être réactivé.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        utilisateur.is_active = bool(self.activer)
        utilisateur.save(update_fields=['is_active'])
        return Response(resume_utilisateur(utilisateur))


# ----------------------------------------------------------------------
# Vérification d'identité des prestataires
# ----------------------------------------------------------------------

def resume_verification(prestataire):
    return {
        'id': prestataire.id,
        'utilisateur_id': prestataire.utilisateur_id,
        'nom': nom_affiche(prestataire.utilisateur),
        'photo': photo_url(prestataire.utilisateur),
        'username': prestataire.utilisateur.username,
        'email': prestataire.utilisateur.email,
        'telephone': prestataire.utilisateur.telephone,
        'ville': prestataire.ville,
        'annee_experience': prestataire.annee_experience,
        'statut_validation': prestataire.statut_validation,
        'type_document': prestataire.type_document,
        'date_soumission': prestataire.date_soumission,
        'date_validation': prestataire.date_validation,
        'motif_refus': prestataire.motif_refus,
        'a_document': prestataire.a_document,
    }


class VerificationListView(APIView):
    """Prestataires ayant envoyé un document. Paramètre statut (par défaut EN_ATTENTE, ou TOUS)."""

    permission_classes = [IsAdminRole]

    def get(self, request):
        statut = request.query_params.get('statut', Prestataire.StatutValidation.EN_ATTENTE)
        qs = Prestataire.objects.select_related('utilisateur').filter(
            utilisateur__date_suppression__isnull=True
        ).exclude(document_identite='').exclude(document_identite__isnull=True)
        if statut in Prestataire.StatutValidation.values:
            qs = qs.filter(statut_validation=statut)
        return Response([resume_verification(p) for p in qs.order_by('date_soumission')])


class PrestataireDocumentAdminView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request, pk):
        return reponse_document(get_object_or_404(Prestataire, pk=pk))


class PrestataireDecisionView(APIView):
    """POST /admin/prestataires/{id}/valider/ ou /refuser/ (body : motif)."""

    permission_classes = [IsAdminRole]
    decision = None  # 'valider' ou 'refuser', défini dans urls_admin.py

    def post(self, request, pk):
        prestataire = get_object_or_404(Prestataire.objects.select_related('utilisateur'), pk=pk)
        if not prestataire.a_document:
            return Response(
                {'detail': "Ce prestataire n'a pas encore envoyé de pièce d'identité."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if self.decision == 'valider':
            prestataire.statut_validation = Prestataire.StatutValidation.VALIDE
            prestataire.date_validation = timezone.now()
            prestataire.motif_refus = ''
        else:
            motif = (request.data.get('motif') or '').strip()
            if not motif:
                return Response({'motif': ['Le motif du refus est obligatoire.']}, status=status.HTTP_400_BAD_REQUEST)
            prestataire.statut_validation = Prestataire.StatutValidation.REFUSE
            prestataire.date_validation = None
            prestataire.motif_refus = motif[:1000]
        prestataire.save()
        return Response(resume_verification(prestataire))
