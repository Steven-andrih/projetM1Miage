from django.conf import settings
from django.db import models

from propositions.models import Proposition


class Conversation(models.Model):
    """Discussion entre le client et le prestataire, rattachée à une proposition."""

    proposition = models.OneToOneField(
        Proposition, on_delete=models.CASCADE, related_name='conversation'
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    # Dernière lecture de chaque participant : sert au calcul des non-lus.
    dernier_lu_client = models.DateTimeField(blank=True, null=True)
    dernier_lu_prestataire = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Conversation #{self.pk} - {self.proposition}"


class Message(models.Model):
    class Type(models.TextChoices):
        NORMAL = 'NORMAL', 'Message'
        SYSTEME = 'SYSTEME', 'Message système'

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name='messages'
    )
    # Vide pour un message système
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True,
        related_name='messages_envoyes',
    )
    type = models.CharField(max_length=10, choices=Type.choices, default=Type.NORMAL)
    contenu = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('date_envoi', 'id')

    def __str__(self):
        return f"Message #{self.pk} ({self.type})"
