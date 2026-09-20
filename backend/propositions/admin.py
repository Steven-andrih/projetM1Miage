from django.contrib import admin
from .models import Proposition


@admin.register(Proposition)
class PropositionAdmin(admin.ModelAdmin):
    list_display = ('demande', 'prestataire', 'tarif_propose', 'statut', 'date_proposition')
    list_filter = ('statut',)