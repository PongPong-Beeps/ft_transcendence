from django.db import models

class User(models.Model) :
    nickname = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    # login_type = models.CharField(max_length=50)

    # REQUIRED_FIELDS = ['email']  # 사용자 생성 시 필수로 입력해야 하는 필드

    def __str__(self):
        return self.nickname


class MatchHistory(models.Model) :
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='match_history')
    
    p1 = models.CharField(max_length=20)    # player1
    p2 = models.CharField(max_length=20)    # player2
    datetime = models.DateTimeField(auto_now=False, auto_now_add=True) # 게임 날짜
    tournament = models.BooleanField(null=True) # true 면 tournament, false 면 normal
    easy_mode = models.BooleanField(null=True)       # true 면 easy, false 면 hard
    result = models.BooleanField(null=True)     # true 면 win, false 면 lose