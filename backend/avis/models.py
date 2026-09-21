from django.db import models
from missions.models import Mission


class Avis(models.Model):
    mission = models.OneToOneField(Mission, on_delete=models.CASCADE, related_name='avis')
    note = models.PositiveSmallIntegerField()
    commentaire = models.TextField(blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    visible = models.BooleanField(default=True)

    def __str__(self):
        return f"Avis mission #{self.mission_id} - {self.note}/5"