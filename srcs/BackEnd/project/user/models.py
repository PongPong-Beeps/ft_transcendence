from django.db import models

class User(models.Model) :
    nickname = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    # login_type = models.CharField(max_length=50)

    # REQUIRED_FIELDS = ['email']  # 사용자 생성 시 필수로 입력해야 하는 필드

    def __str__(self):
        return self.nickname