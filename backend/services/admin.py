from django.contrib import admin
from .models import Categorie, Service


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('nom', 'active')
    list_filter = ('active',)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('nom', 'categorie', 'active')
    list_filter = ('categorie', 'active')