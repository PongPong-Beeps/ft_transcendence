from django.db import models
from user.models import User

class BugReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()