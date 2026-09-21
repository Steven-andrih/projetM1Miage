from rest_framework import serializers
from .models import Avis
from missions.models import Mission


class AvisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avis
        fields = ('id', 'mission', 'note', 'commentaire', 'date_creation', 'visible')
        read_only_fields = ('date_creation', 'visible')

    def validate_note(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être comprise entre 1 et 5.")
        return value

    def validate_mission(self, mission):
        if mission.statut != Mission.Statut.TERMINEE:
            raise serializers.ValidationError("La mission doit être terminée pour laisser un avis.")

        request = self.context['request']
        if mission.proposition.demande.client.utilisateur != request.user:
            raise serializers.ValidationError("Vous n'êtes pas le client de cette mission.")

        if hasattr(mission, 'avis'):
            raise serializers.ValidationError("Un avis existe déjà pour cette mission.")

        return mission