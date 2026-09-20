from rest_framework.routers import DefaultRouter
from .views import PropositionViewSet

router = DefaultRouter()
router.register('propositions', PropositionViewSet)

urlpatterns = router.urls