import threading
from .models import Paddle, Item, Ball, Slot
import random
import math
import os
from .cache import get_game_info, update_game_info

WIDTH = int(os.getenv('WIDTH'))
HEIGHT = int(os.getenv('HEIGHT'))

def set_ball_moving(game_id, type='init'):
    if type == 'init':
        timer = threading.Timer(1, lambda: set_ball_moving(game_id, 'start'))
        timer.start()
        print("timer start")
        return
    game_info = get_game_info(game_id)
    if game_info == None:
        return
    balls = game_info['balls']
    balls[0].is_ball_moving = True
    update_game_info(game_id, game_info)
    print("ball moving")

def reset_game_objects(game_id, game_info, mode, players):
    balls = game_info['balls']
    
    #아이템 슬롯 초기화
    players[0]['slot'].clear()
    players[1]['slot'].clear()
    
    #패들 위치, 크기 초기화
    paddles = [ players[0]['paddle'], players[1]['paddle'] ]
    for i, paddle in enumerate(paddles):
        if i == 0:
            paddle.x = Paddle().player_area
        else:
            paddle.x = WIDTH - paddle.width - Paddle().player_area
        paddle.y = (HEIGHT / 2) - (paddle.height) / 2
        paddle.direction = 'stop'
        paddle.height = Paddle(None, mode).height #아이템에서 바뀐 패들 크기 초기화
    
    #볼 위치, 방향 초기화, 속도, 볼개수 초기화
    for i, ball in enumerate(balls.copy()):
        #아이템에서 바뀐 추가볼 삭제
        if i > 0:
            if ball in balls:
                balls.remove(ball)
            continue
        ball.x = WIDTH / 2
        ball.y = HEIGHT / 2
        ball.is_ball_moving = False
        ball.speed = Ball(mode).speed #아이템에서 바뀐 속도 초기화
        ball.dirX, ball.dirY = ball.get_random_direction()

    #1초 후에 공을 움직이게 함
    set_ball_moving(game_id)

def check_round_ended(round, players):
    heart_1 = players[0]['heart']
    heart_2 = players[1]['heart']
    if heart_1 == 0 or heart_2 == 0:
        if heart_2 == 0:
            round.winner = round.player1
        elif heart_1 == 0:
            round.winner = round.player2
        round.is_roundEnded = True
        round.save()
        return True
    return False

def update(round, mode, game_id):
    game_info = get_game_info(game_id)
    players = [ get_game_info(game_id, 'player1'), get_game_info(game_id, 'player2') ]
    balls = game_info['balls']
    sounds = game_info['sounds']
    
    if check_round_ended(round, players):
        return
    
    if mode == 'hard':
        if balls[0].is_ball_moving == False:
            game_info['item'] = None
        else:
            update_item(game_info, players)

    paddles = [ players[0]['paddle'], players[1]['paddle'] ]
    # 패들 위치 업데이트
    for paddle in paddles:
        paddle.move_paddle()
    
    for i, ball in enumerate(balls.copy()): #인덱스때문에 복사본 사용
        if i == 0 and ball.is_ball_moving == False: #기본 공 안움직이면 업데이트 안함
            break
        #공 위치 업데이트
        ball.x += ball.speed * ball.dirX
        ball.y += ball.speed * ball.dirY
        
        #벽 충돌 검사(맵 상단, 하단)
        if ball.y + ball.radius > HEIGHT or ball.y - ball.radius < 0:
            ball.dirY = -ball.dirY
            sounds.pong = True

        ball_type = 'basic' if i == 0 else 'additional'

        #쉴드 충돌 검사
        if players[0]['shield'] or players[1]['shield']:
            for i, player in enumerate(players):
                if player['shield']:
                    operate_shield(i, player, balls, ball, ball_type, sounds)
                
        #공이 왼쪽 또는 오른쪽끝에 도달했을때 점수 처리
        if ball.x - ball.radius <= Paddle().player_area + Paddle().width / 2\
            or ball.x + ball.radius >= WIDTH - Paddle().player_area - Paddle().width / 2:
            if ball.x - ball.radius <= Paddle().player_area + Paddle().width / 2:
                players[0]['heart'] -= 1
                sounds.out = True
                reset_game_objects(game_id, game_info, mode, players)
            elif ball.x + ball.radius >= WIDTH - Paddle().player_area - Paddle().width / 2:
                players[1]['heart'] -= 1
                sounds.out = True
                reset_game_objects(game_id, game_info, mode, players)
            break
                
        #패들 충돌검사
        nearest_paddle = paddles[0] if ball.x < WIDTH / 2 else paddles[1]
        if ball.x - ball.radius <= nearest_paddle.x + nearest_paddle.width\
            and ball.x + ball.radius >= nearest_paddle.x\
            and ball.y - ball.radius <= nearest_paddle.y + nearest_paddle.height\
            and ball.y + ball.radius >= nearest_paddle.y:
            if ball_type == 'basic':
                ball.dirX = -ball.dirX
                ball.x += ball.dirX * abs(nearest_paddle.width - abs(nearest_paddle.x - ball.x)) #볼이 패들을 타는 버그 방지
                adjust_ball_direction_on_paddle_contact(ball, nearest_paddle)
                sounds.pong = True
            elif ball_type == 'additional':
                if ball in balls:
                    balls.remove(ball)
                sounds.pong = True
            
    update_game_info(game_id, game_info)
    update_game_info(game_id, players[0], 'player1')
    update_game_info(game_id, players[1], 'player2')

