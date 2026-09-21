from rest_framework import viewsets
from .models import Categorie, Service, PrestataireService
from .serializers import CategorieSerializer, ServiceSerializer, PrestataireServiceSerializer
from .permissions import IsAdminOrReadOnly, PrestataireServicePermission


class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [IsAdminOrReadOnly]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]


class PrestataireServiceViewSet(viewsets.ModelViewSet):
    queryset = PrestataireService.objects.all()
    serializer_class = PrestataireServiceSerializer
    permission_classes = [PrestataireServicePermission]

    def perform_create(self, serializer):
        serializer.save(prestataire=self.request.user.prestataire_profile)