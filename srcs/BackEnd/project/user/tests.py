# from django.test import TestCase
from .models import User, MatchHistory
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response

#path('test/', tests.MakeMatchHistoryTestView.as_view(), name='test'), #테스트용 엔드포인트
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
    