from django.shortcuts import redirect
from django.views import View
import json
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

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
#            print(user_info.get('data', {}))
            user_id = user_info.get('data', {}).get('id')
            user_email = user_info.get('data', {}).get('email')
            user_nickname = user_info.get('data', {}).get('login')
            ## Print test
            print(f"User ID: {user_id}")
            print(f"Email: {user_email}")
            print(f"Nickname: {user_nickname}")
            return Response({"message": "POST 요청 처리 완료"}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "POST 요청 실패"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
