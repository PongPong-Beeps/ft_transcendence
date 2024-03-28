import threading

def set_ball_moving(round):
    balls = { round.ball_1, round.ball_2 }
    for ball in balls:
        if ball is not None:
            ball.is_ball_moving = True
            round.save()

def init_game_objects(round):
    WIDTH = round.width
    HEIGHT = round.height
    
    #패들 위치 초기화
    paddles = { round.paddle_1, round.paddle_2 }
    for i, paddle in enumerate(paddles):
        if i == 0:
            paddle.x = 50
        else:
            paddle.x = WIDTH - paddle.width - 50
        paddle.y = (HEIGHT / 2) - (paddle.height) / 2
    
    #볼 위치, 방향 초기화
    balls = { round.ball_1, round.ball_2 }
    for ball in balls:
        if ball is not None:
            ball.x = WIDTH / 2
            ball.y = HEIGHT / 2
            ball.dirX, ball.dirY = ball.get_random_direction()
            ball.is_ball_moving = False
    
    #볼2 기능 정지
    round.ball_2 = None

    round.save()

    #1초 후에 공을 움직이게 함
    timer = threading.Timer(1, lambda: set_ball_moving(round))
    timer.start()


def update(round):
    WIDTH = round.width
    HEIGHT = round.height
    
    paddle_1 = round.paddle_1
    paddle_2 = round.paddle_2
    
    balls = { round.ball_1, round.ball_2 }
    
    
    for ball in balls:
        if ball is not None and ball.is_ball_moving:
            #공 위치 업데이트
            ball.x += ball.speed * ball.dirX
            ball.y += ball.speed * ball.dirY

            #벽 충돌 검사(맵 상단, 하단)
            if ball.y + ball.radius > HEIGHT or ball.y - ball.radius < 0:
                ball.y = -ball.y #y방향 반전
            

            #공이 왼쪽 또는 오른쪽끝에 도달했을때 점수 처리
            if ball.x - ball.radius < 50: #왼쪽 벽 충돌
                round.score_2 += 1
                init_game_objects(round)
            elif ball.x + ball.radius > WIDTH - 50:
                round.score_1 += 1
                init_game_objects(round)
            
            #패들 충돌검사
            nearest_paddle = paddle_1 if ball.x < WIDTH / 2 else paddle_2
            if ball.x - ball.radius <= nearest_paddle.x + nearest_paddle.width\
                and ball.x + ball.radius >= nearest_paddle.x\
                and ball.y - ball.radius <= nearest_paddle.y + nearest_paddle.height\
                and ball.y + ball.radius >= nearest_paddle.y:
                ball.dirX = -ball.dirX
                ball.x += ball.dirX #볼이 패들을 타는 버그 방지
        
            round.save()