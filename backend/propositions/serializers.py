from rest_framework import serializers

from users.utils import resume_prestataire
from .models import Proposition


class PropositionSerializer(serializers.ModelSerializer):
    # Résumé public du prestataire (nom, badge vérifié, note, expérience)
    prestataire_info = serializers.SerializerMethodField()
    # Conversation liée et nombre de messages non lus pour l'utilisateur connecté
    conversation = serializers.SerializerMethodField()

    class Meta:
        model = Proposition
        fields = (
            'id', 'demande', 'prestataire', 'prestataire_info', 'message', 'tarif_propose',
            'statut', 'date_proposition', 'date_reponse', 'conversation',
        )
        # Le statut n'évolue que via les actions accepter / refuser.
        read_only_fields = ('prestataire', 'statut', 'date_proposition', 'date_reponse')

    def get_prestataire_info(self, obj):
        return resume_prestataire(obj.prestataire)

    def get_conversation(self, obj):
        from messagerie import services
        from messagerie.models import Conversation

        conversation = Conversation.objects.filter(proposition=obj).first()
        if not conversation:
            return None
        request = self.context.get('request')
        non_lus = services.messages_non_lus(conversation, request.user).count() if request else 0
        return {'id': conversation.id, 'non_lus': non_lus}

    def validate(self, attrs):
        if self.instance is not None:
            if 'demande' in attrs and attrs['demande'] != self.instance.demande:
                raise serializers.ValidationError({'demande': 'La demande ne peut pas être modifiée.'})
            if self.instance.statut != Proposition.Statut.EN_ATTENTE:
                raise serializers.ValidationError(
                    'Seule une proposition en attente peut être modifiée.'
                )
        tarif = attrs.get('tarif_propose')
        if tarif is not None and tarif <= 0:
            raise serializers.ValidationError({'tarif_propose': 'Le tarif doit être positif.'})
        return attrs
