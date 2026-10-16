from rest_framework import serializers
from users.utils import nom_affiche, photo_url
from .models import Recommandation


class RecommandationSerializer(serializers.ModelSerializer):
    prestataire_username = serializers.CharField(source='prestataire.utilisateur.username', read_only=True)
    prestataire_nom = serializers.SerializerMethodField()
    prestataire_photo = serializers.SerializerMethodField()
    prestataire_verifie = serializers.BooleanField(source='prestataire.est_verifie', read_only=True)

    class Meta:
        model = Recommandation
        fields = (
            'id', 'demande', 'prestataire', 'prestataire_username',
            'prestataire_nom', 'prestataire_photo', 'prestataire_verifie',
            'score_global', 'score_proximite', 'score_note',
            'score_disponibilite', 'score_experience', 'score_missions',
            'position', 'justification', 'date_calcul',
        )

    def get_prestataire_nom(self, obj):
        return nom_affiche(obj.prestataire.utilisateur)

    def get_prestataire_photo(self, obj):
        return photo_url(obj.prestataire.utilisateur)
