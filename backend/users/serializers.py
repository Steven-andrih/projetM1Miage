from rest_framework import serializers
from .models import Utilisateur


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Utilisateur
        fields = ('id', 'username', 'email', 'password', 'role', 'telephone')

    def create(self, validated_data):
        return Utilisateur.objects.create_user(**validated_data)