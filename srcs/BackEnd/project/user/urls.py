from django.urls import path
from . import views
from . import tests

urlpatterns = [
    path('list/', views.UserListView.as_view(), name='user_list'),
    path('block/', views.BlockUserView.as_view(), name='block'), # 친구 프로필 - 차단
    path('unblock/', views.UnblockUserView.as_view(), name='unblock'), # 내 프로필 - 블랙리스트 - 차단해제
    path('blacklist/', views.BlackListView.as_view(), name='blacklist'), # 내 프로필 - 블랙리스트
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('info/', views.UserInfoView.as_view(), name='info'),
    path('me/nickname/', views.ChangeNicknameView.as_view(), name='change_nickname'), # 내 프로필 - 닉네임 변경
    path('history/', views.MatchHistoryView.as_view(), name='history'), # 프로필 전적탭
    path('dummy/', tests.MakeUserAndMatchHistory.as_view(), name='dummy'), #더미데이터 생성
]