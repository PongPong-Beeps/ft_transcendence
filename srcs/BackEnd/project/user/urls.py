from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.UserListView.as_view(), name='user_list'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
]