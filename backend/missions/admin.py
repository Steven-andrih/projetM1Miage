from django.contrib import admin
from .models import Mission


@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'proposition', 'statut', 'date_debut', 'date_fin')
    list_filter = ('statut',)