import json
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Client, InvitationQueue
from channels.db import database_sync_to_async
from user.models import User
from game.models import Game
from .cache import set_user_info, get_user_info, delete_user_info
from django.core.cache import cache
import os

class ConnectConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'connect'
        user = self.scope['user']
        if isinstance(user, AnonymousUser):
            print("User is anonymous")
            await self.close()
        else:
            print("user is authenticated:", user)
            
            #중복유저 disconnect
            double_clients = await database_sync_to_async(list)(Client.objects.filter(user=user))
            if double_clients: #중복유저가 있을 경우
                for double_client in double_clients:
                    await self.channel_layer.send(
                        double_client.channel_name, { "type": "double_user" }
                    )
            
            client = await database_sync_to_async(Client.objects.create)(channel_name=self.channel_name, user=user)
            await database_sync_to_async(client.save)()
            print("client created, ", client)
            
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        await self.channel_layer.group_send(
          self.room_group_name, {"type": "friend_list", "sender": user.id}
        )
        await database_sync_to_async(set_user_info)(user, None)
        
        notice = cache.get("notice")
        if notice:
            await self.send(text_data=json.dumps(
                {"type": "notice", "content": notice }
            ))
        
    async def disconnect(self, close_code):
        user = self.scope['user']        
        await self.remove_clinet_and_invitation(user)

        if close_code == 4003 : #중복유저가 있어서 disconnect된 경우
            print("double user disconnected : ", self.channel_name)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.channel_layer.group_send(
          self.room_group_name, {"type": "friend_list", "sender": user.id}
        )
        await database_sync_to_async(delete_user_info)(user)
        
    async def remove_clinet_and_invitation(self, user):
        client = await database_sync_to_async(Client.objects.get)(channel_name=self.channel_name)
        await database_sync_to_async(client.delete)()
        
        invitations = await database_sync_to_async(list)(InvitationQueue.objects.filter(receiver_id=user.id))
        for invitation in invitations:
            await database_sync_to_async(invitation.delete)()

    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        type = text_data_json["type"]
        
        if type == 'friend_list':
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "friend_list", "sender": text_data_json["sender"]}
            )
        elif type == 'all_chat':
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "all_chat", "sender": text_data_json["sender"], "message": text_data_json["message"]}
            )
        elif type == 'dm_chat':
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "dm_chat", "sender": text_data_json["sender"], "receiver": text_data_json["receiver"] ,"message": text_data_json["message"]}
            )
        elif type == 'invite':
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "invited", "sender": text_data_json["sender"], "receiver": text_data_json["receiver"]}
            )
        elif type == 'check_admin':
            await self.channel_layer.send(
                self.channel_name, {"type": "check_admin"}
            )
        elif type == 'notice':
            cache.set("notice", text_data_json['content'])
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "notice", "content": text_data_json["content"]}
            )
            
    async def check_admin(self, event):
        user = self.scope['user']
        email = user.email
        if email == os.getenv('ADMIN_1')\
            or email == os.getenv('ADMIN_2')\
            or email == os.getenv('ADMIN_3')\
            or email == os.getenv('ADMIN_4'):
            await self.send(text_data=json.dumps({
                "type": "check_admin",
                "status": 2000,
                "message" : "admin",
            }))
        else:
            await self.send(text_data=json.dumps({
                "type": "check_admin",
                "status": 4000,
                "message" : "not admin",
            }))
    
    async def notice(self, event):
        print("notice event: ", event)
        await self.send(text_data=json.dumps(event))
            
    async def invited(self, event):
        user = self.scope['user']
        sender_id = event['sender']
        receiver_id = event['receiver']
        if user.id == receiver_id: #초대된 닉네임이 나라면
            receiver_user = await database_sync_to_async(User.objects.get)(id=receiver_id)
            sender_user = await database_sync_to_async(User.objects.get)(id=sender_id)
            sender_client = await database_sync_to_async(Client.objects.get)(user=sender_user)
            
            #모든 게임방 중에 sender가 들어있는 game방을 찾기
            games = await database_sync_to_async(lambda: list(Game.objects.all()))()
            for game in games:
                if await database_sync_to_async(game.is_player)(sender_client):
                    break
            
            #모달에 띄울 정보
            await self.send(text_data=json.dumps({
                "type": "invited",
                "sender": sender_user.nickname,
                "receiver": receiver_user.nickname,
                "game_type" : game.type,
                "game_mode" : game.mode,
                "sender_id" : sender_id,
                "receiver_id" : receiver_id,
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
        blacklist = await database_sync_to_async(lambda: list(user.blacklist.all()))()
        friends = await database_sync_to_async(lambda: list(user.friendlist.all()))()
        friendList = []

        for friend in friends:
            # 각 친구가 Client 모델에 존재하는지 확인 (온라인 상태인지 확인)
            is_online = await database_sync_to_async(Client.objects.filter(user=friend).exists)()
            is_block = friend in blacklist
            friendList.append({
                "id" : friend.id,
                "nickname": friend.nickname,
                "is_online": is_online,
                "is_block": is_block,

            })
        friendList_json = json.dumps({"friendList": friendList})
        return friendList_json
    
    async def all_chat(self, event):
        user = self.scope['user']
        sender = event['sender']
        message = event['message']
        
        sender_info = await database_sync_to_async(get_user_info)(sender)
        if sender_info:
            sender_nick = sender_info['nickname']
            sender_game = sender_info['game_id']
            
        user_info = await database_sync_to_async(get_user_info)(user.id)
        if user_info:
            user_game = user_info['game_id']
        
        if user_info and sender in user_info.get('black_list', []): #sender가 user의 블랙리스트에 있는 경우
            return
        
        if user_game == sender_game:
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
        is_receiver = user.id == receiver   # user가 receiver인지
        is_sender = user.id == sender       # user가 sender인지
        
        sender_info = await database_sync_to_async(get_user_info)(sender)
        receiver_info = await database_sync_to_async(get_user_info)(receiver)
        if sender_info and receiver in sender_info.get('black_list', []):       # receiver가 sender의 블랙리스트에 있는 경우
            is_blocked = True
        elif receiver_info and sender in receiver_info.get('black_list', []):   # sender가 receiver의 블랙리스트에 있는 경우
            is_blocked = True
        else:
            is_blocked = False
        
        if is_receiver and not is_blocked:   # user가 receiver인 경우
            print("receiver: ", receiver, "sender: ", sender, "message: ", message)
            sender_info = await database_sync_to_async(get_user_info)(sender)
            sender_nick = sender_info['nickname']
            await self.send(text_data=json.dumps({
                "type": "dm_chat",
                "sender": sender_nick,
                "message": message
            }))
        
        if is_sender and not is_blocked:     # user가 sender인 경우
            print("receiver: ", receiver, "sender: ", sender, "message: ", message)
            receiver_info = await database_sync_to_async(get_user_info)(receiver)
            receiver_nick = receiver_info['nickname']
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