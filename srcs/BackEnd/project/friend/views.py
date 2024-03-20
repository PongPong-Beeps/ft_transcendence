from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from user.models import User
from user.serializer import FriendListSerializer
from rest_framework.permissions import IsAuthenticated
from swagger.serializer import InputNickSerializer #swagger 시리얼라이저
from drf_yasg.utils import swagger_auto_schema #swagger

# /api/friend/list 로비 - 친구 목록
class FriendListView(APIView):
#    permission_classes = [IsAuthenticated]
    @swagger_auto_schema(
        tags=['Friend'], 
        responses={200: FriendListSerializer(many=True)}
    )
    def get(self, request):
        user_id = request.user.id #내 아이디 추출
        me = User.objects.get(id=user_id) #내 아이디로 내 사용자정보 추출
        friendlist = me.friendlist.exclude(id=user_id) # 내 친구 목록에서 내 자신을 제외하고 추출
        serializer = FriendListSerializer(friendlist, many=True) # 시리얼라이저로 친구목록들 JSON으로 변환
        response_data = {"friendList": serializer.data}
        return Response(response_data, status=200)

# /api/friend/add 유저 프로필 - 친구 추가
# request = { "nickname": "nickname" }
class AddFriendView(APIView):
    @swagger_auto_schema(
        tags=['Friend'], 
        request_body=InputNickSerializer,
        responses={200: 'Success', 400: '이미 친구입니다', 401: '사용자가 존재하지 않습니다', 500: 'Server Error'}
    )
    def post(self, request):
        try:
            user_me = User.objects.get(id=request.user.id) #내 아이디로 사용자 정보 추출
            target_id = request.data.get('id') #타겟 닉네임 추출
            user_target = User.objects.get(id=target_id) #타겟 닉네임으로 사용자 정보 추출
            if user_me.friendlist.filter(id=target_id).exists():
                return Response({"error": f"{user_target.nickname}은(는) 이미 친구입니다."}, status=400)
            user_me.friendlist.add(user_target)  #친구목록에 타겟 추가
            return Response({"message": f"{user_target.nickname}이(가) 친구추가 되었습니다"}, status = 200)
        except User.DoesNotExist:
            return Response({"error": f"{user_target.nickname}사용자가 존재하지 않습니다."}, status=401)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
# /api/friend/delete 친구 프로필 - 친구 삭제
# request = { "nickname": "nickname" }
class DeleteFriendView(APIView):
    @swagger_auto_schema(
        tags=['Friend'], 
        request_body=InputNickSerializer,
        responses={200: 'Success', 400: '이미 친구입니다', 401: '사용자가 존재하지 않습니다', 500: 'Server Error'}
    )
    def post(self, request):
        try :
            user_me = User.objects.get(id=request.user.id)
            target_id = request.data.get('id')
            user_target = User.objects.get(id=target_id)
            if not user_me.friendlist.filter(id=target_id).exists():
                return Response({"error": f"{user_target.nickname}은(는) 이미 친구목록에 없습니다."}, status=400)
            user_me.friendlist.remove(user_target)  # 친구 삭제
            return Response({"message": f"{user_target.nickname}이(가) 친구목록에서 삭제되었습니다"}, status=200)
        except User.DoesNotExist:
            return Response({"error": f"{user_target.nickname}사용자가 존재하지 않습니다."}, status=401)
        except Exception as e:
            return Response({"error": str(e)}, status=500)