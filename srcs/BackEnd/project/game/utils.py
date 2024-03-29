from channels.db import database_sync_to_async
from user.views import get_image
from .models import Ball, Paddle

async def serialize_round_players(round):
    if not round:
        return None

    player1 = await database_sync_to_async(lambda: round.player1)() if round.player1 else None
    player2 = await database_sync_to_async(lambda: round.player2)() if round.player2 else None
    
    serialized_players = []
    
    if player1:
        serialized_player1 = {
            'id': player1.id,
            'nickname': player1.nickname,
            'image': get_image(player1)
        }
        serialized_players.append(serialized_player1)

    if player2:
        serialized_player2 = {
            'id': player2.id,
            'nickname': player2.nickname,
            'image': get_image(player2)
        }
        serialized_players.append(serialized_player2)

    return serialized_players


def generate_round_info(round):
    if not round:
        return {"error": "Player or round information is missing."}
    
    game_info = {
        "type": "round_ing",
        "paddles": {
            "paddle1": {"x": round.paddle_1.x, "y": round.paddle_1.y},
            "paddle2": {"x": round.paddle_2.x, "y": round.paddle_2.y},
            "size": {"width": Paddle().width, "height": Paddle().height},
        },
        "balls": {
            "ball1": {"x": round.ball_1.x, "y": round.ball_1.y},
            "ball2": {"x": 0, "y": 0}, #하드모드에서 사용
            "size": {"radius": Ball().radius},
        },
        "score1": round.score_1,
        "score2": round.score_2,
        "width" : round.width,
        "height" : round.height,
    }
    return game_info

def calculate_positions(objects, width, height, player):
    for obj in objects:
        obj['x'] = obj['x'] / width * player.width
        obj['y'] = obj['y'] / height * player.height
    return objects

def serialize_round_info_to_player(info, player):
    
    try:
        paddles = info["paddles"]
        balls = info["balls"]

        width = info["width"]
        height = info["height"]

        objects = [paddles['paddle1'], paddles['paddle2'], balls['ball1']] #, balls['ball2']]
        objects = calculate_positions(objects, width, height, player)

        new_info = {
            "type": "round_ing",
            "paddles": paddles,
            "balls": balls,
            "score1": info['score1'],
            "score2": info['score2'],
        }
        return new_info
    except Exception as e:
        print("error: ", e)
        return None