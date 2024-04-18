from django.urls import path, include
from . import views
from .views import CustomTokenRefreshView
from bug_report.views import BugReportView

urlpatterns = [
    path('', views.Index.as_view(), name='api'),
    path('login/', include('login.urls')),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('user/', include('user.urls')),
    
    path('logout/', views.Logout.as_view(), name='logout'), #로그아웃
    path('friend/', include('friend.urls'), name='friend'), #친구
    path('connect/', include('connect.urls'), name='connect'), #초대
    path('bug_report/', BugReportView.as_view(), name='bug_report'), #버그신고
]
