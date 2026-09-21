from django.urls import path
from .views import DashboardView

urlpatterns = [
    path('statistiques/dashboard/', DashboardView.as_view(), name='dashboard'),
]