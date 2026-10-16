import mimetypes

from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Client, Prestataire
from .photos import PhotoProfilSerializer, preparer_photo
from .permissions import IsPrestataireRole
from .serializers import (
    ClientProfileSerializer,
    DocumentIdentiteSerializer,
    PrestataireCarteSerializer,
    PrestataireProfileSerializer,
    RegisterSerializer,
    avis_prestataire,
    services_prestataire,
)
from .utils import nom_affiche, note_prestataire, photo_url, stats_missions


def reponse_document(prestataire):
    """Diffuse la pièce d'identité d'un prestataire (jamais via une URL publique)."""
    if not prestataire.document_identite:
        raise NotFound("Aucun document d'identité n'a été envoyé.")
    try:
        fichier = prestataire.document_identite.open('rb')
    except FileNotFoundError:
        raise NotFound('Le fichier du document est introuvable.')
    type_mime = mimetypes.guess_type(prestataire.document_identite.name)[0] or 'application/octet-stream'
    reponse = FileResponse(fichier, content_type=type_mime)
    reponse['Cache-Control'] = 'private, no-store'
    reponse['X-Content-Type-Options'] = 'nosniff'
    return reponse


def donnees_compte(utilisateur):
    return {
        'id': utilisateur.id,
        'username': utilisateur.username,
        'first_name': utilisateur.first_name,
        'last_name': utilisateur.last_name,
        'nom': nom_affiche(utilisateur),
        'email': utilisateur.email,
        'telephone': utilisateur.telephone,
        'role': utilisateur.role,
        'photo': photo_url(utilisateur),
    }


class MeView(APIView):
    """Compte de l'utilisateur connecté, quel que soit son rôle."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(donnees_compte(request.user))


class MaPhotoView(APIView):
    """
    POST   : envoie ou remplace sa photo de profil (multipart : photo).
    DELETE : retire sa photo de profil.
    La photo est publique : visible par tous les utilisateurs, partout dans l'application.
    """

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = PhotoProfilSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        utilisateur = request.user
        nom, contenu = preparer_photo(serializer.validated_data['photo'], utilisateur)
        ancienne = utilisateur.photo.name if utilisateur.photo else None
        utilisateur.photo.save(nom, contenu, save=True)
        if ancienne:
            utilisateur.photo.storage.delete(ancienne)
        return Response(donnees_compte(utilisateur), status=status.HTTP_201_CREATED)

    def delete(self, request):
        utilisateur = request.user
        if utilisateur.photo:
            utilisateur.photo.delete(save=True)
        return Response(donnees_compte(utilisateur))


class PrestataireCarteListView(generics.ListAPIView):
    serializer_class = PrestataireCarteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Prestataire.objects.filter(
            statut_validation=Prestataire.StatutValidation.VALIDE,
            utilisateur__is_active=True,
            latitude__isnull=False,
            longitude__isnull=False,
        )


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ClientMeView(generics.RetrieveUpdateAPIView):
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return self.request.user.client_profile
        except Client.DoesNotExist:
            raise NotFound("Aucun profil client pour cet utilisateur.")


class PrestataireMeView(generics.RetrieveUpdateAPIView):
    serializer_class = PrestataireProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return self.request.user.prestataire_profile
        except Prestataire.DoesNotExist:
            raise NotFound("Aucun profil prestataire pour cet utilisateur.")


class PrestataireDocumentView(APIView):
    """
    GET  : le prestataire consulte sa propre pièce d'identité.
    POST : il l'envoie ou la remplace (multipart : type_document, document).
    Un nouvel envoi remet le statut de validation « en attente ».
    """

    permission_classes = [IsPrestataireRole]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        return reponse_document(request.user.prestataire_profile)

    def post(self, request):
        prestataire = request.user.prestataire_profile
        if prestataire.statut_validation == Prestataire.StatutValidation.VALIDE:
            return Response(
                {'detail': 'Votre profil est déjà vérifié : le document ne peut plus être remplacé.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = DocumentIdentiteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if prestataire.document_identite:
            prestataire.document_identite.delete(save=False)
        prestataire.document_identite = serializer.validated_data['document']
        prestataire.type_document = serializer.validated_data['type_document']
        prestataire.date_soumission = timezone.now()
        prestataire.statut_validation = Prestataire.StatutValidation.EN_ATTENTE
        prestataire.motif_refus = ''
        prestataire.date_validation = None
        prestataire.save()
        return Response(PrestataireProfileSerializer(prestataire).data, status=status.HTTP_201_CREATED)


class PrestatairePublicView(APIView):
    """Profil public d'un prestataire, consulté par les clients depuis une proposition."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        prestataire = get_object_or_404(
            Prestataire.objects.select_related('utilisateur'),
            pk=pk, utilisateur__is_active=True,
        )
        from missions.models import Mission

        note, nb_avis = note_prestataire(prestataire)
        missions = Mission.objects.filter(proposition__prestataire=prestataire)
        return Response({
            'id': prestataire.id,
            'nom': nom_affiche(prestataire.utilisateur),
            'photo': photo_url(prestataire.utilisateur),
            'ville': prestataire.ville,
            'description': prestataire.description,
            'annee_experience': prestataire.annee_experience,
            'disponible': prestataire.disponible,
            'verifie': prestataire.est_verifie,
            'membre_depuis': prestataire.utilisateur.date_joined,
            'note_moyenne': note,
            'nb_avis': nb_avis,
            'missions': stats_missions(missions),
            'services': services_prestataire(prestataire, actifs_seulement=True),
            'avis': avis_prestataire(prestataire, visibles_seulement=True, limite=10),
        })
