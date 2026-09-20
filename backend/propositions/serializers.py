from rest_framework import serializers
from .models import Proposition


class PropositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposition
        fields = (
            'id', 'demande', 'prestataire', 'message', 'tarif_propose',
            'statut', 'date_proposition', 'date_reponse',
        )
        read_only_fields = ('prestataire', 'date_proposition', 'date_reponse')  