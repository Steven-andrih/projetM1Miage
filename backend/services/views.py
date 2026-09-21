from rest_framework import viewsets, permissions
from .models import Categorie, Service
from .serializers import CategorieSerializer, ServiceSerializer
from .models import PrestataireService
from .serializers import PrestataireServiceSerializer


class PrestataireServiceViewSet(viewsets.ModelViewSet):
    queryset = PrestataireService.objects.all()
    serializer_class = PrestataireServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(prestataire=self.request.user.prestataire_profile)

class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]