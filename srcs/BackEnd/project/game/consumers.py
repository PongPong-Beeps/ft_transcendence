import json
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Game
from channels.db import database_sync_to_async
from connect.models import Client
from user.views import get_image #이미지를 가져오는 함수
import logging #로그를 남기기 위한 모듈
from connect.models import InvitationQueue
from user.models import User

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
        # await database_sync_to_async(game.verify_players)() #player들의 접속상태 검증
        await database_sync_to_async(game.exit_player)(client)
        
    async def create_room(self, client):
        game = await database_sync_to_async(Game.objects.create)(type=self.scope['type'], mode=self.scope['mode'])
        await database_sync_to_async(game.save)()
        await database_sync_to_async(game.entry_player)(client) #플레이어 입장
        self.room_group_name = str(game.id)

    async def quick_start(self, client):
        game_queryset = await database_sync_to_async(Game.objects.filter)(type=self.scope['type'], mode=self.scope['mode'], is_full=False)
        game = await database_sync_to_async(game_queryset.first)()
        if game:
            await database_sync_to_async(game.entry_player)(client)
            self.room_group_name = str(game.id)
        else:
            await self.create_room(client)

    async def accept_invite(self, user, client):
        try :
            #초대장이 여러개일 경우도 생각해서 배열로 받음 
            invitation_queryset = await database_sync_to_async(InvitationQueue.objects.filter)(receiver_id=user.id)
            invitation = await database_sync_to_async(invitation_queryset.first)() #그중 젤 오래된 초대장을 받음
            
            game_id = invitation.game_id #초대장이 속한 게임의 id
            game = await database_sync_to_async(Game.objects.get)(id=game_id) #초대장이 속한 게임
            
            await database_sync_to_async(invitation.delete)() #초대장 삭제
            
            if game.is_full:
                await self.accept()
                await self.send(text_data=json.dumps({
                    'status': '4001',
                    'message': 'The game is full.'
                }))
                await self.close(4001)
                return 'fail'
            else:
                await database_sync_to_async(game.entry_player)(client)
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
        client = await database_sync_to_async(Client.objects.get)(user=user)
        game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
    
        await database_sync_to_async(game.do_ready)(client)
        
        await self.channel_layer.group_send(
                self.room_group_name, {"type": "game_status"}
            )
        
        all_ready = await database_sync_to_async(game.all_players_ready)()
        if all_ready:
            print("All players are ready. Starting the game...")
            await database_sync_to_async(game.initialize_rounds)()
            await self.channel_layer.group_send(
                    self.room_group_name, {"type": "game_start"}
            )
        else:
            print("Not all players are ready.")
    
    async def game_status(self, event):
        game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
        await database_sync_to_async(game.verify_players)() #player들의 접속상태 검증
        players_nickname = await database_sync_to_async(game.get_players_nickname)()
        players_image = await database_sync_to_async(game.get_players_image)()
        players_ready = await database_sync_to_async(game.get_players_ready)()
        players_info = []
        for i in range(4) :
            player_info = {}
            player_info["nickname"] = players_nickname[i]
            player_info["image"] = players_image[i]
            player_info["ready"] = players_ready[i]
            players_info.append(player_info)
        
        text_data = {
            'type': game.type,
            'mode': game.mode,
            "players" : players_info,

            'status': '200',
            'message': 'Connected to game room.',
            'room_group_name': self.room_group_name,
            'is_full': game.is_full,
        }        
        try:
            await self.send(text_data=json.dumps(text_data))
        except Exception as e:
            logging.error(f"Error while sending data: {e}")
     
    async def game_start(self, event):
        await self.send(text_data=json.dumps({
            'message': "game start!!"
        }))   