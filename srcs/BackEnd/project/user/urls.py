from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.UserListView.as_view(), name='user_list'),
    path('block/', views.BlockUserView.as_view(), name='block'), # 친구 프로필 - 차단
    path('unblock/', views.UnblockUserView.as_view(), name='unblock'), # 내 프로필 - 블랙리스트 - 차단해제
    path('blacklist/', views.BlackListView.as_view(), name='blacklist'), # 내 프로필 - 블랙리스트
]
