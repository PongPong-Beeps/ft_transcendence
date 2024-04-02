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