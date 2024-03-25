from channels.db import database_sync_to_async
from user.views import get_image

async def serialize_round_players(round):
    if not round:
        return None

    player1 = await database_sync_to_async(lambda: round.player1)() if round.player1 else None
    player2 = await database_sync_to_async(lambda: round.player2)() if round.player2 else None

    return {
        'player1': {
            'id': player1.id if player1 else None,
            'nickname': player1.nickname if player1 else None,
            'image': get_image(player1) if player1 else None,
        },
        'player2': {
            'id': player2.id if player2 else None,
            'nickname': player2.nickname if player2 else None,
            'image': get_image(player2) if player2 else None,
        },
    }


def generate_game_info(player, round):
    if not player or not round:
        return {"error": "Player or round information is missing."}
    
    new_paddle1_x = round.paddle1_x + player.width
    new_paddle1_y = round.paddle1_y + player.height
    new_paddle2_x = round.paddle2_x + player.width
    new_paddle2_y = round.paddle2_y + player.height
    new_ball1_x = round.ball_1_x + player.width
    new_ball1_y = round.ball_1_y + player.height
    new_ball2_x = round.ball_2_x + player.width
    new_ball2_y = round.ball_2_y + player.height

    game_info = {
        "type": "game_ing",
        "paddle1_x": new_paddle1_x,
        "paddle1_y": new_paddle1_y,
        "paddle2_x": new_paddle2_x,
        "paddle2_y": new_paddle2_y,
        "ball1_x": new_ball1_x,
        "ball1_y": new_ball1_y,
        "ball2_x": new_ball2_x,
        "ball2_y": new_ball2_y,
    }
    return game_info