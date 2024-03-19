from django.urls import path
from .views import Login42TestView, Login42CallbackView, LoginGoogleView, LoginGoogleCallbackView, LoginKakaoView, LoginKakaoCallbackView

urlpatterns = [
    path('42/', Login42TestView.as_view(), name='42login'),
    path('42/callback/', Login42CallbackView.as_view(), name='42callback'),
    path('google/', LoginGoogleView.as_view(), name='googlelogin'),
    path('google/callback/', LoginGoogleCallbackView.as_view(), name='googlecallback'),
    path('kakao/', LoginKakaoView.as_view(), name='kakaologin'),
    path('kakao/callback/', LoginKakaoCallbackView().as_view(), name='kakaocallback'),
]
