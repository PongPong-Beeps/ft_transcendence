from channels.db import database_sync_to_async
from user.views import get_image
from .models import Ball, Paddle, Item
from user.models import MatchHistory
import os
from .cache import get_game_info, update_game_info
import random

WIDTH = int(os.getenv('WIDTH'))
HEIGHT = int(os.getenv('HEIGHT'))

async def serialize_player(player):
    if not player:
        return None
    serialized_player = {
            'id': player.id,
            'nickname': player.nickname,
            'image': get_image(player)
    }
    return serialized_player

async def serialize_round_players(round):
    if not round:
        return None

    player1 = await database_sync_to_async(lambda: round.player1)() if round.player1 else None
    player2 = await database_sync_to_async(lambda: round.player2)() if round.player2 else None
    
    serialized_players = []
    
    if player1:
        serialized_player1 = await serialize_player(player1)
        serialized_players.append(serialized_player1)

    if player2:
        serialized_player2 = await serialize_player(player2)
        serialized_players.append(serialized_player2)

    return serialized_players

async def serialize_fixed_data(round):
    if not round:
        return None
    
    fixed_data = {}
    
    fixed_data["player_area"] = Paddle().player_area
    fixed_data["canvas"] = {
            "width": WIDTH,
            "height": HEIGHT
        }
    fixed_data["paddle_width"] = Paddle().width
    fixed_data["item_radius"] = Item().radius
    
    return fixed_data

def generate_round_info(round, game_id):
    if not round:
        return {"error": "Player or round information is missing."}
        
    try:
        game_info = get_game_info(game_id)
        players = [ get_game_info(game_id, 'player1'), get_game_info(game_id, 'player2') ]

        game_info = {
            "type": "round_ing",
            "players": [ serialize_player_info(players[0]), serialize_player_info(players[1]) ],
            "balls": serialize_balls_info(game_info['balls']),
            "item": serialize_item_info(game_info['item']),
            "sound": serialize_sounds_info(game_info['sounds']),
        }
        reset_sounds(game_id)
        
        return game_info
    except Exception as e:
        print("game info error : ", e)
        return {"game info error : ", e}
        
def reset_sounds(game_id):
    game_info = get_game_info(game_id)
    sounds = game_info['sounds']
    sound_attributes = ['pong', 'item', 'b_add', 'b_up', 'p_down', 'out']
    for attr in sound_attributes:
        setattr(sounds, attr, False)
    update_game_info(game_id, game_info)

def serialize_player_info(player):
    if not player:
        return None
    paddle = player['paddle']
    serialized_player_info = {
            'paddle': {"x": paddle.x, "y": paddle.y, "height": paddle.height},
            'heart': player['heart'],
            'item': player['slot'].status
    }
    return serialized_player_info

def serialize_balls_info(balls):
    if balls == None:
        return None
    serialized_balls = []
    for ball in balls:
        serialized_ball = {
            "x": ball.x,
            "y": ball.y,
            "radius": ball.radius,
        }
        serialized_balls.append(serialized_ball)
    return serialized_balls

def serialize_item_info(item):
    if item == None:
        return None
    serialized_item = {
        "x": item.x,
        "y": item.y,
    }
    return serialized_item

def serialize_sounds_info(sounds):
    if sounds == None:
        return None
    serialized_sounds = {
        'pong': sounds.pong,
        'item': sounds.item,
        'b_add': sounds.b_add,
        'b_up': sounds.b_up,
        'p_down': sounds.p_down,
        'out': sounds.out,
    }
    return serialized_sounds

    
def update_match_history(round, game):
    tournament = True if game.type == "tournament" else False
    easy_mode = True if game.mode == "easy" else False
    winner = round.winner
    loser = round.player1 if round.player2 == winner else round.player2

    MatchHistory.objects.create(
        user=winner,
        nick_me=winner.nickname,
        nick_opponent=loser.nickname,
        tournament=tournament,
        easy_mode=easy_mode,
        result=True
    )

    MatchHistory.objects.create(
        user=loser,
        nick_me=loser.nickname,
        nick_opponent=winner.nickname,
        tournament=tournament,
        easy_mode=easy_mode,
        result=False
    )

async def determine_winner(game, winner, round_number):
    if game.type == 'one_to_one':
        game.winner = winner
    else:
        if round_number == 1:
            game.round3.player1 = winner
        elif round_number == 2:
            game.round3.player2 = winner
        else:
            game.winner = winner
        await database_sync_to_async(game.round3.save)()
 
async def use_item(room_group_name, user):
    game_info = await database_sync_to_async(get_game_info)(room_group_name)
    if game_info == None:
        return
    
    player_key = None
    if game_info['player1'].id == user.id:
        player_key = 'player1'
    elif game_info['player2'].id == user.id:
        player_key = 'player2'
    
    if player_key == 'player1':
        target_player_key = 'player2'
    elif player_key == 'player2':
        target_player_key = 'player1'
    
    player_info = await database_sync_to_async(get_game_info)(room_group_name, player_key)
    target_player_info = await database_sync_to_async(get_game_info)(room_group_name, target_player_key)
    
    if player_info == None or target_player_info == None or game_info['balls'][0].is_ball_moving == False:
        return
    
    if player_info['slot'].status == False:
        print(player_key, " : don't have item")
        return
    player_info['slot'].status = False #슬롯 비워주기
    
    item_type = random.choice(["b_add"] * int(os.getenv('B_ADD')) + ["b_up"] * int(os.getenv('B_UP')) + ["p_down"] * int(os.getenv('P_DOWN')))
    balls=game_info['balls']
    ball=balls[0]
    sounds = game_info['sounds']
    
    if item_type == 'b_up': # 공속도 업 (최대 기본 속도 x 4)
        ball.speed = ball.speed + 2 if ball.speed < Ball().speed * 10 else ball.speed
        sounds.b_up = True
    elif item_type == 'b_add': # 공 추가 (상대방 쪽으로)
        balls.append(Ball('add', target_player_key))
        sounds.b_add = True
    elif item_type == 'p_down': # 패들 height 줄이기 (상대방 패들)
        paddle = target_player_info['paddle']
        paddle.height = paddle.height - (Paddle().height / 5 * 1) if paddle.height > Paddle().height / 5 * 1 else paddle.height
        sounds.p_down = True
    
    await database_sync_to_async(update_game_info)(room_group_name, game_info)
    await database_sync_to_async(update_game_info)(room_group_name, player_info, player_key)
    await database_sync_to_async(update_game_info)(room_group_name, target_player_info, target_player_key)
    print("item used")
        
async def move_paddle(room_group_name, user, direction):
    game_info = await database_sync_to_async(get_game_info)(room_group_name)
    if game_info == None:
        return
    balls = game_info['balls']
    if balls[0].is_ball_moving == False:
        return
    
    player_key = None
    if game_info['player1'].id == user.id:
        player_key = 'player1'
    elif game_info['player2'].id == user.id:
        player_key = 'player2'
    
    player_info = await database_sync_to_async(get_game_info)(room_group_name, player_key)
    if player_info == None:
        return
    
    await player_info['paddle'].change_direction(direction)
    await database_sync_to_async(update_game_info)(room_group_name, player_info, player_key)
    print(player_key, " paddle moved ", player_info['paddle'].direction) #test code