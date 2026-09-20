from rest_framework.routers import DefaultRouter
from .views import CategorieViewSet, ServiceViewSet

router = DefaultRouter()
router.register('categories', CategorieViewSet)
router.register('services', ServiceViewSet)

urlpatterns = router.urls