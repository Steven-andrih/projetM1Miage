from django.urls import path
from .views import RegisterView, ClientMeView, PrestataireMeView, PrestataireCarteListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('client/me/', ClientMeView.as_view(), name='client-me'),
    path('prestataire/me/', PrestataireMeView.as_view(), name='prestataire-me'),
    path('prestataires/carte/', PrestataireCarteListView.as_view(), name='prestataires-carte'),
]