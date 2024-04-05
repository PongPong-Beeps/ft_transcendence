import threading
from .models import Paddle, Item, Ball
import random

def set_ball_moving(round):
    ball = round.balls[0]
    ball.is_ball_moving = True

def init_game_objects(round, mode, type):
    WIDTH = round.width
    HEIGHT = round.height
    
    #아이템 슬롯 초기화
    round.slot_1.status = False
    round.slot_2.status = False
    
    #패들 위치, 크기 초기화
    paddles = [ round.paddle_1, round.paddle_2, round.paddle_3, round.paddle_4 ]
    for i, paddle in enumerate(paddles):
        if type == 'one_to_one':
            if i == 0:
                paddle.x = Paddle().player_area
            elif i == 1:
                paddle.x = WIDTH - paddle.width - Paddle().player_area
            else:
                break
            paddle.y = (HEIGHT / 2) - (paddle.height) / 2
            paddle.height = Paddle().height #아이템에서 바뀐 패들 크기 초기화
        elif type == 'tournament':
            if i == 0 or i == 2:
                paddle.x = Paddle().player_area
                if i == 0:
                    paddle.y = (HEIGHT / 4 * 2) - (paddle.height) / 2
                elif i == 2:
                    paddle.y = (HEIGHT / 4 * 3) - (paddle.height) / 2
            elif i == 1 or i == 3:
                paddle.x = WIDTH - paddle.width - Paddle().player_area
                if i == 1:
                    paddle.y = (HEIGHT / 4 * 2) - (paddle.height) / 2
                elif i == 3:
                    paddle.y = (HEIGHT / 4 * 3) - (paddle.height) / 2
            paddle.height = Paddle().height / 2 #토너먼트에서는 패들크기 1/2로 초기화

        paddle.direction = 'stop'

    if mode == "easy":
        round.ball_2 = None
    
    #볼 위치, 방향 초기화, 속도, 볼개수 초기화
    balls = round.balls
    for i, ball in enumerate(balls.copy()):
        #아이템에서 바뀐 추가볼 삭제
        if i > 0:
            balls.remove(ball)
            continue
        ball.x = WIDTH / 2
        ball.y = HEIGHT / 2
        ball.is_ball_moving = False
        ball.speed = Ball().speed #아이템에서 바뀐 속도 초기화
        if i == 0:
            ball.dirX, ball.dirY = ball.get_random_direction()
        else:
            ball.dirX = -balls[0].dirX
            ball.dirY = -balls[0].dirY    

    round.save()

    #1초 후에 공을 움직이게 함
    timer = threading.Timer(1, lambda: set_ball_moving(round))
    timer.start()

def check_round_ended(round):
    if round.heart_1 == 0 or round.heart_2 == 0:
        if round.heart_2 == 0:
            round.winner = round.player1
        elif round.heart_1 == 0:
            round.winner = round.player2
        round.is_roundEnded = True
        round.save()
        return True
    return False

