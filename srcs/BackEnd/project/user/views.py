from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from rest_framework.permissions import IsAuthenticated


#/api/user/list
class UserListView(APIView):
#    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        # 각 사용자의 닉네임을 'nickname' 키를 가진 딕셔너리로 변환
        user_list = [{"nickname": user.nickname} for user in users]
        # 'userList' 키 아래에 사용자 리스트를 포함하는 JSON 객체로 응답 구성
        response_data = {"userList": user_list}
        return Response(response_data)

#/api/user/me
class CurrentUserView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        user = User.objects.get(id=user_id)
        print(user)
        response_data = {
                 "nickname": user.nickname,
                 #추후 이미지도 추가해야함
        }
        return Response(response_data)