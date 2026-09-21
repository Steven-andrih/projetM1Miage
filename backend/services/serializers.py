from rest_framework import serializers
from .models import Categorie, Service
from .models import PrestataireService


class PrestataireServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrestataireService
        fields = ('id', 'prestataire', 'service', 'tarif_min', 'tarif_max', 'actif')
        read_only_fields = ('prestataire',)

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ('id', 'categorie', 'nom', 'description', 'active')


class CategorieSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Categorie
        fields = ('id', 'nom', 'description', 'active', 'services')