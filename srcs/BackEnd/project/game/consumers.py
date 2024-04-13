import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Game, Player
from channels.db import database_sync_to_async
from connect.models import Client
from .utils import serialize_player, serialize_round_players, serialize_fixed_data, generate_round_info, update_match_history, determine_winner, move_paddle, use_item
from .game_logic import update, set_ball_moving
import asyncio
from .cache import set_game_info, delete_game_info
from connect.cache import set_user_info
from .connect import create_room, quick_start, sub_accept_invite

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
            self.room_group_name = await create_room(client, self.scope['type'], self.scope['mode'], self.channel_name)
        elif self.scope['category'] == "quick_start":
            self.room_group_name = await quick_start(client, self.scope['type'], self.scope['mode'], self.channel_name)
        elif self.scope['category'] == "invite":
            status = await self.accept_invite(user, client)
            if status == 'fail':
                return
                
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )   
        await self.accept()
        await database_sync_to_async(set_user_info)(user, self.room_group_name) 
        
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
        user = self.scope['user']
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
        await database_sync_to_async(set_user_info)(user, None)

    async def accept_invite(self, user, client):
        status = await sub_accept_invite(user, client, self.channel_name)
        
        if status['status'] == '2000':
            self.room_group_name = status['game_id']
            return 'success'
        else:
            await self.accept()
            await self.send(text_data=json.dumps(status))
            await self.close(int(status['status']))
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
            asyncio.create_task(move_paddle(self.room_group_name, self.scope['user'], direction))
        elif type == 'item':
            asyncio.create_task(use_item(self.room_group_name, self.scope['user']))
            
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
            print("game_status Error :", e)
            
    async def process_game(self, game):
        await self.process_game_start(game)
        await asyncio.sleep(5)
        await self.process_game_ing(game)
        await self.process_game_end(game)
        
    async def process_game_start(self, game):
        await database_sync_to_async(game.initialize_rounds)()
        if game.type == 'tournament': #two_on_two
            rounds_data = await serialize_round_players(game.round1, game.type)
        else:
            rounds_data = await asyncio.gather(
                serialize_round_players(game.round1, game.type),
                serialize_round_players(game.round2, game.type),
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
                await self.process_round_ing(next_round, game.mode, game.id, game.type)
                winner = await self.process_round_end(next_round, game.type)
                await database_sync_to_async(update_match_history)(next_round, game)
                print("round is end") #test code
                await asyncio.sleep(5) #test code 
                await determine_winner(game, winner, round_number)
                round_number += 1
            else:
                break
        print("game is End") #test code

    async def process_round_start(self, round, game_type):
        round_info = await serialize_round_players(round, game_type)
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

    async def process_round_ing(self, round, mode, game_id, game_type):
        await asyncio.sleep(1)
        await self.channel_layer.group_send(
            self.room_group_name,
            { "type": "round_start" }
        )
        
        await database_sync_to_async(set_game_info)(game_id, mode, round)
        await database_sync_to_async(set_ball_moving)(game_id)
        while not round.is_roundEnded:
            await database_sync_to_async(update)(round, mode, game_id)
            round_ing_info = await database_sync_to_async(generate_round_info)(round, game_id)
            await self.channel_layer.group_send(
                    self.room_group_name,
                    round_ing_info
            )
            await asyncio.sleep(0.01) #게임 속도 조절을 위한 sleep
        await database_sync_to_async(delete_game_info)(game_id)
        print("round is end = ", round) #test code
    
    async def round_start(self, event):
        await self.send(text_data=json.dumps({"type": "round_start"}))
            
    async def round_ing(self, event):
        await self.send(text_data=json.dumps(event))
        
    async def process_round_end(self, round, game_type):
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
        
    async def game_end(self, event):
        await self.send(text_data=json.dumps(event))