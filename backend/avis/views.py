from rest_framework import viewsets, permissions
from .models import Avis
from .serializers import AvisSerializer


class AvisViewSet(viewsets.ModelViewSet):
    queryset = Avis.objects.all()
    serializer_class = AvisSerializer
    permission_classes = [permissions.IsAuthenticated]