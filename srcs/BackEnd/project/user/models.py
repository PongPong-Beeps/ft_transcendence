from django.db import models

class User(models.Model):
    nickname = models.CharField(max_length=20)
    email = models.EmailField(unique=True)

    #Many To Many = 이 모델의 인스턴스는 다른 여러 인스턴스를 블랙리스트에 넣을 수 있다.
    #'self' = 같은 모델의 인스턴스를 가리킨다.
    #'blank=True' = 블랙리스트에 아무것도 넣지 않아도 된다.
    #symmetrical=False = 블랙리스트에 상대방이 나를 블랙리스트에 넣었을 때, 나도 상대방을 블랙리스트에 넣지 않아도 된다.
    #related_name = 이부분이 없으면 blacklist와 firendlist가 같은 이름을 가지게 되어서 충돌이 일어난다.
    #또한 필드이름과 related_name이 같으면 충돌이 일어난다. ex) blacklist = models.ManyToManyField(related_name='blacklist')
    blacklist = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='_blacklist') # 블랙리스트
    friendlist = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='_friendlist') # 친구 목록
    
    # is_online = models.BooleanField(default=False)
    # login_type = models.CharField(max_length=50)

    # REQUIRED_FIELDS = ['email']  # 사용자 생성 시 필수로 입력해야 하는 필드

    def __str__(self):
        return self.nickname


class MatchHistory(models.Model) :
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='match_history')
    
    nick_me = models.CharField(max_length=20)    # player1
    nick_opponent = models.CharField(max_length=20)    # player2
    datetime = models.DateTimeField(auto_now=False, auto_now_add=True) # 게임 날짜
    tournament = models.BooleanField(null=True) # true 면 tournament, false 면 normal
    easy_mode = models.BooleanField(null=True)       # true 면 easy, false 면 hard
    result = models.BooleanField(null=True)     # true 면 win, false 면 lose