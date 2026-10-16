from django.db.models import Max
from django.db.models.functions import Coalesce
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from . import services
from .models import Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Conversations de l'utilisateur connecté (lecture seule de toutes pour l'admin).
    Les messages se lisent et s'envoient via /conversations/{id}/messages/.
    """

    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            services.conversations_de(self.request.user)
            .annotate(dernier=Coalesce(Max('messages__date_envoi'), 'date_creation'))
            .order_by('-dernier')
        )

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        conversation = self.get_object()

        if request.method == 'GET':
            qs = conversation.messages.select_related('auteur')
            apres = request.query_params.get('apres')
            if apres and apres.isdigit():
                qs = qs.filter(id__gt=int(apres))
            return Response(MessageSerializer(qs, many=True, context={'request': request}).data)

        if services.role_participant(conversation, request.user) is None:
            raise PermissionDenied("Seuls les participants peuvent écrire dans cette conversation.")
        if not services.peut_ecrire(conversation):
            return Response(
                {'detail': 'Cette conversation est en lecture seule.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = MessageSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        message = serializer.save(conversation=conversation, auteur=request.user, type=Message.Type.NORMAL)
        services.marquer_lu(conversation, request.user)
        return Response(
            MessageSerializer(message, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'])
    def lire(self, request, pk=None):
        conversation = self.get_object()
        services.marquer_lu(conversation, request.user)
        return Response({'non_lus': 0})

    @action(detail=False, methods=['get'], url_path='non-lus')
    def non_lus(self, request):
        return Response({'non_lus': services.total_non_lus(request.user)})
