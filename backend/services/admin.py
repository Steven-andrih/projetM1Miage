from django.contrib import admin
from .models import Categorie, Service
from .models import PrestataireService


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('nom', 'active')
    list_filter = ('active',)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('nom', 'categorie', 'active')
    list_filter = ('categorie', 'active')

@admin.register(PrestataireService)
class PrestataireServiceAdmin(admin.ModelAdmin):
    list_display = ('prestataire', 'service', 'tarif_min', 'tarif_max', 'actif')
    list_filter = ('actif',)