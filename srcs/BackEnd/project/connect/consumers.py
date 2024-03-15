import json
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Client
from asgiref.sync import sync_to_async

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
            #동기적인 코드를 비동기적으로 실행하기 위해 sync_to_async를 사용 : User, Client, save
            client = await sync_to_async(Client.objects.create)(channel_name=self.channel_name, user=user)
            await sync_to_async(client.save)()
            print("client created, ", client)
            
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, message):
        
        client = await sync_to_async(Client.objects.get)(channel_name=self.channel_name)
        await sync_to_async(client.delete)()
        print("client deleted")
            
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
