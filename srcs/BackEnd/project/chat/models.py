from django.db import models

class ChannelGroup(models.Model):
    channel_name = models.CharField(max_length=255)
    group_name = models.CharField(max_length=255)