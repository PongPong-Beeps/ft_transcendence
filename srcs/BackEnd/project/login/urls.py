from django.urls import path
from .views import login42TestView, login42CallbackView

urlpatterns = [
    path('42/', login42TestView.as_view(), name='42login'),
    path('42/callback/', login42CallbackView.as_view(), name='42callback'),
]
