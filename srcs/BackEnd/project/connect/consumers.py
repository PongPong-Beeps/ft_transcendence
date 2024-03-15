import json
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer

class ConnectConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'connect'
        
        
        ## authenticated user test ## 
        user = self.scope['user']
        print("user: ", user)
        if isinstance(user, AnonymousUser):
            print("User is anonymous")
            # 사용자가 익명일 경우 연결을 거부함
            # await self.close()
        else:
            print("user is authenticated:", user)
            # await self.channel_layer.group_add(
            #     self.room_group_name,
            #     self.channel_name
            # )
            # await self.accept()
            
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, message):
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
