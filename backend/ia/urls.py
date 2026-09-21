from django.urls import path
from .views import AmeliorerDescriptionView

urlpatterns = [
    path('ia/ameliorer-description/', AmeliorerDescriptionView.as_view(), name='ia-ameliorer'),
]