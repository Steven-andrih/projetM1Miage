from django.db import models
from users.models import Prestataire


class Categorie(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.nom


class Service(models.Model):
    categorie = models.ForeignKey(
        Categorie, on_delete=models.CASCADE, related_name='services'
    )
    nom = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nom} ({self.categorie.nom})"

class PrestataireService(models.Model):
    prestataire = models.ForeignKey(
        Prestataire, on_delete=models.CASCADE, related_name='services_proposes'
    )
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE, related_name='prestataires'
    )
    tarif_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    tarif_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    actif = models.BooleanField(default=True)

    class Meta:
        unique_together = ('prestataire', 'service')

    def __str__(self):
        return f"{self.prestataire.utilisateur.username} -> {self.service.nom}"