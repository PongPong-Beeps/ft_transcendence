from django.db import models

class User(models.Model) :
    nickname = models.CharField(max_length=20)
    email = models.EmailField(unique=True) 
    is_online = models.BooleanField(default=False)
    login_type = models.CharField(max_length=50)

    # REQUIRED_FIELDS = ['email']  # 사용자 생성 시 필수로 입력해야 하는 필드

    def __str__(self):
        return self.nickname

# Friend list Table
class Friend(models.Model) :
    user = models.ForeignKey(User, related_name='friends', on_delete=models.CASCADE)
    friend = models.ForeignKey(User, related_name='friend_of', on_delete=models.CASCADE)

    def __str__(self) :
        return f"{self.user.nickname}의 친구 : {self.friend.nickname}"

# vs Record Table
class GameRecord(models.Model) :
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='record_user')
    opponent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='record_opponent')
    result = models.CharField(max_length=10) # 승 / 패 / 무
    date = models.DateField(auto_now_add=True)

    def __str__(self) :
        return f"{self.user.nickname} vs {self.opponent.nickname} : {self.result}"

# Blacklist Table
class Blacklist(models.Model) :
    user = models.ForeignKey(User, related_name='blacklist_user', on_delete=models.CASCADE)
    blocked_user = models.ForeignKey(User, related_name='blocked_user', on_delete=models.CASCADE)

    def __str__(self) :
        return f"{self.user.nickname}의 블랙리스트 : {self.blocked_user.nickname}"

# User List Table
class UserList(models.Model) :
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_list_user')
    date_joined = models.DateTimeField(auto_now_add=True)

    def __str__(self) :
        return f"{self.user.nickname} ({self.date_joined})"

# Game Room Table
class GameRoom(models.Model) :
    room_name = models.CharField(max_length = 20)
    players = models.ManyToManyField(User, related_name='game_room_user')
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self) :
        return self.room_name