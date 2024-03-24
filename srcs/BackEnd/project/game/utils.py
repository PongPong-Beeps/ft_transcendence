from channels.db import database_sync_to_async

async def serialize_round_players(round):
    if not round:
        return None

    player1 = await database_sync_to_async(lambda: round.player1)() if round.player1 else None
    player2 = await database_sync_to_async(lambda: round.player2)() if round.player2 else None

    return {
        'player1': {
            'id': player1.id if player1 else None,
            'nickname': player1.nickname if player1 else None,
        },
        'player2': {
            'id': player2.id if player2 else None,
            'nickname': player2.nickname if player2 else None,
        },
    }
