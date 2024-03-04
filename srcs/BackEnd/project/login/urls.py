from django.urls import path
from .views import Login42TestView, Login42CallbackView

urlpatterns = [
    path('42/', Login42TestView.as_view(), name='42login'),
    path('42/callback/', Login42CallbackView.as_view(), name='42callback'),
]
