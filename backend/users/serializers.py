from rest_framework import serializers
from .models import Utilisateur
from .models import Client, Prestataire


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ('id', 'adresse', 'ville', 'latitude', 'longitude')


class PrestataireProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prestataire
        fields = (
            'id', 'description', 'adresse', 'ville', 'latitude', 'longitude',
            'annee_experience', 'statut_validation', 'disponible',
        )
        read_only_fields = ('statut_validation',)

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