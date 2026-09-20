from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Utilisateur, Client, Prestataire


@receiver(post_save, sender=Utilisateur)
def creer_profil(sender, instance, created, **kwargs):
    if not created:
        return
    if instance.role == Utilisateur.Role.CLIENT:
        Client.objects.create(utilisateur=instance)
    elif instance.role == Utilisateur.Role.PRESTATAIRE:
        Prestataire.objects.create(utilisateur=instance)