from django.urls import path
from .views import (
    ClientMeView,
    PrestataireCarteListView,
    PrestataireDocumentView,
    PrestataireMeView,
    PrestatairePublicView,
    RegisterView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('client/me/', ClientMeView.as_view(), name='client-me'),
    path('prestataire/me/', PrestataireMeView.as_view(), name='prestataire-me'),
    path('prestataire/me/document/', PrestataireDocumentView.as_view(), name='prestataire-me-document'),
    path('prestataires/carte/', PrestataireCarteListView.as_view(), name='prestataires-carte'),
    path('prestataires/<int:pk>/', PrestatairePublicView.as_view(), name='prestataire-public'),
]
