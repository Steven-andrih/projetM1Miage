from django.contrib.auth.models import AbstractUser
from django.db import models


class Utilisateur(AbstractUser):
    class Role(models.TextChoices):
        CLIENT = 'CLIENT', 'Client'
        PRESTATAIRE = 'PRESTATAIRE', 'Prestataire'
        ADMIN = 'ADMIN', 'Admin'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CLIENT,
    )
    telephone = models.CharField(max_length=30, blank=True, null=True)
    photo = models.ImageField(upload_to='photos/', blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class Client(models.Model):
    utilisateur = models.OneToOneField(
        Utilisateur, on_delete=models.CASCADE, related_name='client_profile'
    )
    adresse = models.CharField(max_length=255, blank=True, null=True)
    ville = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)

    def __str__(self):
        return f"Client: {self.utilisateur.username}"


class Prestataire(models.Model):
    class StatutValidation(models.TextChoices):
        EN_ATTENTE = 'EN_ATTENTE', 'En attente'
        VALIDE = 'VALIDE', 'Validé'
        REFUSE = 'REFUSE', 'Refusé'

    utilisateur = models.OneToOneField(
        Utilisateur, on_delete=models.CASCADE, related_name='prestataire_profile'
    )
    description = models.TextField(blank=True, null=True)
    adresse = models.CharField(max_length=255, blank=True, null=True)
    ville = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    annee_experience = models.PositiveIntegerField(default=0)
    statut_validation = models.CharField(
        max_length=20, choices=StatutValidation.choices, default=StatutValidation.EN_ATTENTE
    )
    date_validation = models.DateTimeField(blank=True, null=True)
    disponible = models.BooleanField(default=True)

    def __str__(self):
        return f"Prestataire: {self.utilisateur.username}"