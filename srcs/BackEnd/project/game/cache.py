from django.core.cache import cache
from .models import Paddle, Ball, Item, Slot, Sound
import os

#CREATE
def set_game_info(game_id, mode):
    # 각 게임의 정보를 캐시에 저장
    game_info = {
        "balls": [ Ball(mode) ],
        "item": None,
        "sounds": Sound(),
    }
    # 캐시에 게임 정보 저장
    cache.set(game_id, game_info)
    
    for player in ['player1', 'player2']:
        player_info = {
            "paddle": Paddle(player),
            "heart": int(os.getenv('HEART_NUM')),
            "slot": Slot(),
        }
        cache.set(str(game_id) + player, player_info)
    

#READ
def get_game_info(game_id, player='default'):
    if player == 'player1' or player == 'player2':
        player_info = cache.get(str(game_id) + player)
        return player_info
    else:
        game_info = cache.get(game_id)
        return game_info

#UPDATE
def update_game_info(game_id, new_info, player='default'):
    if player == 'player1' or player == 'player2':
        player_info = cache.get(str(game_id) + player)
        if player_info:
            cache.set(str(game_id) + player, new_info)
    else:
        # 캐시에서 게임 정보 가져오기
        game_info = cache.get(game_id)
        if game_info: # 기존의 게임 정보가 존재하는 경우에만 업데이트 진행
            cache.set(game_id, new_info)

#DELETE    
def delete_game_info(game_id):
    # 캐시에서 게임 정보 삭제
    cache.delete(game_id)
    cache.delete(str(game_id) + 'player1')
    cache.delete(str(game_id) + 'player2')
    

#TEST
def print_players(players):
    for i, player in enumerate(players):
        print("player ", i)
        print("paddle x: ", player['paddle'].x, 'y: ', player["paddle"].y, 'height : ', player["paddle"].height)
        print("heart : ", player["heart"])
        print("item : ", player["slot"].status)
    
def print_balls(balls):
    for i, ball in enumerate(balls):
        print("ball ", i)
        print("x :", ball.x, " y: ", ball.y, " radius: ", ball.radius)
        
def print_item(item):
    if item is not None:
        print("item x: ", item.x, "y: ", item.y)
    else:
        print("None")
    
def print_game_info(game_id):
    game_info = cache.get(game_id)
    
    if game_info:
        print("players: ", print_players(game_info["players"]))
        print("balls: ", print_balls(game_info["balls"]))
        print("item: ", print_item(game_info['item']))
        print("sounds: ", game_info["sounds"])
        return True
    else:
        return False