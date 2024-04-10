from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView
import datetime

# api/logout/
class Logout(APIView):
    def post(self, request):
        response = Response({"message": "로그아웃이 완료되었습니다."})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
    
# api/
class Index(APIView):
    # 인증된 사용자만 접근 가능
    def get(self, request):
        print(request)
        if request.user is not None:
            user_nickname = request.user.nickname
            user_id = request.user.id
            print(f"User's nickname: {user_nickname}")
            print(f"User's id: {user_id}")
            print("Token is valid")
        else:   # 토큰이 만료되면 여기 안들어가지고, 401 자동 return
            print("Token is invalid")
        content = {'message': 'Hello, World!'}
        return Response(content)
    
# api/token/refresh/
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.get("access")
            
            response.set_cookie(
                key="access_token",
                value=access_token,
                expires=datetime.datetime.utcnow() + datetime.timedelta(days=1),
                httponly=False,
                secure=True,
                samesite='Lax'
            )
        return response