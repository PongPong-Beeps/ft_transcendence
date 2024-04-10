from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from user.models import User
from user.serializer import FriendListSerializer
from rest_framework.permissions import IsAuthenticated
from swagger.serializer import InputNickSerializer
from drf_yasg.utils import swagger_auto_schema

# /api/friend/list 로비 - 친구 목록
class FriendListView(APIView):
    @swagger_auto_schema(
        tags=['Friend'], 
        responses={200: FriendListSerializer(many=True)}
    )
    def get(self, request):
        user_id = request.user.id
        me = User.objects.get(id=user_id)
        friendlist = me.friendlist.exclude(id=user_id) # 내 친구 목록에서 나를 제외하고 추출
        serializer = FriendListSerializer(friendlist, many=True) # 친구목록들 JSON으로 변환
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
            user_me = User.objects.get(id=request.user.id)
            target_id = request.data.get('id')
            user_target = User.objects.get(id=target_id)
            if user_me.friendlist.filter(id=target_id).exists():
                return Response({"error": f"{user_target.nickname}은(는) 이미 친구입니다."}, status=400)
            user_me.friendlist.add(user_target) # 친구추가
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
            user_me.friendlist.remove(user_target)  # 친구삭제
            return Response({"message": f"{user_target.nickname}이(가) 친구목록에서 삭제되었습니다"}, status=200)
        except User.DoesNotExist:
            return Response({"error": f"{user_target.nickname}사용자가 존재하지 않습니다."}, status=401)
        except Exception as e:
            return Response({"error": str(e)}, status=500)