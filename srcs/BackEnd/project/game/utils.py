from channels.db import database_sync_to_async
from user.views import get_image

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


def generate_round_info(player, round):
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
        "type": "round_ing",
        "paddle1": {"x": new_paddle1_x, "y": new_paddle1_y},
        "paddle2": {"x": new_paddle2_x, "y": new_paddle2_y},
        "ball1": {"x": new_ball1_x, "y": new_ball1_y},
        "ball2": {"x": new_ball2_x, "y": new_ball2_y}
    }
    return game_info