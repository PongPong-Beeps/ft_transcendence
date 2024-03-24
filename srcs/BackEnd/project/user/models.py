from django.db import models

class User(models.Model):
    nickname = models.CharField(max_length=20)
    email = models.EmailField(unique=True)

    blacklist = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='_blacklist') # 블랙리스트
    friendlist = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='_friendlist') # 친구 목록
    
    image_file = models.ImageField(upload_to='user_images/', blank=True, null=True) # 프로필 사진

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