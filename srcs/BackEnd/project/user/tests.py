# from django.test import TestCase
from .models import User, MatchHistory
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q

#api/user/test
class MakeMatchHistoryTestView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        print("user_id: ", user_id)
        user = User.objects.get(id=user_id)
        print(user)
        
        match = MatchHistory(user=user, p1="Player1", p2="Player2", datetime=timezone.now(), tournament=True, easy_mode=True, result=True)
        match.save()
        
        match = MatchHistory(user=user, p1="Player3", p2="Player4", datetime=timezone.now(), tournament=True, easy_mode=True, result=False)
        match.save()
        
        match = MatchHistory(user=user, p1="Player1", p2="Player2", datetime=timezone.now(), tournament=True, easy_mode=False, result=True)
        match.save()
        
        match = MatchHistory(user=user, p1="Player3", p2="Player4", datetime=timezone.now(), tournament=True, easy_mode=False, result=False)
        match.save()
        
        match = MatchHistory(user=user, p1="Player1", p2="Player2", datetime=timezone.now(), tournament=False, easy_mode=True, result=True)
        match.save()
        
        match = MatchHistory(user=user, p1="Player3", p2="Player4", datetime=timezone.now(), tournament=False, easy_mode=True, result=False)
        match.save()

        response_data = {
                 "test": "good",
        }
        return Response(response_data)
    
#프로필 정보 탭
#/api/user/test2
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
        
        nickname = user.nickname

        total_matches = MatchHistory.objects.filter(user=user).count()
        print("total_matches: ", total_matches)
        
        total_win = MatchHistory.objects.filter(user=user, result=True).count()
        print("tots_win: ", total_win)
        
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
            "nickname": nickname,
            "total": total_winning_percentage,
            "easy": easy_winning_percentage,
            "hard": hard_winning_percentage,
        }
        return Response(response_data)
        
    
    # get 이면 나의 프로필 정보 리턴
    def post(self, request):
        target = request.data.get('nickname')
        user_target = User.objects.get(nickname=target)
        
        response_data = self.calculate_user_info(user_target)
        return Response(response_data)
    