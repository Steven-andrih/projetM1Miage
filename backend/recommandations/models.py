from django.db import models
from demandes.models import Demande
from users.models import Prestataire


class Recommandation(models.Model):
    demande = models.ForeignKey(Demande, on_delete=models.CASCADE, related_name='recommandations')
    prestataire = models.ForeignKey(Prestataire, on_delete=models.CASCADE, related_name='recommandations')
    score_global = models.DecimalField(max_digits=5, decimal_places=2)
    score_proximite = models.DecimalField(max_digits=5, decimal_places=2)
    score_note = models.DecimalField(max_digits=5, decimal_places=2)
    score_disponibilite = models.DecimalField(max_digits=5, decimal_places=2)
    score_experience = models.DecimalField(max_digits=5, decimal_places=2)
    score_missions = models.DecimalField(max_digits=5, decimal_places=2)
    position = models.PositiveIntegerField()
    justification = models.TextField()
    date_calcul = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('demande', 'prestataire')
        ordering = ['position']

    def __str__(self):
        return f"{self.prestataire.utilisateur.username} -> {self.demande.titre} ({self.score_global})"