from django.urls import path
from .views import login42TestView

urlpatterns = [
    path('42/', login42TestView.as_view(), name='42login'),
]
