import json
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Game, Player, Ball, Paddle
from channels.db import database_sync_to_async
from connect.models import Client
from user.views import get_image #이미지를 가져오는 함수
import logging #로그를 남기기 위한 모듈
from connect.models import InvitationQueue
from user.models import User
from .utils import serialize_player, serialize_round_players, serialize_fixed_data, generate_round_info, update_match_history, determine_winner
from .game_logic import update, init_game_objects
import asyncio
from asyncio import Event
import random

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        client = await database_sync_to_async(Client.objects.get)(user=user)
        
        double_players = await database_sync_to_async(list)(Player.objects.filter(client=client))
        if double_players:
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
        
        await self.send(text_data=json.dumps({
            'status': '2000',
            'message': 'success.'
        }))
                
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
        if game and game.is_gameRunning == False:
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
        elif type == 'paddle':
            direction = text_data_json.get("direction")
            asyncio.create_task(self.move_paddle(self.scope['user'], direction))
        elif type == 'item':
            asyncio.create_task(self.using_item(self.scope['user']))
    
    async def get_player_number(self, round, user, type):
        if round is None:
            print("get_player_number: round is None")
            return None
        player_num = None
        players = await database_sync_to_async(round.get_players)(type)
        for i, player in enumerate(players):
            if player == user:
                if i == 0 or i == 2:
                    player_num = 1
                elif i == 1 or i == 3:
                    player_num = 2
                break
        return player_num
 
    async def using_item(self, user):
        game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
        round = await database_sync_to_async(game.get_next_round)()
        type = game.type
        player_num = await self.get_player_number(round, user, type)
        
        if type == 'one_to_one':
            if player_num == 1 and round.slot_1.status:
                to = 'player_2'
                round.slot_1.status = False #슬롯 비워주기
            elif player_num == 2 and round.slot_2.status:
                to = 'player_1'
                round.slot_2.status = False #슬롯 비워주기
            else: #플레이어가 아니거나, 슬롯에 아이템이 없을 경우
                print("player is not in the round or slot is empty")
                return
            
        elif type == 'tournament':
            if player_num == 1 and round.slot_1.status:
                to = 'player_2'
                round.slot_1.status = False #슬롯 비워주기
            elif player_num == 2 and round.slot_2.status:
                to = 'player_1'
                round.slot_2.status = False #슬롯 비워주기
            else: #플레이어가 아니거나, 슬롯에 아이템이 없을 경우
                print("player is not in the round or slot is empty")
                return

        #b_add(공추가)는 1/11 확률, b_up(공속도업), p_down(패들크기줄이기)는 각 5/11확률
        item_type = random.choice(["b_add"] * 5 + ["b_up", "p_down"] * 5)

        balls=round.balls
        ball=round.balls[0]

        if item_type == 'b_up': # 공속도 업 (최대 기본 속도 x 4)
            ball.speed = ball.speed + 2 if ball.speed < Ball().speed * 10 else ball.speed
        elif item_type == 'b_add': # 공 추가 (상대방 쪽으로)
            balls.append(Ball(10, 0.5, to))
        elif item_type == 'p_down': # 패들 height 줄이기 (상대방 패들)
            if type == 'one_to_one':
                if to == 'player_1':
                    round.paddle_1.height = round.paddle_1.height - (Paddle().height / 5 * 1) if round.paddle_1.height > Paddle().height / 5 * 1 else round.paddle_1.height
                elif to == 'player_2':
                    round.paddle_2.height = round.paddle_2.height - (Paddle().height / 5 * 1) if round.paddle_2.height > Paddle().height / 5 * 1 else round.paddle_2.height
            elif type == 'tournament':
                if to == 'player_1':
                    round.paddle_1.height = round.paddle_1.height - (Paddle().height / 5 * 1) if round.paddle_1.height > Paddle().height / 5 * 1 else round.paddle_1.height
                    round.paddle_3.height = round.paddle_3.height - (Paddle().height / 5 * 1) if round.paddle_3.height > Paddle().height / 5 * 1 else round.paddle_3.height
                elif to == 'player_2':
                    round.paddle_2.height = round.paddle_2.height - (Paddle().height / 5 * 1) if round.paddle_2.height > Paddle().height / 5 * 1 else round.paddle_2.height
                    round.paddle_4.height = round.paddle_4.height - (Paddle().height / 5 * 1) if round.paddle_4.height > Paddle().height / 5 * 1 else round.paddle_4.height
        
        # await database_sync_to_async(round.save)()
        
        await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "item",
                    "nickname": user.nickname,
                    "item_type": item_type,
                }
        )
        print("item used")
        
    async def item(self, event):
        await self.send(text_data=json.dumps(event))   
            
    async def move_paddle(self, user, direction):
        game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
        round = await database_sync_to_async(game.get_next_round)()
        type = game.type
        
        if round is None:
            print("round is None")
            return
        players = await database_sync_to_async(round.get_players)(type)
        for i, player in enumerate(players):
            if player == user:
                if i == 0:
                    await round.paddle_1.change_direction(direction)
                elif i == 1:
                    await round.paddle_2.change_direction(direction)
                elif i == 2:
                    await round.paddle_3.change_direction(direction)
                elif i == 3:
                    await round.paddle_4.change_direction(direction)
                print("paddle moved ", round.paddle_1.direction) #test code
                break
            
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
            
    async def process_game(self, game):
        await self.process_game_start(game)
        await asyncio.sleep(5)
        await self.process_game_ing(game)
        await self.process_game_end(game)
        
    async def process_game_start(self, game):
        await database_sync_to_async(game.initialize_rounds)()
        rounds_data = await asyncio.gather(
            serialize_round_players(game.round1, game.type),
            serialize_round_players(game.round2, game.type)
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
        
    async def game_start(self, event):
        await self.send(text_data=json.dumps(event))
    
    async def process_game_ing(self, game):
        round_number = 1
        while game.is_gameRunning:
            next_round = await database_sync_to_async(game.get_next_round)()
            print("next_round:", next_round) #test code
            if next_round:
                print("round is started") #test code
                await self.process_round_start(next_round, game.type)
                await self.process_round_ing(next_round, game.mode, game.type)
                winner = await self.process_round_end(next_round)
                await database_sync_to_async(update_match_history)(next_round, game)
                print("round is end") #test code
                await asyncio.sleep(5) #test code 
                await determine_winner(game, winner, round_number)
                round_number += 1
            else:
                break
        print("game is End") #test code

    async def process_round_start(self, round, type):
        round_info = await serialize_round_players(round, type)
        fixed_data = await serialize_fixed_data(round)
        round_ready_info = {
            "type": "round_ready",
            "player_data": round_info,
            "fix": fixed_data,
        }
        await self.channel_layer.group_send(
            self.room_group_name,
            round_ready_info
        )
        
    async def round_ready(self, event):
        await self.send(text_data=json.dumps(event))

    async def process_round_ing(self, round, mode, type):
        await asyncio.sleep(5)
        await self.channel_layer.group_send(
            self.room_group_name,
            { "type": "round_start" }
        )
        await database_sync_to_async(init_game_objects)(round, mode, type)
        while not round.is_roundEnded:
            await database_sync_to_async(update)(round, mode, type)
            round_ing_info = await database_sync_to_async(generate_round_info)(round, mode, type)
            await self.channel_layer.group_send(
                    self.room_group_name,
                    round_ing_info
            )
            await asyncio.sleep(0.01) #게임 속도 조절을 위한 sleep
        print("round is end = ", round) #test code
    
    async def round_start(self, event):
        await self.send(text_data=json.dumps({"type": "round_start"}))
            
    async def round_ing(self, event):
        await self.send(text_data=json.dumps(event))
        
    async def process_round_end(self, round):
        round_end_info = {
            "type": "round_end",
            "winner": await serialize_player(round.winner),
        }
        await self.channel_layer.group_send(
            self.room_group_name,
            round_end_info
        )
        return round.winner
          
    async def round_end(self, event):
        await self.send(text_data=json.dumps(event))
            
    async def process_game_end(self, game):
        winner = await serialize_player(game.winner)
        game_info = {
            "type": "game_end",
            "game_type": game.type,
            "game_mode": game.mode,
            "winner": winner,
        }
        
        await self.channel_layer.group_send(
                self.room_group_name,
                game_info
        )
        
        await asyncio.sleep(5) #빵빠레 띄우는 시간
        await database_sync_to_async(game.delete)()
        
    async def game_end(self, event):
        await self.send(text_data=json.dumps(event))