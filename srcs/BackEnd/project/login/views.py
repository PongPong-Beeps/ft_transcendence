from django.shortcuts import redirect
from django.views import View
import json
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import datetime
from user.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


grant_type = 'authorization_code'
client_id = 'u-s4t2ud-942fd4b0016fa5993b2a57b000789a0d9b6e6b05ef6a004724062905ea9dc440'
client_secret = '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'
redirect_uri = 'https://127.0.0.1/auth'
target_url = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-942fd4b0016fa5993b2a57b000789a0d9b6e6b05ef6a004724062905ea9dc440&redirect_uri=https%3A%2F%2F127.0.0.1%2Fauth&response_type=code'

def get_access_token(auth_code):
        code = auth_code
        token_response = requests.post(
            'https://api.intra.42.fr/oauth/token',
            data={
                'grant_type': grant_type,
                'client_id': client_id,
                'client_secret': client_secret,
                'code': code,
                'redirect_uri': redirect_uri
            }
        )
        if token_response.status_code == 200:
            return token_response.json().get('access_token')
        else:
            return None

def get_user_info(access_token):
    headers = {'Authorization': f'Bearer {access_token}'}

    response = requests.get('https://api.intra.42.fr/v2/me', headers=headers)
    if response.status_code == 200:
        return {'success': True, 'data': response.json()}
    return {'success': False, 'status_code': response.status_code}


class Login42TestView(APIView):
    def get(self, request):
        return redirect(target_url)

class Login42CallbackView(APIView):
    def post(self, request):
        auth_code = request.data.get('code')
        access_token = get_access_token(auth_code)
        if not access_token:
            return Response({"message": "Authentication failed"}, status=status.HTTP_400_BAD_REQUEST)
        user_info = get_user_info(access_token)
        if user_info['success']:
            # print(user_info.get('data', {}))
            user_nickname = user_info.get('data', {}).get('login')
            user_email = user_info.get('data', {}).get('email')
            ## Print test
            print(f"Email: {user_email}")
            print(f"Nickname: {user_nickname}")
            save_user_to_db(user_email, user_nickname)
            
            user = User.objects.get(nickname=user_nickname)
            print("user: ", user)
            jwt_token = create_jwt_token(user)
            print("jwt_token: ", jwt_token)

            # Response 객체 생성
            response = Response({"message": "POST 요청 처리 완료"}, status=status.HTTP_200_OK)
            
            # access_token 쿠키 설정
            response.set_cookie(
                key='access_token',
                value=jwt_token['access_token'],
                httponly=False,  # JavaScript를 통한 접근 방지 해제
                expires=datetime.datetime.utcnow() + datetime.timedelta(days=1),  # 쿠키 만료 시간 설정
                secure=True,  # HTTPS를 통해서만 쿠키 전송
                samesite='Lax'  # CSRF 보호를 위한 설정
            )

            # refresh_token 쿠키 설정
            response.set_cookie(
                key='refresh_token',
                value=jwt_token['refresh_token'],
                httponly=False,  # JavaScript를 통한 접근 방지 해제 
                expires=datetime.datetime.utcnow() + datetime.timedelta(days=1),  # 쿠키 만료 시간 설정
                secure=True,  # HTTPS를 통해서만 쿠키 전송
                samesite='Lax'  # CSRF 보호를 위한 설정
                )
            return response
        else:
            return Response({"message": "POST 요청 실패"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def create_jwt_token(user):
    refresh = MyTokenObtainPairSerializer.get_token(user)

    return {
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
    }


def save_user_to_db(_user_email, _user_nickname):
     # user_id와 email이 모두 이미 존재하는지 확인
    existing_user = User.objects.filter(email=_user_email).exists()
    if not existing_user : 
        User.objects.create(
            email = _user_email,
            nickname = _user_nickname,
        )
        print(_user_email, " saved to db")
    else :
        print(_user_email, " aleady saved db")
        
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # 사용자의 nickname을 토큰에 추가
        token['nickname'] = user.nickname

        return token