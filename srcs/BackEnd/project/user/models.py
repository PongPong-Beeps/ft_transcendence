from django.db import models

class User(models.Model):
    nickname = models.CharField(max_length=20)
    email = models.EmailField(unique=True)

    blacklist = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='_blacklist')
    friendlist = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='_friendlist')
    
    image_file = models.ImageField(upload_to='user_images/', blank=True, null=True)

    def __str__(self):
        return self.nickname
    

class MatchHistory(models.Model) :
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='match_history')
    
    nick_me = models.CharField(max_length=20)
    nick_opponent = models.CharField(max_length=20)
    datetime = models.DateTimeField(auto_now=False, auto_now_add=True)
    tournament = models.BooleanField(null=True)
    easy_mode = models.BooleanField(null=True)
    result = models.BooleanField(null=True)