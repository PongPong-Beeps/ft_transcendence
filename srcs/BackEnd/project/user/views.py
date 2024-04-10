from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, MatchHistory
from rest_framework.permissions import IsAuthenticated
from .serializer import BlackListSerializer, MatchHistorySerializer
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import base64
from drf_yasg.utils import swagger_auto_schema
from rest_framework.parsers import MultiPartParser
from swagger.serializer import ChangeImageSerializer, InputNickSerializer
from swagger.serializer import user_list_schema, user_me_schema, user_info_schema

#/api/user/list
class UserListView(APIView):
    @swagger_auto_schema(
        tags=['User'],
        responses=user_list_schema
    )
    def get(self, request):
        users = User.objects.all()
        my_id = request.user.id
        user_list = [{"id": user.id,"nickname": user.nickname} for user in users if user.id != my_id]
        response_data = {"userList": user_list}
        return Response(response_data)
 
 #/api/user/blacklist
class BlackListView(APIView):
    @swagger_auto_schema(
        tags=['Profile'], 
        responses={200: BlackListSerializer(many=True)}
    )
    def get(self, request):
        user_id = request.user.id
        me = User.objects.get(id=user_id)
        blacklist_list = me.blacklist.all()
        serializer = BlackListSerializer(blacklist_list, many=True)
        response_data = {"blacklist": serializer.data}
        return Response(response_data, status=200)

