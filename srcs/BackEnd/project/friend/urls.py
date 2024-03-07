from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.FriendListView.as_view(), name='friend_list'), # 로비 - 친구 목록
    path('add/', views.AddFriendView.as_view(), name='add_friend'), # 유저 프로필 - 친구 추가
    path('delete/', views.DeleteFriendView.as_view(), name='delete_friend'), # 친구 프로필 - 친구 삭제
]