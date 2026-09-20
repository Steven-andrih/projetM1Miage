from django.db import models
from users.models import Client
from services.models import Service


class Demande(models.Model):
    class Statut(models.TextChoices):
        BROUILLON = 'BROUILLON', 'Brouillon'
        PUBLIEE = 'PUBLIEE', 'Publiée'
        EN_COURS = 'EN_COURS', 'En cours'
        TERMINEE = 'TERMINEE', 'Terminée'
        ANNULEE = 'ANNULEE', 'Annulée'

    class Urgence(models.TextChoices):
        FAIBLE = 'FAIBLE', 'Faible'
        NORMALE = 'NORMALE', 'Normale'
        URGENTE = 'URGENTE', 'Urgente'

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='demandes')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='demandes')
    titre = models.CharField(max_length=200)
    description = models.TextField()
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    date_souhaitee = models.DateField()
    urgence = models.CharField(max_length=20, choices=Urgence.choices, default=Urgence.NORMALE)
    adresse = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.BROUILLON)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.titre} ({self.client.utilisateur.username})"