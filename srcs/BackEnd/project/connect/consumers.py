import json
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Client
from channels.db import database_sync_to_async
from user.models import User

class ConnectConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'connect'
        user = self.scope['user']
        if isinstance(user, AnonymousUser):
            print("User is anonymous")
            # await self.close()
        else:
            print("user is authenticated:", user)
            
            #중복유저에게 disconnect 하게 하기
            double_clients = await database_sync_to_async(list)(Client.objects.filter(user=user))
            if double_clients: #중복유저가 있을 경우
                for double_client in double_clients:
                    await self.channel_layer.send(
                        double_client.channel_name, { "type": "double_user" }
                    )
            
            client = await database_sync_to_async(Client.objects.create)(channel_name=self.channel_name, user=user)
            await database_sync_to_async(client.save)()
            print("client created, ", client)
            
            # await self.channel_layer.group_add(
            #     self.room_group_name,
            #     self.channel_name
            # )
            # await self.accept()
            #동기적인 코드를 비동기적으로 실행하기 위해 database_sync_to_async를 사용 : User, Client, save
            
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        await self.channel_layer.group_send(
          self.room_group_name, {"type": "friend_list", "sender": user.id}
        )
        
    async def disconnect(self, close_code):
        user = self.scope['user']
        
        client = await database_sync_to_async(Client.objects.get)(channel_name=self.channel_name)
        await database_sync_to_async(client.delete)()
        
        if close_code == 4003 : #중복유저가 있어서 disconnect된 경우
            print("double user disconnected : ", self.channel_name)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.channel_layer.group_send(
          self.room_group_name, {"type": "friend_list", "sender": user.id}
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
        elif type == 'invite':
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "invited", "sender": sender, "receiver": text_data_json["receiver"]}
            )
    
    async def invited(self, event):
        user = self.scope['user']
        sender_id = event['sender']
        receiver_id = event['receiver']
        if user.id == receiver_id: #초대된 닉네임이 나라면
            sender_user = await database_sync_to_async(User.objects.get)(id=sender_id)
            receiver_user = await database_sync_to_async(User.objects.get)(id=receiver_id)
            #from game.models import Game
            #game = await database_sync_to_async(Game.objects.get)(name=sender_id) #게임방 연결 후 주석해제
            await self.send(text_data=json.dumps({
                "type": "invited",
                "sender": sender_user.nickname,
                "receiver": receiver_user.nickname,
                #"game_type" : game.type,
                #"game_mode" : game.mode,
            })
        )
    
    async def friend_list(self, event):
        user = self.scope['user']
        sender = event['sender']
        
        if user.id == sender: #자신의 친구목록을 요청한 경우
            friend_list_json = await self.generate_friend_list_status_json(user)
            await self.send(text_data=friend_list_json)
            
        else: #친구의 상태가 변한 경우
            sender_exists_in_friends = await database_sync_to_async(lambda: user.friendlist.filter(id=sender).exists())()
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
                "id" : friend.id,
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
        
        is_blocked = await database_sync_to_async(lambda: user.blacklist.filter(id=sender).exists())()
        if not is_blocked:
            sender_user = await database_sync_to_async(User.objects.get)(id=sender)
            sender_nick = sender_user.nickname
            await self.send(text_data=json.dumps({
                "type": "all_chat",
                "sender": sender_nick,
                "message": message
            }))
    
    async def dm_chat(self, event):
        user = self.scope['user']
        sender = event['sender']
        receiver = event['receiver']
        message = event['message']
        is_receiver = user.id == receiver
        is_sender = user.id == sender
        is_blocked_sender = await database_sync_to_async(lambda: user.blacklist.filter(id=sender).exists())()
        is_blocked_receiver = await database_sync_to_async(lambda: user.blacklist.filter(id=receiver).exists())()
        
        if is_receiver and not is_blocked_sender:   # receiver가 sender를 차단하지 않은 경우
            print("receiver: ", receiver, "sender: ", sender, "message: ", message)
            sender_user = await database_sync_to_async(User.objects.get)(id=sender)
            if sender_user:
                sender_nick = sender_user.nickname
            else:
                sender_nick = "Unknown User"
            await self.send(text_data=json.dumps({
                "type": "dm_chat",
                "sender": sender_nick,
                "message": message
            }))
        
        if is_sender and not is_blocked_receiver:   # sender가 receiver를 차단하지 않은 경우
            print("receiver: ", receiver, "sender: ", sender, "message: ", message)
            receiver_user = await database_sync_to_async(User.objects.get)(id=receiver)
            if receiver_user:
                receiver_nick = receiver_user.nickname
            else:
                receiver_nick = "Unknown User"
            await self.send(text_data=json.dumps({
                "type": "dm_chat",
                "receiver": receiver_nick,
                "message": message
            }))

    async def double_user(self, event):
        await self.send(text_data=json.dumps({
            "status": 4003,
            "message" : "double user connected",
        }))
        await self.close(4003)