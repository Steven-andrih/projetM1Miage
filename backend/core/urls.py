from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/', include('users.urls')),
    path('api/', include('services.urls')),
    path('api/', include('demandes.urls')),
    path('api/', include('propositions.urls')),
    path('api/', include('missions.urls')),
    path('api/', include('avis.urls')),
    path('api/', include('statistiques.urls')),
    path('api/', include('ia.urls')),



]