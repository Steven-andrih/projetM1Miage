from rest_framework import viewsets, permissions
from .models import Mission
from .serializers import MissionSerializer


class MissionViewSet(viewsets.ModelViewSet):
    queryset = Mission.objects.all()
    serializer_class = MissionSerializer
    permission_classes = [permissions.IsAuthenticated]