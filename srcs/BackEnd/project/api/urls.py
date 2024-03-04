from django.urls import path, include
from . import views
from .views import CustomTokenRefreshView

urlpatterns = [
    path('', views.Index.as_view(), name='api'),
    path('login/', include('login.urls')),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
]
