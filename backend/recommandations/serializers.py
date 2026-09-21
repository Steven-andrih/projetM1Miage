from rest_framework import serializers
from .models import Recommandation


class RecommandationSerializer(serializers.ModelSerializer):
    prestataire_username = serializers.CharField(source='prestataire.utilisateur.username', read_only=True)

    class Meta:
        model = Recommandation
        fields = (
            'id', 'demande', 'prestataire', 'prestataire_username',
            'score_global', 'score_proximite', 'score_note',
            'score_disponibilite', 'score_experience', 'score_missions',
            'position', 'justification', 'date_calcul',
        )