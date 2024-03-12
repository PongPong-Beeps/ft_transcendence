import { importCss } from "../../utils/importCss.js";
import ExitConfirmation from "../../pages/ExitConfirmation.js";

export default function Practice($container) {
    let canvas, ctx;
    let player1, player2, ball;
    let animationFrameId;
    let isBallMoving = true;
    const paddleSpeed = 5; // 매 프레임마다 패들이 이동할 거리
    let keys = {
        'w': false,
        's': false,
        'ArrowUp': false,
        'ArrowDown': false
    };

    const gameInit = () => {
        canvas = $container.querySelector('.pong-canvas');
        ctx = canvas.getContext('2d');
        // 캔버스 크기 설정
        canvas.width = 800;
        canvas.height = 400;
        // 플레이어, 공 초기화
        player1 = { x: 20, y: canvas.height / 2 - 60, width: 12, height: 120, color: 'BLACK', score: 0 };
        player2 = { x: canvas.width - 30, y: canvas.height / 2 - 60, width: 12, height: 120, color: 'BLACK', score: 0 };
        ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 12, speed: 5, velocityX: 5, velocityY: 5, color: 'RED' };

        gameLoop();
    };

    const gameLoop = () => {
        movePaddle();
        update();
        renderGame();
        animationFrameId = requestAnimationFrame(gameLoop); // 게임 루프 생성
    };

    const movePaddle = () => {
        if (keys['w']) {
            player1.y = Math.max(player1.y - paddleSpeed, 0);
        }
        if (keys['s']) {
            player1.y = Math.min(player1.y + paddleSpeed, canvas.height - player1.height);
        }
        if (keys['ArrowUp']) {
            player2.y = Math.max(player2.y - paddleSpeed, 0);
        }
        if (keys['ArrowDown']) {
            player2.y = Math.min(player2.y + paddleSpeed, canvas.height - player2.height);
        }
    };

    const update = () => {
        if (!isBallMoving) return;

        // 공의 위치 업데이트
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        // 벽 충돌 검사
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.velocityY = -ball.velocityY; // Y 방향 반전
        }
        // 공이 왼쪽 또는 오른쪽 끝에 도달했을 때 점수 처리
        if (ball.x - ball.radius < 0) { // 왼쪽 벽에 충돌
            player2.score++;
            resetBall();
        } else if (ball.x + ball.radius > canvas.width) { // 오른쪽 벽에 충돌
            player1.score++;
            resetBall();
        }
        // 패들 충돌 검사
        let nearestPlayer = (ball.x < canvas.width / 2) ? player1 : player2;
        if (ball.x - ball.radius < nearestPlayer.x + nearestPlayer.width
            && ball.x + ball.radius > nearestPlayer.x
            && ball.y - ball.radius < nearestPlayer.y + nearestPlayer.height
            && ball.y + ball.radius > nearestPlayer.y) {
            ball.velocityX = -ball.velocityX; // X 방향 반전
        }
    };

    const resetBall = () => {
        isBallMoving = false;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = 5;
        // 랜덤한 방향으로 시작 각도 조정
        ball.velocityX = 5 * (Math.random() > 0.5 ? 1 : -1);
        ball.velocityY = 5 * (Math.random() > 0.5 ? 1 : -1);
        setTimeout(() => {
            isBallMoving = true;
        }, 500);
    };

    const renderGame = () => {
        // 배경 클리어
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 플레이어 패들 그리기
        ctx.fillStyle = player1.color;
        ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
        ctx.fillStyle = player2.color;
        ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
        // 공 그리기
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2, true);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
        // 점수 그리기
        ctx.font = "2em DNF Bit Bit v2";
        ctx.fillStyle = "WHITE";
        ctx.fillText(player1.score.toString(), canvas.width / 4, 50);
        ctx.fillText(player2.score.toString(), (3 * canvas.width) / 4, 50);
    };

    const render = () => {
        $container.querySelector('#main').innerHTML = `
            <div class="game-container">
                <div class="game-title-container">
                    <button class="game-back-btn non-outline-btn">< 로비로 돌아가기</button>
                </div>
                <canvas class="pong-canvas"></canvas>
            </div>
        `;
    };

    const setupEventListener = () => {
        $container.querySelector('.game-back-btn').addEventListener('click', () => {
           new ExitConfirmation($container);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key in keys) {
                keys[event.key] = true;
            }
            if (event.code === "KeyW") {
                keys['w'] = true;
            } else if (event.code === "KeyS") {
                keys['s'] = true;
            }
        });

        document.addEventListener('keyup', (event) => {
            if (event.key in keys) {
                keys[event.key] = false;
            }
            // 한영키 이슈
            if (event.code === "KeyW") {
                keys['w'] = false;
            } else if (event.code === "KeyS") {
                keys['s'] = false;
            }
        });
    };

    importCss("assets/css/game.css");
    render();
    setupEventListener();
    gameInit();
}