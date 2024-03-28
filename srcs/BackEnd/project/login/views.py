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
from django.core.files.storage import default_storage #파일을 저장하기 위한 모듈
from django.core.files.base import ContentFile #파일을 읽고 쓰기 위한 모듈
import os

google = {
    'type' : 'google',
    'grant_type': 'authorization_code',
    'client_id': os.getenv('GOOGLE_CLIENT_ID'),
    'redirect_uri': os.getenv('REDIRECT_URI'),
    'scope': 'https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile',
    'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
    'target_url': 'https://accounts.google.com/o/oauth2/auth?client_id=764267800189-kv95o993o21djer1fjc82mbjbgt44jkf.apps.googleusercontent.com&redirect_uri=https://127.0.0.1/auth&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile',
    'token_url': 'https://accounts.google.com/o/oauth2/token',
    'user_info_url': 'https://www.googleapis.com/oauth2/v1/userinfo',
    'nickname' : 'given_name',
}

fortytwo = {
    'type' : '42',
    'grant_type': 'authorization_code',
    'client_id': os.getenv('FORTYTWO_CLIENT_ID'),
    'client_secret': os.getenv('FORTYTWO_CLIENT_SECRET'),
    'redirect_uri': os.getenv('REDIRECT_URI'),
    'target_url': 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-942fd4b0016fa5993b2a57b000789a0d9b6e6b05ef6a004724062905ea9dc440&redirect_uri=https%3A%2F%2F127.0.0.1%2Fauth&response_type=code',
    'token_url' : 'https://api.intra.42.fr/oauth/token',
    'user_info_url' : 'https://api.intra.42.fr/v2/me',
    'nickname' : 'login',
}

kakao = {
    'type' : 'kakao',
    'grant_type': 'authorization_code',
    'client_id': os.getenv('KAKAO_CLIENT_ID'),
    'redirect_uri': os.getenv('REDIRECT_URI'),
    'scope': 'profile_nickname+profile_image',
    'client_secret': os.getenv('KAKAO_CLIENT_SECRET'),
    'target_url': 'https://kauth.kakao.com/oauth/authorize?client_id=257d8e54c12291cad3e70e839117a6b0&redirect_uri=https://127.0.0.1/auth&response_type=code&scope=profile_nickname+profile_image',
    'token_url': 'https://kauth.kakao.com/oauth/token',
    'user_info_url': 'https://kapi.kakao.com/v2/user/me',
    'nickname' : 'nickname',
}

def get_access_token(auth_code, config):
        code = auth_code
        token_response = requests.post(
            config['token_url'],
            data={
                'code': code,
                'grant_type': config['grant_type'],
                'client_id': config['client_id'],
                'client_secret': config['client_secret'],
                'redirect_uri': config['redirect_uri']
            }
        )
        if token_response.status_code == 200:
            return token_response.json().get('access_token')
        else:
            return None

def get_user_info(access_token, user_info_url):
    headers = {'Authorization': f'Bearer {access_token}'}

    response = requests.get(user_info_url, headers=headers)
    if response.status_code == 200:
        return {'success': True, 'data': response.json()}
    return {'success': False, 'status_code': response.status_code}


class Login42TestView(APIView):
    def get(self, request):
        return redirect(fortytwo['target_url'])
    
class Login42CallbackView(APIView):
    def post(self, request):
        return process_login(request, fortytwo)
    
class LoginGoogleView(APIView):
    def get(self, request):
        return redirect(google['target_url'])

class LoginGoogleCallbackView(APIView):
    def post(self, request):
        return process_login(request, google)

class LoginKakaoView(APIView):
    def get(self, request):
        return redirect(kakao['target_url'])

class LoginKakaoCallbackView(APIView):
    def post(self, request):
        return process_login(request, kakao)
        

def process_login(request, config):
    auth_code = request.data.get('code')
    access_token = get_access_token(auth_code, config)
    if not access_token:
        return Response({"message": "Authentication failed"}, status=status.HTTP_400_BAD_REQUEST)
    user_info = get_user_info(access_token, config['user_info_url'])
    
    if user_info['success']:
        user = save_db(user_info, config)                
        jwt_token = create_jwt_token(user)

        response = Response({"message": "POST 요청 처리 완료"}, status=status.HTTP_200_OK)

        response.set_cookie(
            key='access_token',
            value=jwt_token['access_token'],
            httponly=False,
            expires=datetime.datetime.utcnow() + datetime.timedelta(days=1),
            secure=True,
            samesite='Lax'
        )

        response.set_cookie(
            key='refresh_token',
            value=jwt_token['refresh_token'],
            httponly=False,
            expires=datetime.datetime.utcnow() + datetime.timedelta(days=1),
            secure=True,
            samesite='Lax'
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

#KAKAO
# user_info: {
    # 'properties' : {'nickname': 'nickname', profile_image : 'url'},
    # }

#GOOGLE
# user_info: {
    # 'email': 'geonwlee22@gmail.com', 
    # 'given_name': 'geonwu', 
    # 'picture': 'url',
    # }

#42
# user_info: {
    # 'email': 'geonwule@student.42seoul.kr',
    #  login': 'geonwule', 
    # 'image': { 'versions': { 'large': 'url', 'medium': 'url', 'small': 'url', 'migro': 'url' }
        
def generate_unique_nickname(nickname):
    if User.objects.filter(nickname=nickname).exists():
        i = 1
        while User.objects.filter(nickname=nickname + '(' + str(i) + ')').exists():
            i += 1
        nickname += '(' + str(i) + ')'
    return nickname    

def save_db(user_info, config):
    if config['type'] == 'kakao' :
        user_nickname = 'k_' + user_info.get('data', {}).get('properties', {}).get(config['nickname'])
        user_email = user_nickname[2:] + '@kakao.com'
    elif config['type'] == 'google' :
        user_nickname = 'g_' + user_info.get('data', {}).get(config['nickname'])
        user_email = user_info.get('data', {}).get('email')
    else : #42
        user_nickname = user_info.get('data', {}).get(config['nickname'])
        user_email = user_info.get('data', {}).get('email')
    user_nickname = generate_unique_nickname(user_nickname)    
    save_user_to_db(user_email, user_nickname)
    user = User.objects.get(email=user_email)
    #(장고 스토리지가 초기화됬거나(추후 volume설정 필요), DB에 이미지 저장이 안되어 있거나 or 프로필 사진을 변경안하고 카카오 프로필 이미지를 쓸경우는) 로그인 할때마다 프로필 이미지로 업데이트
    if not default_storage.exists('user_images/' + user_nickname) or not user.image_file or config['type'] + '.jpg' in user.image_file.name.split('/')[2]:
        if config['type'] == 'kakao' :
            image_url = user_info.get('data', {}).get('properties', {}).get('profile_image')
        elif config['type'] == 'google' :
            image_url = user_info.get('data', {}).get('picture')
        else : #42
            image_url = user_info.get('data', {}).get('image', {}).get('versions', {}).get('small')
        response = requests.get(image_url) #이미지 url get 요청으로 받아오기
        if response.status_code == 200:
            if ('user_images/' + user_nickname + '/') in user.image_file.name: #기존 이미지가 있으면 삭제
                default_storage.delete(user.image_file.name)
            #이미지 장고 스토리지에 저장
            file_path = default_storage.save('user_images/' + user_nickname + '/' + config['type'] + '.jpg', ContentFile(response.content))
            user.image_file = file_path #이미지 경로 db에 저장
            user.save()
    return user

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