from django.urls import path
from .views import RegisterView, ClientMeView, PrestataireMeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('client/me/', ClientMeView.as_view(), name='client-me'),
    path('prestataire/me/', PrestataireMeView.as_view(), name='prestataire-me'),
]