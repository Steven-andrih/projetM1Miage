from rest_framework.routers import DefaultRouter
from .views import CategorieViewSet, ServiceViewSet, PrestataireServiceViewSet

router = DefaultRouter()
router.register('categories', CategorieViewSet)
router.register('services', ServiceViewSet)
router.register('prestataire-services', PrestataireServiceViewSet)

urlpatterns = router.urls