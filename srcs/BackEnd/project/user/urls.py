from django.urls import path
from . import views
from . import tests

urlpatterns = [
    path('list/', views.UserListView.as_view(), name='user_list'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('info/', views.UserMatchHistorySummaryView.as_view(), name='info'),
]