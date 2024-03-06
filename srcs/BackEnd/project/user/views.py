from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, MatchHistory
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
    
#프로필 정보 탭
#/api/user/info
class UserMatchHistorySummaryView(APIView):
    # permission_classes = [IsAuthenticated]
    
    def calculate_user_info(self, user):
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
            #image : user.image, #추후 이미지도 추가해야함
            "nickname": nickname,
            "total": total_winning_percentage,
            "easy": easy_winning_percentage,
            "hard": hard_winning_percentage,
        }
        return response_data

    # get 이면 나의 프로필 정보 리턴
    def get(self, request):
        user_id = request.user.id
        user = User.objects.get(id=user_id)
        response_data = self.calculate_user_info(user)
        return Response(response_data)    
    
    # get 이면 나의 프로필 정보 리턴
    def post(self, request):
        target = request.data.get('nickname')
        user_target = User.objects.get(nickname=target)
        
        response_data = self.calculate_user_info(user_target)
        return Response(response_data)
    