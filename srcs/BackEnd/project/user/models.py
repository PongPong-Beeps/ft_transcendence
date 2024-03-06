from django.db import models

class User(models.Model):
    nickname = models.CharField(max_length=20)
    email = models.EmailField(unique=True)

    #Many To Many = 이 모델의 인스턴스는 다른 여러 인스턴스를 블랙리스트에 넣을 수 있다.
    #'self' = 같은 모델의 인스턴스를 가리킨다.
    #'blank=True' = 블랙리스트에 아무것도 넣지 않아도 된다.
    #symmetrical=False = 블랙리스트에 상대방이 나를 블랙리스트에 넣었을 때, 나도 상대방을 블랙리스트에 넣지 않아도 된다.
    blacklist = models.ManyToManyField('self', blank=True, symmetrical=False)
    
    # is_online = models.BooleanField(default=False)
    # login_type = models.CharField(max_length=50)

    # REQUIRED_FIELDS = ['email']  # 사용자 생성 시 필수로 입력해야 하는 필드

    def __str__(self):
        return self.nickname