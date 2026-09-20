from django.db import models
from propositions.models import Proposition


class Mission(models.Model):
    class Statut(models.TextChoices):
        EN_COURS = 'EN_COURS', 'En cours'
        TERMINEE = 'TERMINEE', 'Terminée'
        ANNULEE = 'ANNULEE', 'Annulée'

    proposition = models.OneToOneField(
        Proposition, on_delete=models.CASCADE, related_name='mission'
    )
    date_debut = models.DateTimeField(auto_now_add=True)
    date_fin = models.DateTimeField(blank=True, null=True)
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.EN_COURS)

    def __str__(self):
        return f"Mission #{self.id} - {self.proposition}"