#/api/user/block
class BlockUserView(APIView):
    @swagger_auto_schema(
        tags=['User'], 
        request_body=InputNickSerializer,
        responses={200: 'Success', 400: '사용자가 존재하지 않습니다', 500: 'Server Error'}
    )
    def post(self, request):
        try:
            user_me = User.objects.get(id=request.user.id)
            target_id = request.data.get('id')
            user_target = User.objects.get(id=target_id)
            user_me.blacklist.add(user_target)
            return Response({"message": f"{user_target.nickname}이(가) 정상적으로 블랙리스트 처리 되었습니다"}, status = 200)
        except User.DoesNotExist:
            return Response({"error": f"{user_target.nickname}사용자가 존재하지 않습니다."}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

#/api/user/unblock
class UnblockUserView(APIView):
    @swagger_auto_schema(
        tags=['User'], 
        request_body=InputNickSerializer,
        responses={200: 'Success', 400: '사용자가 존재하지 않습니다', 500: 'Server Error'}
    )
    def post(self, request):
        try :
            user_me = User.objects.get(id=request.user.id)
            target_id = request.data.get('id')
            user_target = User.objects.get(id=target_id)
            user_me.blacklist.remove(user_target)
            return Response({"message": f"{user_target.nickname}이(가) 정상적으로 블랙리스트에서 제거되었습니다"}, status=200)
        except User.DoesNotExist:
            return Response({"error": f"{user_target.nickname}사용자가 존재하지 않습니다."}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

#/api/user/me
class CurrentUserView(APIView):
    @swagger_auto_schema(
        tags=['Profile'],
        responses=user_me_schema
    )
    def get(self, request):
        try:
            user_id = request.user.id
            user = User.objects.get(id=user_id)
            print(user)
            response_data = {
                    "image" : get_image(user),
                    "id" : user.id,
                    "nickname": user.nickname,
            }
            return Response(response_data)
        except Exception as e:
            print("error: ", e)
            response = Response({"error": str(e)}, status=500)
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response

#내 닉네임 변경
#/api/user/me/nickname
class ChangeNicknameView(APIView):
    @swagger_auto_schema(
        tags=['Profile'], 
        request_body=InputNickSerializer,
        responses={200: 'Success', 400: '기존 닉네임과 동일', 401: '닉네임 중복', 402: '닉네임은 2자 이상 8자 이하', 403: '닉네임은 숫자/알파벳/한글만 사용', 500: 'Server Error'}
    )
    def post(self, request):
        user_id = request.user.id
        user = User.objects.get(id=user_id)
        new_nickname = request.data.get('nickname')
        if new_nickname == user.nickname:
            return Response({"error": "기존 닉네임과 동일"}, status=400)
        elif User.objects.filter(nickname=new_nickname).exists():
            return Response({"error": f"닉네임({new_nickname}) 이미 존재"}, status=401)
        elif len(new_nickname) < 2 or len(new_nickname) > 8:
            return Response({"error": "닉네임은 2자 이상 8자 이하"}, status=402)
        elif not new_nickname.isalnum():
            return Response({"error": "닉네임은 숫자와 알파벳만 사용"}, status=403)
        user.nickname = new_nickname
        user.save()
        return Response({"message": f"닉네임이 {new_nickname}으로 변경되었습니다."}, status=200)

#프로필 정보 탭
#/api/user/info
class UserInfoView(APIView):
    def calculate_user_info(self, user, data):
        nickname = user.nickname

        total_matches = MatchHistory.objects.filter(user=user).count()
        print("total_matches: ", total_matches)
    
        total_win = MatchHistory.objects.filter(user=user, result=True).count()
        print("total_win: ", total_win)
    
        easy_total_matches = MatchHistory.objects.filter(user=user, easy_mode=True).count()
        print("easy_total_matches: ", easy_total_matches)
    
        easy_match_win = MatchHistory.objects.filter(user=user, easy_mode=True, result=True).count()
        print("easy_match_win: ", easy_match_win)
    
        hard_total_matches = MatchHistory.objects.filter(user=user, easy_mode=False).count()
        print("hard_total_matches: ", hard_total_matches)
    
        hard_match_win = MatchHistory.objects.filter(user=user, easy_mode=False, result=True).count()
        print("hard_match_win: ", hard_match_win)
    
        total_winning_percentage = total_win / total_matches * 100 if total_matches != 0 else 0
        print("total_win_percentage: ", total_winning_percentage)
    
        easy_winning_percentage = easy_match_win / easy_total_matches * 100 if easy_total_matches != 0 else 0
        print("easy_winning_percentage: ", easy_winning_percentage)
    
        hard_winning_percentage = hard_match_win / hard_total_matches * 100 if hard_total_matches != 0 else 0
        print("hard_winning_percentage: ", hard_winning_percentage)
                    
        response_data = {
            "image" : get_image(user),
            "nickname": nickname,
            "total": int(total_winning_percentage),
            "easy": int(easy_winning_percentage),
            "hard": int(hard_winning_percentage),
            "friend": data['is_friend'],
            "block": data['is_blocked'],
        }
        return response_data

    @swagger_auto_schema(
        tags=['Profile'], 
        responses=user_info_schema
    )
    
    # get 이면 나의 정보
    def get(self, request):
        user_id = request.user.id
        user = User.objects.get(id=user_id)
        
        data = {
            'is_friend' : False,
            'is_blocked' : False,
        }
        response_data = self.calculate_user_info(user, data)
        return Response(response_data)
    
    @swagger_auto_schema(
        tags=['Profile'], 
        request_body=InputNickSerializer,
        responses=user_info_schema
    )
    
    #post 이면 상대방 정보
    def post(self, request):
        target_id = request.data.get('id')
        user_target = User.objects.get(id=target_id)
        
        user_id = request.user.id
        user_me = User.objects.get(id=user_id)
        
        data = {
            'is_friend' : False,
            'is_blocked' : False,
        }
        
        #친구인지 여부, 블랙리스트에 있는지 여부
        if user_me.friendlist.filter(id=target_id).exists():
            data['is_friend'] = True
        if user_me.blacklist.filter(id=target_id).exists():
            data['is_blocked'] = True
            
        response_data = self.calculate_user_info(user_target, data)
        return Response(response_data)
    
#/api/user/history
#[ GET ](나의 전적 보기)
#[ POST ](다른 유저 전적 보기)
class MatchHistoryView(APIView):
    @swagger_auto_schema(
        tags=['Profile'], 
        responses={200: MatchHistorySerializer(many=True)}
    )
    def get(self, request):
        user_id = request.user.id
        user_me = User.objects.get(id=user_id)
        my_match = MatchHistory.objects.filter(user=user_me).order_by('-datetime')
        serializer = MatchHistorySerializer(my_match, many=True)
        response_data = {"history" : serializer.data}
        return Response(response_data, status=200)
        
    @swagger_auto_schema(
        tags=['Profile'], 
        request_body=InputNickSerializer, 
        responses={200: MatchHistorySerializer(many=True)}
    )
    def post(self, request):
        target_id = request.data.get('id')
        target_user = User.objects.get(id=target_id)
        target_match = MatchHistory.objects.filter(user=target_user).order_by('-datetime')
        serializer = MatchHistorySerializer(target_match, many=True)
        response_data = {"history" : serializer.data}
        return Response(response_data, status=200)


#/api/user/me/image/ 내 프로필 이미지 변경
#[ POST ] 이미지 변경하기
#[ GET ]  이미지 가져오기
class ChangeImageView(APIView):
    parser_classes = (MultiPartParser,)
    @swagger_auto_schema(
        tags=['Profile'], 
        request_body=ChangeImageSerializer,
        responses={200: 'Success', 500: 'Server Error'}
    )
    def post(self, request):
        try :
            user_id = request.user.id
            user = User.objects.get(id=user_id)
            image = request.data.get('image')
            if ('user_images/' + str(user.id) + '/') in user.image_file.name:
                default_storage.delete(user.image_file.name)
            file_path = default_storage.save('user_images/' + str(user.id) + '/' + image.name, ContentFile(image.read()))
            user.image_file = file_path
            user.save()
            
            response_data = {
                "message": "프로필 이미지가 정상적으로 변경되었습니다",
                "image": get_image(user),
            }
            
            return Response(response_data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
    @swagger_auto_schema(
        tags=['Profile'], 
        responses={200: "image : image"}
    )
    def get(self, request):
        try :
            user_id = request.user.id
            user = User.objects.get(id=user_id)
            image_file = user.image_file
            with open(image_file.path, "rb") as f:
                image_data = f.read()

            image_base64 = base64.b64encode(image_data)
            print("image_base64: ", image_base64)

            response_data = {
                "message": "프로필 이미지가 정상적으로 가져와졌습니다",
                "image": image_base64,
            }
            return Response(response_data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
#내 프로필 이미지 가져오기 함수
def get_image(user):
    try:
        image_file = user.image_file
        with open(image_file.path, "rb") as f:
            image_data = f.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')

        return image_base64
    except Exception as e:
        return ('')