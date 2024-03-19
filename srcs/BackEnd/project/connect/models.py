from django.db import models
from user.models import User

class Client(models.Model):
    channel_name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client')
    
class InvitationQueue(models.Model):
    sender = models.CharField(max_length=30)
    receiver = models.CharField(max_length=30)
