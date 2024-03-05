from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView
import json
import datetime


class Index(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated] # 있어야 하나?

    def get(self, request):
        print("I'm post func in Index")
        print(request)
        # 인증된 사용자만 접근 가능한 API 뷰
        if request.user is not None:
            user_nickname = request.user.nickname   # access_token 의 payload 에서 가져온 값
            user_id = request.user.id               # access_token 의 payload 에서 가져온 값
            print(f"User's nickname: {user_nickname}")
            print(f"User's id: {user_id}")
            print("Token is valid")
        else:   # 토큰이 만료되면 여기 안들어가지고, 자동 401 리턴됨
            print("Token is invalid")
        content = {'message': 'Hello, World!'}
        return Response(content)
    
    
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # 새로 발급받은 토큰을 쿠키에 저장
            access_token = response.data.get("access")
            refresh_token = response.data.get("refresh")
            
            response.set_cookie(
                key="access_token",
                value=access_token,
                expires=datetime.datetime.utcnow() + datetime.timedelta(days=1),
                httponly=False,
                secure=True,
                samesite='Lax'
            )
        return response