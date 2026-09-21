from rest_framework import generics, permissions
from rest_framework import generics, permissions
from rest_framework import generics, permissions
from .serializers import RegisterSerializer
from .models import Client, Prestataire
from .serializers import RegisterSerializer, ClientProfileSerializer, PrestataireProfileSerializer,PrestataireCarteSerializer
from .models import Prestataire


class PrestataireCarteListView(generics.ListAPIView):
    serializer_class = PrestataireCarteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Prestataire.objects.filter(
            statut_validation=Prestataire.StatutValidation.VALIDE,
            latitude__isnull=False,
            longitude__isnull=False,
        )

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ClientMeView(generics.RetrieveUpdateAPIView):
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.client_profile


class PrestataireMeView(generics.RetrieveUpdateAPIView):
    serializer_class = PrestataireProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.prestataire_profile

    