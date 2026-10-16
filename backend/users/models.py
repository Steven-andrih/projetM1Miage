from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.files.storage import FileSystemStorage
from django.db import models


# Les pièces d'identité ne sont jamais servies publiquement : elles sont
# stockées hors de MEDIA_ROOT et uniquement lues par des vues authentifiées.
document_storage = FileSystemStorage(location=settings.PRIVATE_MEDIA_ROOT)


def chemin_document_identite(instance, filename):
    extension = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'jpg'
    return f"documents_identite/prestataire_{instance.pk}.{extension}"


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
    # Renseignée quand l'admin supprime le compte : l'utilisateur est alors
    # anonymisé et désactivé, mais son historique (missions, avis) est conservé.
    date_suppression = models.DateTimeField(blank=True, null=True)

    @property
    def est_supprime(self):
        return self.date_suppression is not None

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

    class TypeDocument(models.TextChoices):
        CIN = 'CIN', "Carte d'identité nationale"
        PASSEPORT = 'PASSEPORT', 'Passeport'
        PERMIS = 'PERMIS', 'Permis de conduire'

    document_identite = models.FileField(
        upload_to=chemin_document_identite, storage=document_storage, blank=True, null=True
    )
    type_document = models.CharField(max_length=20, choices=TypeDocument.choices, blank=True)
    date_soumission = models.DateTimeField(blank=True, null=True)
    motif_refus = models.TextField(blank=True)

    @property
    def a_document(self):
        return bool(self.document_identite)

    @property
    def est_verifie(self):
        return self.statut_validation == self.StatutValidation.VALIDE

    def __str__(self):
        return f"Prestataire: {self.utilisateur.username}"