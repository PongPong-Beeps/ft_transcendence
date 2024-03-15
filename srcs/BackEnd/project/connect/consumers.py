import json
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Client
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async

class ConnectConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'connect'
        
        
        user = self.scope['user']
        if isinstance(user, AnonymousUser):
            print("User is anonymous")
            # await self.close()
        else:
            print("user is authenticated:", user)
            client = await sync_to_async(Client.objects.create)(channel_name=self.channel_name, user=user)
            await sync_to_async(client.save)()
            print("client created, ", client)
            
            # await self.channel_layer.group_add(
            #     self.room_group_name,
            #     self.channel_name
            # )
            # await self.accept()
            #동기적인 코드를 비동기적으로 실행하기 위해 sync_to_async를 사용 : User, Client, save
            
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        await self.channel_layer.group_send(
          self.room_group_name, {"type": "friend_list", "sender": user}
        )
        
    async def disconnect(self, message):
        user = self.scope['user']
        
        client = await sync_to_async(Client.objects.get)(channel_name=self.channel_name)
        await sync_to_async(client.delete)()
        print("client deleted")
            
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.channel_layer.group_send(
          self.room_group_name, {"type": "friend_list", "sender": user}
        )
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        type = text_data_json["type"]
        sender = text_data_json["sender"]
        
        if type == 'friend_list':
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "friend_list", "sender": sender}
            )
        elif type == 'all_chat':
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "all_chat", "sender": sender, "message": text_data_json["message"]}
            )
        elif type == 'dm_chat':
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "dm_chat", "sender": sender, "receiver": text_data_json["receiver"] ,"message": text_data_json["message"]}
            ) 
            
    
    async def friend_list(self, event):
        user = self.scope['user']
        sender = event['sender']
        
        if user.nickname == sender: #자신의 친구목록을 요청한 경우
            friend_list_json = await self.generate_friend_list_status_json(user)
            await self.send(text_data=friend_list_json)
            
        else: #친구의 상태가 변한 경우
            sender_exists_in_friends = await database_sync_to_async(lambda: user.friendlist.filter(nickname=sender).exists())()
            if sender_exists_in_friends:
                friend_list_json = await self.generate_friend_list_status_json(user)
                await self.send(text_data=friend_list_json)
    
    
    async def generate_friend_list_status_json(self, user):
        friends = await database_sync_to_async(lambda: list(user.friendlist.all()))()
        friendList = []

        for friend in friends:
            # 각 친구가 Client 모델에 존재하는지 확인 (온라인 상태인지 확인)
            is_online = await database_sync_to_async(Client.objects.filter(user=friend).exists)()
            friendList.append({
                "nickname": friend.nickname,
                "is_online": is_online
            })
        friendList_json = json.dumps({"friendList": friendList})
        return friendList_json
    
    ## print user's friends       
    async def print_user_friends(self, user):
        friends = await database_sync_to_async(lambda: list(user.friendlist.all()))()
        for friend in friends:
            print("Friend: ", friend.nickname)
    
    async def all_chat(self, event):
        user = self.scope['user']
        sender = event['sender']
        message = event['message']
        
        is_blocked = await database_sync_to_async(lambda: user.blacklist.filter(nickname=sender).exists())()
        if not is_blocked:
            await self.send(text_data=json.dumps({
                "type": "all_chat",
                "sender": sender,
                "message": message
            }))
    
    async def dm_chat(self, event):
        user = self.scope['user']
        sender = event['sender']
        receiver = event['receiver']
        message = event['message']
        
        is_receiver = user.nickname == receiver
        is_blocked = await database_sync_to_async(lambda: user.blacklist.filter(nickname=sender).exists())()
        if is_receiver and not is_blocked:
            await self.send(text_data=json.dumps({
                "type": "dm_chat",
                "sender": sender,
                "message": message
            }))
    
        
