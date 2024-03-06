from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User  # 가정한 모델 임포트 경로
from .serializer import BlackListSerializer #가정한 시리얼라이저 임포트 경로

class UserListView(APIView):
    def get(self, request):
        users = User.objects.all()
        # 각 사용자의 닉네임을 'nickname' 키를 가진 딕셔너리로 변환
        user_list = [{"nickname": user.nickname} for user in users]
        # 'userList' 키 아래에 사용자 리스트를 포함하는 JSON 객체로 응답 구성
        response_data = {"userList": user_list}
        return Response(response_data)
    
class BlackListView(APIView):
    def get(self, request):
        user_id = request.user.id
        me = User.objects.get(id=user_id)
        blacklist_list = me.blacklist.all()
        serializer = BlackListSerializer(blacklist_list, many=True)
        return Response(serializer.data, status=200)

class BlockUserView(APIView):
    def post(self, request):
        try:
            user_me = User.objects.get(id=request.user.id)
            target = request.data.get('nickname')
            user_target = User.objects.get(nickname=target)
            user_me.blacklist.add(user_target)  # Add the target to the blacklist
            return Response({"message": f"{target}이(가) 정상적으로 블랙리스트 처리 되었습니다"}, status = 200)
        except User.DoesNotExist:
            return Response({"error": f"{target}사용자가 존재하지 않습니다."}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class UnblockUserView(APIView):
    def post(self, request):
        try :
            user_me = User.objects.get(id=request.user.id)
            target = request.data.get('nickname')
            print("target: ", target)
            user_target = User.objects.get(nickname=target)
            user_me.blacklist.remove(user_target)  # Remove the target from the blacklist
            return Response({"message": f"{target}이(가) 정상적으로 블랙리스트에서 제거되었습니다"}, status=200)
        except User.DoesNotExist:
            return Response({"error": f"{target}사용자가 존재하지 않습니다."}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)