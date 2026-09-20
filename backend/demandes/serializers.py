from rest_framework import serializers
from .models import Demande


class DemandeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Demande
        fields = (
            'id', 'client', 'service', 'titre', 'description',
            'budget_min', 'budget_max', 'date_souhaitee', 'urgence',
            'adresse', 'latitude', 'longitude', 'statut',
            'date_creation', 'date_modification',
        )
        read_only_fields = ('client', 'statut', 'date_creation', 'date_modification')