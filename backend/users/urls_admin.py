from django.urls import path
from .views_admin import (
    PrestataireDecisionView,
    PrestataireDocumentAdminView,
    UtilisateurActivationView,
    UtilisateurDetailView,
    UtilisateurListView,
    VerificationListView,
)

urlpatterns = [
    path('utilisateurs/', UtilisateurListView.as_view(), name='admin-utilisateurs'),
    path('utilisateurs/<int:pk>/', UtilisateurDetailView.as_view(), name='admin-utilisateur'),
    path('utilisateurs/<int:pk>/desactiver/', UtilisateurActivationView.as_view(activer=False), name='admin-utilisateur-desactiver'),
    path('utilisateurs/<int:pk>/reactiver/', UtilisateurActivationView.as_view(activer=True), name='admin-utilisateur-reactiver'),
    path('verifications/', VerificationListView.as_view(), name='admin-verifications'),
    path('prestataires/<int:pk>/document/', PrestataireDocumentAdminView.as_view(), name='admin-prestataire-document'),
    path('prestataires/<int:pk>/valider/', PrestataireDecisionView.as_view(decision='valider'), name='admin-prestataire-valider'),
    path('prestataires/<int:pk>/refuser/', PrestataireDecisionView.as_view(decision='refuser'), name='admin-prestataire-refuser'),
]
