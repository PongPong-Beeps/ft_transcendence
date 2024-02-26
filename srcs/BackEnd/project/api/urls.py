from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index, name='api'),
    path('login/', include('login.urls')),
]
