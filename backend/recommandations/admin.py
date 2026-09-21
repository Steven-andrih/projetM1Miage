from django.contrib import admin
from .models import Recommandation


@admin.register(Recommandation)
class RecommandationAdmin(admin.ModelAdmin):
    list_display = ('demande', 'prestataire', 'score_global', 'position', 'date_calcul')
    list_filter = ('demande',)
    ordering = ('demande', 'position')