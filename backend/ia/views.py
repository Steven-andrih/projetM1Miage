from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .serializers import AmeliorerDescriptionSerializer
from .services import ameliorer_texte


class AmeliorerDescriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AmeliorerDescriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        texte = serializer.validated_data['texte']
        contexte = serializer.validated_data['contexte']

        try:
            texte_ameliore = ameliorer_texte(texte, contexte)
        except Exception as e:
            print("ERREUR IA:", repr(e))
            return Response(
                {'detail': "Le service IA est momentanément indisponible. Réessayez plus tard."},
                status=503,
            )

        return Response({
            'texte_original': texte,
            'texte_ameliore': texte_ameliore,
        })