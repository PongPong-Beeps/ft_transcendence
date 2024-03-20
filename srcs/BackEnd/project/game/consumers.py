import json
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Game
from channels.db import database_sync_to_async
from connect.models import Client
from user.views import get_image #이미지를 가져오는 함수
import logging #로그를 남기기 위한 모듈

# 프론트에서 쿼리로 전달 : category, type, mode
# category = "create_room" or "invite" or "quick_start" 
# type = models.CharField(max_length=20) #one_to_one or "tournament"
# mode = models.CharField(max_length=20) #easy or hard

# api Query
# {
#     "category": "create_room" or "invite" or "quick_start" ,
#     "type" = "one_to_one" or "tournament",
#     "mode" = "easy or hard",
# }

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        client = await database_sync_to_async(Client.objects.get)(user=user)
        if self.scope['category'] == "create_room":
            await self.create_room(client)
        elif self.scope['category'] == "quick_start":
            await self.quick_start(client)
        elif self.scope['category'] == "invite":
            status = await self.accept_invite(user, client)
            if status == 'fail':
                return
                
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )   
        await self.accept()
        
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "game_status"}
        )
    
    async def disconnect(self, close_code):
        if close_code == 4000 :
            print('Game does not exist.')
            return
        elif close_code == 4001 :
            print('Game is full.')
            return
        
        user = self.scope['user']
        client = await database_sync_to_async(Client.objects.get)(user=user)
        await self.remove_player_and_check_game(client)
        
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "game_status"}
        )
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    

    async def remove_player_and_check_game(self, client):
        game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
        for player_slot in ['player1', 'player2', 'player3', 'player4']:
            if await database_sync_to_async(getattr)(game, player_slot) == client:
                await database_sync_to_async(setattr)(game, player_slot, None)
                await database_sync_to_async(game.save)()
                await database_sync_to_async(game.check_full)()
                break
            
        if await database_sync_to_async(getattr)(game, 'player1') is None and \
        await database_sync_to_async(getattr)(game, 'player2') is None and \
        await database_sync_to_async(getattr)(game, 'player3') is None and \
        await database_sync_to_async(getattr)(game, 'player4') is None:
            await database_sync_to_async(game.delete)()
        
    async def create_room(self, client):
        game = await database_sync_to_async(Game.objects.create)(type=self.scope['type'], mode=self.scope['mode'], player1=client)
        await database_sync_to_async(game.save)()
        self.room_group_name = str(game.id)

    async def quick_start(self, client):
        game_queryset = await database_sync_to_async(Game.objects.filter)(type=self.scope['type'], mode=self.scope['mode'], is_full=False)
        game = await database_sync_to_async(game_queryset.first)()
        if game:
            empty_slot = await game.get_empty_player_slot()
            await database_sync_to_async(setattr)(game, empty_slot, client)
            await database_sync_to_async(game.save)()
            await database_sync_to_async(game.check_full)()
            self.room_group_name = str(game.id)
        else:
            await self.create_room(client)

    async def accept_invite(self, user, client):
        try :
            #게임 대기열 머지 후 수정
            #invitation = await database_sync_to_async(InvitationQueue.objects.get)(receiver_id=user.id) #초대 대기열에서 초대장 조회
            #sender_id = invitation.sender_id #초대한 사람의 id  
            #sender_user = await database_sync_to_async(User.objects.get)(id=sender_id) #초대한 사람의 user
            #sender_client = await database_sync_to_async(Client.objects.get)(user=sender_user) #초대한 사람의 client
            #game = await database_sync_to_async(Game.objects.get)(client=sender_client) #초대한 사람의 client가 참여한 게임
            
            game = await database_sync_to_async(Game.objects.get)(id=self.scope['game_id'])
            if game.is_full:
                await self.accept()
                await self.send(text_data=json.dumps({
                    'status': '4001',
                    'message': 'The game is full.'
                }))
                await self.close(4001)
                return 'fail'
            else:
                empty_slot = await game.get_empty_player_slot()
                await database_sync_to_async(setattr)(game, empty_slot, client)
                await database_sync_to_async(game.save)()
                await database_sync_to_async(game.check_full)()
                self.room_group_name = str(game.id)
                return 'success'
        except Game.DoesNotExist:
            await self.accept()
            await self.send(text_data=json.dumps({
                'status': '4000',
                'message': 'The game does not exist.'
            }))
            await self.close(4000)
            return 'fail'

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        type = text_data_json["type"]
        
        if type == 'ready':
            await self.channel_layer.send(
                self.channel_name, {"type": "ready"}
            )
        elif type == 'game_status':
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "game_status"}
            )
            
    async def ready(self, event):
        user = self.scope['user']
        game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
        for player in ['player1', 'player2', 'player3', 'player4']:
            client = await database_sync_to_async(getattr)(game, player)
            if client :
                if await database_sync_to_async(getattr)(client, 'user') == user:
                    player_num = player[6]
                    break
        p_ready = 'p' + player_num + '_ready'
        is_ready = await database_sync_to_async(getattr)(game, p_ready)
        
        if is_ready == True :
            await database_sync_to_async(setattr)(game, p_ready, False)
        else :
            await database_sync_to_async(setattr)(game, p_ready, True)
            
        await database_sync_to_async(game.save)()
        
        await self.channel_layer.group_send(
                self.room_group_name, {"type": "game_status"}
            )


    async def get_player(self, game, player):
        client = await database_sync_to_async(getattr)(game, player) if await database_sync_to_async(getattr)(game, player) else None
        if client :
            user = await database_sync_to_async(getattr)(client, 'user') if await database_sync_to_async(getattr)(client, 'user') else None
            if user :
                return user.nickname
        return None
    
    async def get_image_data(self, game, player):
        player_client = await database_sync_to_async(getattr)(game, player) if await database_sync_to_async(getattr)(game, player) else None
        if player_client :
            player_user = await database_sync_to_async(getattr)(player_client, 'user') if await database_sync_to_async(getattr)(player_client, 'user') else None
            if player_user :
                image_data = await database_sync_to_async(get_image)(player_user)
                return image_data
        return None
                
    async def game_status(self, event):
        game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
        text_data = {
            'type': game.type,
            'mode': game.mode,
            
            'p1' : await self.get_player(game, 'player1'),
            'p2' : await self.get_player(game, 'player2'),
            'p3' : await self.get_player(game, 'player3'),
            'p4' : await self.get_player(game, 'player4'),
            
            'p1_img' : await self.get_image_data(game, 'player1'),
            'p2_img' : await self.get_image_data(game, 'player2'),
            'p3_img' : await self.get_image_data(game, 'player3'),
            'p4_img' : await self.get_image_data(game, 'player4'),
            
            'p1_ready' : game.p1_ready,
            'p2_ready' : game.p2_ready,
            'p3_ready' : game.p3_ready,
            'p4_ready' : game.p4_ready,
            
            'status': '200',
            'message': 'Connected to game room.',
            'room_group_name': self.room_group_name,
            'is_full': game.is_full,
        }
        try:
            await self.send(text_data=json.dumps(text_data))
        except Exception as e:
            logging.error(f"Error while sending data: {e}")