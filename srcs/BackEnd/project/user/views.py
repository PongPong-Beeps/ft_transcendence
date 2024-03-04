from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User  # 가정한 모델 임포트 경로

class UserListView(APIView):
    def get(self, request):
        users = User.objects.all()
        # 각 사용자의 닉네임을 'nickname' 키를 가진 딕셔너리로 변환
        user_list = [{"nickname": user.nickname} for user in users]
        # 'userList' 키 아래에 사용자 리스트를 포함하는 JSON 객체로 응답 구성
        response_data = {"userList": user_list}
        return Response(response_data)