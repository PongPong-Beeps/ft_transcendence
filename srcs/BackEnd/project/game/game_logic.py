import threading
from .models import Paddle

def set_ball_moving(round):
    balls = [ round.ball_1, round.ball_2 ]
    for ball in balls:
        if ball is not None:
            ball.is_ball_moving = True
            round.save()

def init_game_objects(round, mode):
    WIDTH = round.width
    HEIGHT = round.height
    
    #패들 위치 초기화
    paddles = [ round.paddle_1, round.paddle_2 ]
    for i, paddle in enumerate(paddles):
        if i == 0:
            paddle.x = Paddle().player_area
        else:
            paddle.x = WIDTH - paddle.width - Paddle().player_area
        paddle.y = (HEIGHT / 2) - (paddle.height) / 2
        paddle.direction = 'stop'

    if mode == "easy":
        round.ball_2 = None
    
    #볼 위치, 방향 초기화
    balls = [ round.ball_1, round.ball_2 ]
    for i, ball in enumerate(balls):
        if ball is not None:
            ball.x = WIDTH / 2
            ball.y = HEIGHT / 2
            ball.is_ball_moving = False
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

def update(round, mode):
    if check_round_ended(round):
        return
    WIDTH = round.width
    HEIGHT = round.height
    
    paddles = [ round.paddle_1, round.paddle_2 ]
    # 패들 위치 업데이트
    for paddle in paddles:
        paddle.move_paddle(HEIGHT)
    
    
    balls = [ round.ball_1, round.ball_2 ]
    for ball in balls:
        if ball is not None and ball.is_ball_moving:
            #공 위치 업데이트
            ball.x += ball.speed * ball.dirX
            ball.y += ball.speed * ball.dirY

            #벽 충돌 검사(맵 상단, 하단)
            if ball.y + ball.radius > HEIGHT or ball.y - ball.radius < 0:
                ball.dirY = -ball.dirY#y방향 반전

            #공이 왼쪽 또는 오른쪽끝에 도달했을때 점수 처리
            if ball.x - ball.radius < Paddle().player_area:
                round.heart_1 -= 1
                init_game_objects(round, mode)
            elif ball.x + ball.radius > WIDTH - Paddle().player_area:
                round.heart_2 -= 1
                init_game_objects(round, mode)

            #패들 충돌검사
            nearest_paddle = paddles[0] if ball.x < WIDTH / 2 else paddles[1]
            if ball.x - ball.radius <= nearest_paddle.x + nearest_paddle.width\
                and ball.x + ball.radius >= nearest_paddle.x\
                and ball.y - ball.radius <= nearest_paddle.y + nearest_paddle.height\
                and ball.y + ball.radius >= nearest_paddle.y:
                ball.dirX = -ball.dirX
                ball.x += ball.dirX #볼이 패들을 타는 버그 방지
        
            round.save()