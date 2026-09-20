from django.contrib import admin
from .models import Demande

# Register your models here.
@admin.register(Demande)
class DemandeAdmin(admin.ModelAdmin):
    list_display = ('titre', 'client', 'service', 'statut', 'date_creation')
    list_filter = ('statut', 'urgence')