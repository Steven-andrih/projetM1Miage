from rest_framework import serializers


class AmeliorerDescriptionSerializer(serializers.Serializer):
    texte = serializers.CharField(max_length=2000)
    contexte = serializers.ChoiceField(
        choices=['annonce', 'service'], default='annonce'
    )