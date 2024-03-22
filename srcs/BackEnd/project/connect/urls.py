from django.urls import path
from .views import InviteView, InviteRefuseView

urlpatterns = [
    path('invite/', InviteView.as_view(), name='invite'),
    path('invite/refuse/', InviteRefuseView.as_view(), name='invite_refuse'),   
]