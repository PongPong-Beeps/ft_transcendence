from channels.db import database_sync_to_async
from user.views import get_image
from .models import Ball, Paddle
from user.models import MatchHistory

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
            "width": round.width,
            "height": round.height
        }
    fixed_data["paddle_width"] = Paddle().width
    fixed_data["item_radius"] = Item().radius
    
    return fixed_data

def generate_round_info(round, mode):
    if not round:
        return {"error": "Player or round information is missing."}
    
    # item = None
    
    # if round.item is not None: #hard모드일때만 item이 생김
        # item = { "x": round.item.x, "y": round.item.y }
    
    game_info = {
        "type": "round_ing",
        "players": [
            {
                "paddle": {"x": round.paddle_1.x, "y": round.paddle_1.y, "height": round.paddle_1.height},
                "heart": round.heart_1,
                # "item": round.slot_1, # True or False
            },
            {
                "paddle": {"x": round.paddle_2.x, "y": round.paddle_2.y, "height": round.paddle_2.height},
                "heart": round.heart_2,
                # "item": round.slot_2, # True or False
            }
        ],
        "balls": [
            {"x": round.ball_1.x, "y": round.ball_1.y, "radius": round.ball_1.radius, "type": "default"},
            # {"x": 0.0, "y": 0.0, "radius": 0.0, "type": "optional"},
        ],
        # "item": item, # 없으면 null
    }
    
    return game_info

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