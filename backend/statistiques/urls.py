from django.urls import path
from .views import DashboardView, ClientDashboardView, PrestataireDashboardView

urlpatterns = [
    path('statistiques/dashboard/', DashboardView.as_view(), name='dashboard-admin'),
    path('statistiques/dashboard/client/', ClientDashboardView.as_view(), name='dashboard-client'),
    path('statistiques/dashboard/prestataire/', PrestataireDashboardView.as_view(), name='dashboard-prestataire'),
]