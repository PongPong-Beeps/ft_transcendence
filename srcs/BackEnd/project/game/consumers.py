import json
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Game
from channels.db import database_sync_to_async


# 프론트에서 쿼리로 전달 : category, type, mode
# category = "create_room" or "invite" or "quick_start" 
# type = models.CharField(max_length=20) #one_to_one or "tournament"
# mode = models.CharField(max_length=20) #easy or hard

# api Query
# {
#     "category": "create_room" or "invite" or "quick_start" ,
#     "type" = "one_to_one" or "tournament",
#     "mode" = "easy or hard"
#     "game_id" = "string", #초대수락시에만 전달
# }

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        if self.scope['category'] == "create_room":
            await self.create_room(user)
        elif self.scope['category'] == "quick_start":
            await self.quick_start(user)
        elif self.scope['category'] == "invite":
            await self.accept_invite(user)
                
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )   
        await self.accept()
        await self.send_game_status()
    
    async def disconnect(self, message):
        user = self.scope['user']
        
        await self.remove_player_and_check_game(user)
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def remove_player_and_check_game(self, user):
        game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
        for player_slot in ['player1', 'player2', 'player3', 'player4']:
            if getattr(game, player_slot) == user.nickname:
                setattr(game, player_slot, '')
                await database_sync_to_async(game.save)()
                await database_sync_to_async(game.check_full)()
        if game.player1 == '' and game.player2 == '' and game.player3 == '' and game.player4 == '':
            await database_sync_to_async(game.delete)()
        
    async def create_room(self, user):
        game = await database_sync_to_async(Game.objects.create)(type=self.scope['type'], mode=self.scope['mode'], player1=user.nickname)
        await database_sync_to_async(game.save)()
        self.room_group_name = str(game.id)

    async def quick_start(self, user):
        game_queryset = await database_sync_to_async(Game.objects.filter)(type=self.scope['type'], mode=self.scope['mode'], is_full=False)
        game = await database_sync_to_async(game_queryset.first)()
        if game:
            empty_slot = game.get_empty_player_slot()
            setattr(game, empty_slot, user.nickname)
            await database_sync_to_async(game.save)()
            await database_sync_to_async(game.check_full)()
            self.room_group_name = str(game.id)
        else:
            await self.create_room(user)

    async def accept_invite(self, user):
        game = await database_sync_to_async(Game.objects.filter)(id=self.scope['game_id'])
        if not game:
            await self.accept()
            await self.send(text_data=json.dumps({
                'status': '404',
                'message': 'The game does not exist.'
            }))
            await self.close()
        elif game.is_full:
            await self.accept()
            await self.send(text_data=json.dumps({
                'status': '405',
                'message': 'The game is full.'
            }))
            await self.close()
        else:
            empty_slot = game.get_empty_player_slot()
            setattr(game, empty_slot, user.nickname)
            await database_sync_to_async(game.save)()
            await database_sync_to_async(game.check_full)()
            self.room_group_name = str(game.id)

    
    async def send_game_status(self):
        game = await database_sync_to_async(Game.objects.get)(id=self.room_group_name)
        await self.send(text_data=json.dumps({
            'status': '200',
            'message': 'Connected to game room.',
            'room_group_name': self.room_group_name,
            'type': self.scope['type'],
            'mode': self.scope['mode'],
            'player1': game.player1 if game.player1 else None,
            'player2': game.player2 if game.player2 else None,
            'player3': game.player3 if game.player3 else None,
            'player4': game.player4 if game.player4 else None,
            'is_full': game.is_full,
        }))
