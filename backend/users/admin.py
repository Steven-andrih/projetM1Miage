from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur
from .models import Client, Prestataire



class UtilisateurAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'telephone', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Informations métier', {'fields': ('role', 'telephone', 'photo')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informations métier', {'fields': ('role', 'telephone', 'photo')}),
    )


admin.site.register(Utilisateur, UtilisateurAdmin)
admin.site.register(Client)
admin.site.register(Prestataire)