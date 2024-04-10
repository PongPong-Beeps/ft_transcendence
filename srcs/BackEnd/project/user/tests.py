from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User, MatchHistory

class MakeUserAndMatchHistory(APIView):
    def get(self, request):
        try:
            user_id = request.user.id
            print("user_id: ", user_id)
            user = User.objects.get(id=user_id)
            print(user)

            new_user1 = User(nickname='geonwuleDummy', email='geonwuleDummy@example.com')
            new_user1.save()

            new_user2 = User(nickname='jonchoiDummy', email='jonchoiDummy@example.com')
            new_user2.save()

            new_user3 = User(nickname='wooshinDummy', email='wooshinDummy@example.com')
            new_user3.save()

            new_user4 = User(nickname='jikooDummy', email='jikooDummy@example.com')
            new_user4.save()

            match1 = MatchHistory(user=user, nick_me="Player1", nick_opponent="Player2", datetime=timezone.now(), tournament=True, easy_mode=True, result=True)
            match1.save()

            match2 = MatchHistory(user=user, nick_me="Player3", nick_opponent="Player4", datetime=timezone.now(), tournament=True, easy_mode=True, result=False)
            match2.save()

            match3 = MatchHistory(user=user, nick_me="Player1", nick_opponent="Player2", datetime=timezone.now(), tournament=True, easy_mode=False, result=True)
            match3.save()

            match4 = MatchHistory(user=user, nick_me="Player3", nick_opponent="Player4", datetime=timezone.now(), tournament=True, easy_mode=False, result=False)
            match4.save()

            match5 = MatchHistory(user=user, nick_me="Player1", nick_opponent="Player2", datetime=timezone.now(), tournament=False, easy_mode=True, result=True)
            match5.save()

            match6 = MatchHistory(user=user, nick_me="Player3", nick_opponent="Player4", datetime=timezone.now(), tournament=False, easy_mode=True, result=False)
            match6.save()
            response_data = {
                "Dummy created": "success!!",
                "users": [
                    {"nickname": new_user1.nickname, "email": new_user1.email},
                    {"nickname": new_user2.nickname, "email": new_user2.email},
                    {"nickname": new_user3.nickname, "email": new_user3.email},
                    {"nickname": new_user4.nickname, "email": new_user4.email}
                ],
                "matches": [
                    {"nick_me": match1.nick_me, "nick_opponent": match1.nick_opponent, "datetime": match1.datetime, "tournament": match1.tournament, "easy_mode": match1.easy_mode, "result": match1.result},
                    {"nick_me": match2.nick_me, "nick_opponent": match2.nick_opponent, "datetime": match2.datetime, "tournament": match2.tournament, "easy_mode": match2.easy_mode, "result": match2.result},
                    {"nick_me": match3.nick_me, "nick_opponent": match3.nick_opponent, "datetime": match3.datetime, "tournament": match3.tournament, "easy_mode": match3.easy_mode, "result": match3.result},
                    {"nick_me": match4.nick_me, "nick_opponent": match4.nick_opponent, "datetime": match4.datetime, "tournament": match4.tournament, "easy_mode": match4.easy_mode, "result": match4.result},
                    {"nick_me": match5.nick_me, "nick_opponent": match5.nick_opponent, "datetime": match5.datetime, "tournament": match5.tournament, "easy_mode": match5.easy_mode, "result": match5.result},
                    {"nick_me": match6.nick_me, "nick_opponent": match6.nick_opponent, "datetime": match6.datetime, "tournament": match6.tournament, "easy_mode": match6.easy_mode, "result": match6.result}
                ]
            }
            return Response(response_data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