def update(round, mode, type):
    if check_round_ended(round):
        return
    WIDTH = round.width
    HEIGHT = round.height
    
    if mode == 'hard':
        if round.balls[0].is_ball_moving == False:
            round.item = None
        else:
            update_item(round, type)

    paddles = [ round.paddle_1, round.paddle_2, round.paddle_3, round.paddle_4 ]
    # 패들 위치 업데이트
    for paddle in paddles:
        paddle.move_paddle(HEIGHT)
    
    balls = round.balls
    for i, ball in enumerate(balls.copy()): #인덱스때문에 복사본 사용
        if i == 0 and ball.is_ball_moving == False: #기본 공 안움직이면 업데이트 안함
            break

        #공 위치 업데이트
        ball.x += ball.speed * ball.dirX
        ball.y += ball.speed * ball.dirY
        
        #벽 충돌 검사(맵 상단, 하단)
        if ball.y + ball.radius > HEIGHT or ball.y - ball.radius < 0:
            ball.dirY = -ball.dirY

        ball_type = 'basic' if i == 0 else 'additional'
            
        #공이 왼쪽 또는 오른쪽끝에 도달했을때 점수 처리
        if ball.x - ball.radius < Paddle().player_area\
            or ball.x + ball.radius > WIDTH - Paddle().player_area:
            if ball_type == 'additional':
               balls.remove(ball)
            if ball.x - ball.radius < Paddle().player_area:
                round.heart_1 -= 1
                round.save()
                init_game_objects(round, mode, type)
            elif ball.x + ball.radius > WIDTH - Paddle().player_area:
                round.heart_2 -= 1
                round.save()
                init_game_objects(round, mode, type)
                
        #패들 충돌검사
        if type == 'one_to_one':
            nearest_paddle = paddles[0] if ball.x < WIDTH / 2 else paddles[1]
            if ball.x - ball.radius <= nearest_paddle.x + nearest_paddle.width\
                and ball.x + ball.radius >= nearest_paddle.x\
                and ball.y - ball.radius <= nearest_paddle.y + nearest_paddle.height\
                and ball.y + ball.radius >= nearest_paddle.y:
                if ball_type == 'basic':
                    ball.dirX = -ball.dirX
                    ball.x += ball.dirX * 2 #볼이 패들을 타는 버그 방지
                elif ball_type == 'additional':
                    balls.remove(ball)
                    continue
        elif type == 'tournament':
            nearest_paddles = [ paddles[0], paddles[2] ] if ball.x < WIDTH / 2 else [ paddles[1], paddles[3] ]
            for nearest_paddle in nearest_paddles:
                if ball.x - ball.radius <= nearest_paddle.x + nearest_paddle.width\
                    and ball.x + ball.radius >= nearest_paddle.x\
                    and ball.y - ball.radius <= nearest_paddle.y + nearest_paddle.height\
                    and ball.y + ball.radius >= nearest_paddle.y:
                    if ball_type == 'basic':
                        ball.dirX = -ball.dirX
                        ball.x += ball.dirX * 2 #볼이 패들을 타는 버그 방지
                    elif ball_type == 'additional':
                        balls.remove(ball)
                        continue

def update_item(round, type):
    item = round.item
    if item == None and random.random() < 0.1: # 10% 확률로 아이템 생성
        generate_item(round)
    
    if item == None: #아이템이 없으면 do nothing
        return
    
    WIDTH = round.width
    HEIGHT = round.height
    
    paddles = [ round.paddle_1, round.paddle_2, round.paddle_3, round.paddle_4 ]

    #item 위치 업데이트
    item.x += item.speed * item.dirX
    item.y += item.speed * item.dirY
    
    #벽 충돌 검사(맵 상단, 하단) item -> item
    if item.y + item.radius > HEIGHT or item.y - item.radius < 0:
       item.dirY = -item.dirY

    #아이템 소멸 감지
    if item.x - item.radius < Paddle().player_area\
       or item.x + item.radius > WIDTH - Paddle().player_area:
        round.item = None
        return
    
    #아이템 획득 감지
    if type == 'one_to_one':
        nearest_paddle, paddle_idx = (paddles[0], 'paddle_1') if item.x < WIDTH / 2 else (paddles[1], 'paddle_2')
        if item.x - item.radius <= nearest_paddle.x + nearest_paddle.width\
           and item.x + item.radius >= nearest_paddle.x\
           and item.y - item.radius <= nearest_paddle.y + nearest_paddle.height\
           and item.y + item.radius >= nearest_paddle.y:
           if paddle_idx == 'paddle_1':
                round.slot_1.status = True
           else:
                round.slot_2.status = True
        #round.save()
           round.item = None
    elif type == 'tournament':
        nearest_paddles = [ paddles[0], paddles[2] ] if item.x < WIDTH / 2 else [ paddles[1], paddles[3] ]
        for nearest_paddle in nearest_paddles:
            if item.x - item.radius <= nearest_paddle.x + nearest_paddle.width\
               and item.x + item.radius >= nearest_paddle.x\
               and item.y - item.radius <= nearest_paddle.y + nearest_paddle.height\
               and item.y + item.radius >= nearest_paddle.y:
               if nearest_paddle == paddles[0]:
                    round.slot_1.status = True
               else:
                    round.slot_2.status = True
               round.item = None

def generate_item(round):
    if round.heart_1 < round.heart_2:
        winner = 'player_2'
        loser = 'player_1'
    elif round.heart_1 > round.heart_2:
        winner = 'player_1'
        loser = 'player_2'
    else: #동점
        to = 'random'
        round.item = Item(to, round.width, round.height)
        return
    
    to = random.choice(loser * 3 + winner * 1)
    round.item = Item(to, round.width, round.height)
    #round.save()
