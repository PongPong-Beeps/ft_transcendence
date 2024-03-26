from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, MatchHistory
from rest_framework.permissions import IsAuthenticated
from .serializer import BlackListSerializer, MatchHistorySerializer #가정한 시리얼라이저 임포트 경로
from django.core.files.storage import default_storage #파일을 저장하기 위한 모듈
from django.core.files.base import ContentFile #파일을 읽고 쓰기 위한 모듈
import base64 #base64 인코딩을 위한 모듈
from drf_yasg.utils import swagger_auto_schema #swagger
from rest_framework.parsers import MultiPartParser #swagger 파일 업로드를 위한 파서 클래스
from swagger.serializer import ChangeImageSerializer, InputNickSerializer#, UserInfoSerializer #swagger 시리얼라이저
from swagger.serializer import user_list_schema, user_me_schema, user_info_schema #swagger 스키마
import os #디렉토리 생성/삭제를 위한 모듈

#/api/user/list
class UserListView(APIView):
#    permission_classes = [IsAuthenticated]
    @swagger_auto_schema(
        tags=['User'],
        responses=user_list_schema
    )
    def get(self, request):
        users = User.objects.all()
        my_nickname = request.user.nickname #내 닉네임 추출
        # 각 사용자의 닉네임을 'nickname' 키를 가진 딕셔너리로 변환            # 내 닉네임은 제외
        user_list = [{"id": user.id,"nickname": user.nickname} for user in users if user.nickname != my_nickname]
        # 'userList' 키 아래에 사용자 리스트를 포함하는 JSON 객체로 응답 구성
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
            user_me.blacklist.add(user_target)  # Add the target to the blacklist
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
            user_me.blacklist.remove(user_target)  # Remove the target from the blacklist
            return Response({"message": f"{user_target.nickname}이(가) 정상적으로 블랙리스트에서 제거되었습니다"}, status=200)
        except User.DoesNotExist:
            return Response({"error": f"{user_target.nickname}사용자가 존재하지 않습니다."}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

#/api/user/me
class CurrentUserView(APIView):
    # permission_classes = [IsAuthenticated]
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
                    "image" : get_image(user), #user/me 이미지
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
    # permission_classes = [IsAuthenticated]
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
        elif not new_nickname.isalnum(): #isalnum 숫자, 알파벳으로만 이루어졌는지 확인하는 파이썬 내장함수
            return Response({"error": "닉네임은 숫자와 알파벳만 사용"}, status=403)
        if user.image_file : #db에 저장된 이미지가 있으면
            old_file_path = user.image_file.name
            new_file_path = old_file_path.replace(user.nickname, new_nickname)
            
            try :
                # 파일의 내용을 읽습니다.
                old_file = default_storage.open(old_file_path, 'rb')
                old_file_content = old_file.read()

                # 새 파일 경로에 내용을 쓰고, 기존 파일 및 폴더를 삭제합니다.
                default_storage.save(new_file_path, ContentFile(old_file_content))
                default_storage.delete(old_file_path) # 기존 이미지 파일 삭제
                parsed = old_file_path.split('/')
                os.rmdir('/'.join(parsed[:2])) # 기존 닉네임 폴더 삭제 (폴더가 비어있어야 삭제 가능)
            
                user.image_file = new_file_path
                user.save()
            except Exception as e:
                print("닉네임 변경중 기존 이미지 저장 폴더 변경시 생긴 에러: ", e)
        user.nickname = new_nickname
        user.save()
        return Response({"message": f"닉네임이 {new_nickname}으로 변경되었습니다."}, status=200)

#프로필 정보 탭
#/api/user/info
class UserInfoView(APIView):
    # permission_classes = [IsAuthenticated]
    
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
            "friend": data['is_friend'], #친구인지 여부
            "block": data['is_blocked'], #블랙리스트에 있는지 여부
        }
        return response_data

    @swagger_auto_schema(
        tags=['Profile'], 
        responses=user_info_schema
    )
    # get 이면 나의 프로필 정보 리턴
    def get(self, request):
        user_id = request.user.id
        user = User.objects.get(id=user_id)
        
        #친구여부, 블랙여부 데이터, 본인 자신이니 친구도 블랙도 아님
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
    # get 이면 나의 프로필 정보 리턴
    def post(self, request):
        target_id = request.data.get('id')
        user_target = User.objects.get(id=target_id)
        
        # 현재 로그인한 나의 정보
        user_id = request.user.id
        user_me = User.objects.get(id=user_id)
        
        #친구여부, 블랙여부 데이터
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
    def get(self, request): #내 프로필 - 전적
        user_id = request.user.id
        user_me = User.objects.get(id=user_id)
        my_match = MatchHistory.objects.filter(user=user_me)
        serializer = MatchHistorySerializer(my_match, many=True) #many=True : 하나가 아닌 여러개의 데이터를 직렬화
        response_data = {"history" : serializer.data}
        return Response(response_data, status=200)
        
    @swagger_auto_schema(
        tags=['Profile'], 
        request_body=InputNickSerializer, 
        responses={200: MatchHistorySerializer(many=True)}
    )
    def post(self, request): #상대 프로필 - 전적
        target_id = request.data.get('id')
        target_user = User.objects.get(id=target_id)
        target_match = MatchHistory.objects.filter(user=target_user)
        serializer = MatchHistorySerializer(target_match, many=True)
        response_data = {"history" : serializer.data}
        return Response(response_data, status=200)


#/api/user/me/image/ 내 프로필 이미지 변경
#[ POST ] 이미지 변경하기
#[ GET ]  이미지 가져오기(임시) -> 추후에 함수로 빼서 내 프로필, 프로필 모달에서 사용할 예정
class ChangeImageView(APIView):
    #permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser,) #이미지 업로드 버튼을 위한 파서 클래스
    @swagger_auto_schema(
        tags=['Profile'], 
        request_body=ChangeImageSerializer,
        responses={200: 'Success', 500: 'Server Error'}
    )
    def post(self, request):
        try :
            user_id = request.user.id
            user = User.objects.get(id=user_id)
            image = request.data.get('image') # body내 key값이 'image'인 value를 가져옴
            # resize_image(image, 150, 150) # 이미지 리사이징 (150x150으로 리사이징) 추후 필요 # django-imagekit 라이브러리 활용
            if ('user_images/' + user.nickname + '/') in user.image_file.name:
                default_storage.delete(user.image_file.name) # 기존 이미지 삭제
            #django컨테이너 내부 WORKDIR / user_images/geonwule/ 에 이미지 저장
            file_path = default_storage.save('user_images/' + user.nickname + '/' + image.name, ContentFile(image.read()))
            # ImageField에 파일 경로 저장
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
            # 이미지 파일을 읽어옵니다.
            image_file = user.image_file
            #with는 파일을 안전하게 열고 닫는다.
            with open(image_file.path, "rb") as f: # "rb" : 이미지 파일을 바이너리 읽기 모드로 엽니다.
                image_data = f.read()

            # 이미지를 Base64로 인코딩합니다.
            # image -> base64로 인코딩 -> FrontEnd에서 다시 디코딩하여 이미지로 사용 (<img src="data:image/png;base64, <base64 code>" alt="이미지">)
            image_base64 = base64.b64encode(image_data)
            print("image_base64: ", image_base64)

            # 응답 데이터에 이미지 Base64 문자열을 포함시킵니다.
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
        # print("image_base64: ", image_base64)

        return image_base64
    except Exception as e: # 이미지가 없을 경우 read()에서 예외 발생!
        return ('') # 이미지가 없을 경우 빈 문자열을 반환