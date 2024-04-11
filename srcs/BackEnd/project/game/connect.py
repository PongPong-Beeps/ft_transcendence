from .models import Game
from channels.db import database_sync_to_async
from connect.models import InvitationQueue

async def create_room(client, type, mode, channel_name):
    game = await database_sync_to_async(Game.objects.create)(type=type, mode=mode)
    await database_sync_to_async(game.save)()
    await database_sync_to_async(game.entry_player)(client, channel_name)
    return str(game.id)

async def quick_start(client, type, mode, channel_name):
    game_queryset = await database_sync_to_async(Game.objects.filter)(type=type, mode=mode, is_full=False)
    game = await database_sync_to_async(game_queryset.first)()
    if game and game.is_gameRunning == False:
        await database_sync_to_async(game.entry_player)(client, channel_name)
        return str(game.id)
    else:
        return await create_room(client, type, mode, channel_name)

async def sub_accept_invite(user, client, channel_name):
    try :
        #초대장이 여러개일 경우도 생각해서 배열로 받음 
        invitation_queryset = await database_sync_to_async(InvitationQueue.objects.filter)(receiver_id=user.id)
        invitation = await database_sync_to_async(invitation_queryset.first)() #그중 젤 오래된 초대장을 받음
        
        game_id = invitation.game_id #초대장이 속한 게임의 id
        game = await database_sync_to_async(Game.objects.get)(id=game_id) #초대장이 속한 게임
        
        await database_sync_to_async(invitation.delete)() #초대장 삭제
        
        if game.is_full:
            return {'status': '4001', 'message': 'The game is full.'}
        else:
            await database_sync_to_async(game.entry_player)(client, channel_name)
            return {'status': '2000', 'game_id': str(game_id)}
    except Game.DoesNotExist:
        return {'status': '4000', 'message': 'The game does not exist.'}