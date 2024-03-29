import json
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Game, Player
from channels.db import database_sync_to_async
from connect.models import Client
from user.views import get_image #이미지를 가져오는 함수
import logging #로그를 남기기 위한 모듈
from connect.models import InvitationQueue
from user.models import User
from .utils import serialize_round_players, generate_round_info, serialize_round_info_to_player
from .game_logic import update, init_game_objects
import asyncio
from asyncio import Event

class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_init_received = Event() ###### EVENT
    
    async def connect(self):
        user = self.scope['user']
        client = await database_sync_to_async(Client.objects.get)(user=user)
        
        #중복플레이어 disconnect 하게 하기        
        double_players = await database_sync_to_async(list)(Player.objects.filter(client=client))
        if double_players: #중복플레이어가 있을 경우
            for double_player in double_players:
                await self.channel_layer.send(
                    double_player.channel_name, { "type": "double_player" }
                )
        
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
    
    async def double_player(self, event):
        await self.send(text_data=json.dumps({
            "status": 4002,
            "message" : "double player connected",
        }))
        await self.close(4002)

    async def disconnect(self, close_code):
        user = self.scope['user']
        client = await database_sync_to_async(Client.objects.get)(user=user)
        
        if close_code == 4000 :
            print('Game does not exist.')
            return
        elif close_code == 4001 :
            print('Game is full.')
            return
        elif close_code == 4002 :
            print('double game connected')
    
        try:
            game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
            await database_sync_to_async(game.exit_player)(self.channel_name)
            if not game.is_gameRunning:
                await self.channel_layer.group_send(
                    self.room_group_name, {"type": "game_status"}
                )
        except Game.DoesNotExist:
            print(f"Game with id {self.room_group_name} does not exist.")
             
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
    async def create_room(self, client):
        game = await database_sync_to_async(Game.objects.create)(type=self.scope['type'], mode=self.scope['mode'])
        await database_sync_to_async(game.save)()
        await database_sync_to_async(game.entry_player)(client, self.channel_name) #플레이어 입장
        self.room_group_name = str(game.id)

    async def quick_start(self, client):
        game_queryset = await database_sync_to_async(Game.objects.filter)(type=self.scope['type'], mode=self.scope['mode'], is_full=False)
        game = await database_sync_to_async(game_queryset.first)()
        if game:
            await database_sync_to_async(game.entry_player)(client, self.channel_name)
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
                await database_sync_to_async(game.entry_player)(client, self.channel_name)
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
        elif type == 'game_init':
            width = text_data_json.get("width")
            height = text_data_json.get("height")
            if width is not None and height is not None:
                await self.handle_game_init(self.scope['user'], width, height)
            else:
                print("Width and height must be provided for game initialization.")
            self.game_init_received.set() ###### EVENT   
            
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
            asyncio.create_task(self.process_game(game))
        else:
            print("Not all players are ready.")
    
    async def game_status(self, event):
        game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
        players_info = await database_sync_to_async(game.get_players_info)()
        
        text_data = {
            'type': "game_status",
            'game_type': game.type,
            'game_mode': game.mode,
            "players" : players_info,
            'room_group_name': self.room_group_name,
            'is_full': game.is_full,
        }        
        try:
            await self.send(text_data=json.dumps(text_data))
        except Exception as e:
            logging.error(f"Error while sending data: {e}")
        
    async def handle_game_init(self, user, width, height):
        try:
            client = await database_sync_to_async(Client.objects.get)(user=user)
            game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
            await database_sync_to_async(game.initialize_player_size)(client, width, height)
        except Client.DoesNotExist:
            print("Client does not exist.")
        except Game.DoesNotExist:
            print("Game does not exist.")
            
    async def process_game(self, game):
        await self.process_game_start(game)
        await self.process_game_ing(game)
        # await self.process_game_end(game) 내부에서 game.is_gameRunning = False로 변경
        
    async def process_game_start(self, game):
        await database_sync_to_async(game.initialize_rounds)()
        rounds_data = await asyncio.gather(
            serialize_round_players(game.round1),
            serialize_round_players(game.round2)
        )
        game_info = {
            "type": "game_start",
            "game_type": game.type,
            "game_mode": game.mode,
            "round_data": rounds_data,
        }
        await self.channel_layer.group_send(
                self.room_group_name,
                game_info
        )
        game.is_gameRunning = True
        await database_sync_to_async(game.save)()
        
    async def game_start(self, event):
        await self.send(text_data=json.dumps(event))
        
        
    async def process_game_ing(self, game):
        asyncio.create_task(self.game_init_received.wait()) ###### EVENT
        while game.is_gameRunning:
            next_round = await database_sync_to_async(game.get_next_round)()
            print("next_round:", next_round) #test code
            if next_round:
                print("round is started") #test code
                await self.process_round_start(next_round)
                await self.process_round_ing(next_round)
                print("round is end") #test code
                await asyncio.sleep(5) #test code 
                # await self.process_round_end(next_round)
            else:
                break
        print("game is End") #test code

    async def process_round_start(self, round):
        round_info = await serialize_round_players(round)
        round_start_info = {
            "type": "round_start",
            "player_data": round_info,
        }
        await self.channel_layer.group_send(
            self.room_group_name,
            round_start_info
        )
        
    async def round_start(self, event):
        await self.send(text_data=json.dumps(event))
    
    async def process_round_ing(self, round):
        await asyncio.sleep(5)
        await database_sync_to_async(init_game_objects)(round)
        while not round.is_roundEnded:
            await database_sync_to_async(update)(round)
            round_ing_info = await database_sync_to_async(generate_round_info)(round)
            await self.channel_layer.group_send(
                    self.room_group_name,
                    round_ing_info
            )
            await asyncio.sleep(0.001) #게임 속도 조절을 위한 sleep
        print("round is end = ", round) #test code
       
            
    async def round_ing(self, event):
        player = await database_sync_to_async(Player.objects.get)(channel_name=self.channel_name)
        round_info_to_player = await database_sync_to_async(serialize_round_info_to_player)(event, player)
        await self.send(text_data=json.dumps(round_info_to_player))
            