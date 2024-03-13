import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.contrib.auth.models import AnonymousUser


class ConnectConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = 'connect'
        
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        
        ## authenticated user test ## 
        user = self.scope['user']
        print("user: ", user)
        if isinstance(user, AnonymousUser):
            print("User is anonymous")
        else:
            print("user is authenticated:", user)
            
        self.accept()
    
    def disconnect(self, message):
        
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
