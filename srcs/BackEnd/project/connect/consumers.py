import json
from asgiref.sync import async_to_sync
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer

class ConnectConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'connect'
        
        await self.channel_layer.group_add(
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
            
        await self.accept()
    
    async def disconnect(self, message):
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
