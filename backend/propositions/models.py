from django.db import models
from users.models import Prestataire
from demandes.models import Demande


class Proposition(models.Model):
    class Statut(models.TextChoices):
        EN_ATTENTE = 'EN_ATTENTE', 'En attente'
        ACCEPTEE = 'ACCEPTEE', 'Acceptée'
        REFUSEE = 'REFUSEE', 'Refusée'
        ANNULEE = 'ANNULEE', 'Annulée'

    demande = models.ForeignKey(Demande, on_delete=models.CASCADE, related_name='propositions')
    prestataire = models.ForeignKey(Prestataire, on_delete=models.CASCADE, related_name='propositions')
    message = models.TextField(blank=True, null=True)
    tarif_propose = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    date_proposition = models.DateTimeField(auto_now_add=True)
    date_reponse = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('demande', 'prestataire')

    def __str__(self):
        return f"Proposition {self.prestataire.utilisateur.username} -> {self.demande.titre}"