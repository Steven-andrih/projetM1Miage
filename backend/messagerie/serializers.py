from rest_framework import serializers

from users.utils import nom_affiche, photo_url
from . import services
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.SerializerMethodField()
    auteur_photo = serializers.SerializerMethodField()
    est_moi = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('id', 'type', 'contenu', 'date_envoi', 'auteur', 'auteur_nom', 'auteur_photo', 'est_moi')
        read_only_fields = ('id', 'type', 'date_envoi', 'auteur', 'auteur_nom', 'auteur_photo', 'est_moi')

    def get_auteur_nom(self, obj):
        return None if obj.type == Message.Type.SYSTEME else nom_affiche(obj.auteur)

    def get_auteur_photo(self, obj):
        return None if obj.type == Message.Type.SYSTEME else photo_url(obj.auteur)

    def get_est_moi(self, obj):
        request = self.context.get('request')
        return bool(request and obj.auteur_id == request.user.id)

    def validate_contenu(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('Le message ne peut pas être vide.')
        if len(value) > 2000:
            raise serializers.ValidationError('Le message est limité à 2000 caractères.')
        return value


class ConversationSerializer(serializers.ModelSerializer):
    """Conversation avec son contexte (demande, tarif, statut) et les non-lus de l'utilisateur."""

    proposition = serializers.SerializerMethodField()
    demande = serializers.SerializerMethodField()
    client = serializers.SerializerMethodField()
    prestataire = serializers.SerializerMethodField()
    dernier_message = serializers.SerializerMethodField()
    non_lus = serializers.SerializerMethodField()
    peut_ecrire = serializers.SerializerMethodField()
    mon_role = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            'id', 'proposition', 'demande', 'client', 'prestataire',
            'dernier_message', 'non_lus', 'peut_ecrire', 'mon_role', 'date_creation',
        )

    def _user(self):
        return self.context['request'].user

    def get_proposition(self, obj):
        p = obj.proposition
        return {'id': p.id, 'tarif_propose': p.tarif_propose, 'statut': p.statut, 'message': p.message}

    def get_demande(self, obj):
        d = obj.proposition.demande
        return {
            'id': d.id, 'titre': d.titre, 'statut': d.statut,
            'budget_min': d.budget_min, 'budget_max': d.budget_max,
        }

    def get_client(self, obj):
        c = obj.proposition.demande.client
        return {'id': c.id, 'nom': nom_affiche(c.utilisateur), 'photo': photo_url(c.utilisateur)}

    def get_prestataire(self, obj):
        p = obj.proposition.prestataire
        return {
            'id': p.id, 'nom': nom_affiche(p.utilisateur),
            'photo': photo_url(p.utilisateur), 'verifie': p.est_verifie,
        }

    def get_dernier_message(self, obj):
        dernier = obj.messages.order_by('-date_envoi', '-id').first()
        if not dernier:
            return None
        return {
            'contenu': dernier.contenu,
            'type': dernier.type,
            'date_envoi': dernier.date_envoi,
            'est_moi': dernier.auteur_id == self._user().id,
        }

    def get_non_lus(self, obj):
        return services.messages_non_lus(obj, self._user()).count()

    def get_peut_ecrire(self, obj):
        return services.peut_ecrire(obj, self._user())

    def get_mon_role(self, obj):
        return services.role_participant(obj, self._user())
