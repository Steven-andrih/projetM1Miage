from django.conf import settings
from PIL import Image, UnidentifiedImageError
from rest_framework import serializers

from .models import Utilisateur, Client, Prestataire
from .utils import nom_affiche


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ('id', 'adresse', 'ville', 'latitude', 'longitude')


class PrestataireProfileSerializer(serializers.ModelSerializer):
    a_document = serializers.BooleanField(read_only=True)

    class Meta:
        model = Prestataire
        fields = (
            'id', 'description', 'adresse', 'ville', 'latitude', 'longitude',
            'annee_experience', 'statut_validation', 'disponible',
            'a_document', 'type_document', 'date_soumission', 'motif_refus', 'date_validation',
        )
        read_only_fields = (
            'statut_validation', 'type_document', 'date_soumission', 'motif_refus', 'date_validation',
        )


class DocumentIdentiteSerializer(serializers.Serializer):
    """Envoi (multipart) de la pièce d'identité d'un prestataire."""

    type_document = serializers.ChoiceField(choices=Prestataire.TypeDocument.choices)
    document = serializers.FileField()

    def validate_document(self, fichier):
        extension = fichier.name.rsplit('.', 1)[-1].lower() if '.' in fichier.name else ''
        if extension not in settings.DOCUMENT_IDENTITE_EXTENSIONS:
            raise serializers.ValidationError('Formats acceptés : JPG, PNG ou WEBP.')
        if fichier.size > settings.DOCUMENT_IDENTITE_TAILLE_MAX:
            raise serializers.ValidationError('Le fichier ne doit pas dépasser 5 Mo.')
        try:
            image = Image.open(fichier)
            image.verify()
        except (UnidentifiedImageError, OSError):
            raise serializers.ValidationError("Le fichier n'est pas une image valide.")
        finally:
            fichier.seek(0)
        return fichier


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Utilisateur
        fields = ('id', 'username', 'email', 'password', 'role', 'telephone')

    def create(self, validated_data):
        return Utilisateur.objects.create_user(**validated_data)


class PrestataireCarteSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='utilisateur.username', read_only=True)

    class Meta:
        model = Prestataire
        fields = (
            'id', 'username', 'ville', 'latitude', 'longitude',
            'annee_experience', 'disponible',
        )


# ----------------------------------------------------------------------
# Profil public d'un prestataire (vu par les clients)
# ----------------------------------------------------------------------

def services_prestataire(prestataire, actifs_seulement=False):
    qs = prestataire.services_proposes.select_related('service__categorie').order_by('service__nom')
    if actifs_seulement:
        qs = qs.filter(actif=True)
    return [
        {
            'id': ps.id,
            'service': ps.service.nom,
            'categorie': ps.service.categorie.nom,
            'tarif_min': ps.tarif_min,
            'tarif_max': ps.tarif_max,
            'actif': ps.actif,
        }
        for ps in qs
    ]


def avis_prestataire(prestataire, visibles_seulement=True, limite=None):
    from avis.models import Avis

    qs = Avis.objects.filter(mission__proposition__prestataire=prestataire).select_related(
        'mission__proposition__demande__client__utilisateur'
    ).order_by('-date_creation')
    if visibles_seulement:
        qs = qs.filter(visible=True)
    if limite:
        qs = qs[:limite]
    return [
        {
            'id': a.id,
            'note': a.note,
            'commentaire': a.commentaire,
            'date_creation': a.date_creation,
            'visible': a.visible,
            'client': nom_affiche(a.mission.proposition.demande.client.utilisateur),
            'demande': a.mission.proposition.demande.titre,
        }
        for a in qs
    ]
