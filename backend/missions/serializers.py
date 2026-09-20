from rest_framework import serializers
from .models import Mission


class MissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mission
        fields = ('id', 'proposition', 'statut', 'date_debut', 'date_fin')
        read_only_fields = ('proposition', 'date_debut')