def operate_shield(i, player, balls, ball, ball_type, sounds):
    if (i == 0 and ball.x - ball.radius <= Paddle().player_area + (Paddle().width / 2) + int(os.getenv('SHIELD_AREA')))\
        or (i == 1 and ball.x + ball.radius >= WIDTH - Paddle().player_area - Paddle().width / 2 - int(os.getenv('SHIELD_AREA'))):
        paddle = player['paddle']
        if ball_type == 'basic':
            ball.dirX = -ball.dirX
            ball.x += ball.dirX * abs(paddle.width - abs(paddle.x - ball.x)) #볼이 패들을 타는 버그 방지
            adjust_ball_direction_on_paddle_contact(ball, paddle)
        elif ball_type == 'additional':
            if ball in balls:
                balls.remove(ball)
        sounds.shield = True

def update_item(game_info, players):
    if game_info['item'] == None and random.random() < 0.5: # 10% 확률로 아이템 생성
        generate_item(game_info, players)
    
    item = game_info['item']
    if item == None: #아이템이 없으면 do nothing
        return
    
    sounds = game_info['sounds']
    paddles = [ players[0]['paddle'], players[1]['paddle'] ]

    #item 위치 업데이트
    item.x += item.speed * item.dirX
    item.y += item.speed * item.dirY
    
    #벽 충돌 검사(맵 상단, 하단) item -> item
    if item.y + item.radius > HEIGHT or item.y - item.radius < 0:
       item.dirY = -item.dirY

    #아이템 소멸 감지
    if item.x - item.radius < Paddle().player_area\
       or item.x + item.radius > WIDTH - Paddle().player_area:
        game_info['item'] = None
        return
    
    #아이템 획득 감지
    nearest_paddle, idx = (paddles[0], 0) if item.x < WIDTH / 2 else (paddles[1], 1)
    if item.x - item.radius <= nearest_paddle.x + nearest_paddle.width\
       and item.x + item.radius >= nearest_paddle.x\
       and item.y - item.radius <= nearest_paddle.y + nearest_paddle.height\
       and item.y + item.radius >= nearest_paddle.y:
       sounds.item = True
       game_info['item'] = None
       eat_item(players[idx]['slot'], players[idx]['heart'])

def eat_item(player_slot, player_heart_num):
    slot = Slot()
    slot.status = True
    heart_percent = int(os.getenv('HEART_UP') if player_heart_num <= 2 else 0) #목숨 2개 이하인 사람에게만 일정확률로 하트 아이템 드랍
    slot.item_type = random.choice(
        ["b_add"] * int(os.getenv('B_ADD'))\
        + ["b_up"] * int(os.getenv('B_UP'))\
        + ["p_down"] * int(os.getenv('P_DOWN'))\
        + ["p_up"] * int(os.getenv('P_UP'))\
        + ["shield"] * int(os.getenv('SHIELD'))\
        + ["h_up"] * heart_percent\
    )
    if len(player_slot) >= 2:
        player_slot.pop()
    player_slot.append(slot)

def generate_item(game_info, players):
    if players[0]['heart'] < players[1]['heart']:
        winner = 'player2'
        loser = 'player1'
    elif players[0]['heart'] > players[1]['heart']:
        winner = 'player1'
        loser = 'player2'
    else: #동점
        to = 'random'
        game_info['item'] = Item(to)
        return
    
    to = random.choice([loser] * int(os.getenv('ITEM_LOSER')) + [winner] * int(os.getenv('ITEM_WINNER')))
    game_info['item'] = Item(to)

def adjust_ball_direction_on_paddle_contact(ball, nearest_paddle):
    if (nearest_paddle.y < ball.y < nearest_paddle.y + nearest_paddle.height / 8) or \
       (nearest_paddle.y + nearest_paddle.height * 7 / 8 < ball.y < nearest_paddle.y + nearest_paddle.height):
        ball.dirY += (15 / 180 * math.pi)
    elif nearest_paddle.y + nearest_paddle.height * 3 / 8 <= ball.y <= nearest_paddle.y + nearest_paddle.height * 5 / 8:
        ball.dirY -= (15 / 180 * math.pi)
    elif (nearest_paddle.y + nearest_paddle.height * 1 / 8 < ball.y < nearest_paddle.y + nearest_paddle.height * 2 / 8) or \
         (nearest_paddle.y + nearest_paddle.height * 6 / 8 < ball.y < nearest_paddle.y + nearest_paddle.height * 7 / 8):
        ball.dirY += (5 / 180 * math.pi)
    elif (nearest_paddle.y + nearest_paddle.height * 2 / 8 < ball.y < nearest_paddle.y + nearest_paddle.height * 3 / 8) or \
         (nearest_paddle.y + nearest_paddle.height * 5 / 8 < ball.y < nearest_paddle.y + nearest_paddle.height * 6 / 8):
        ball.dirY -= (5 / 180 * math.pi)