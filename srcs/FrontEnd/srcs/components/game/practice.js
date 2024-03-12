import { importCss } from "../../utils/importCss.js";
import ExitConfirmation from "../../pages/ExitConfirmation.js";

export default function Practice($container) {
    let canvas, ctx; // 캔버스 정보
    let player1, player2, ball;
    let animationFrameId; // 게임 루프를 관리하는 데 사용될 id
    let isBallMoving = false;
    let keys = {
        'w': false,
        's': false,
        'ArrowUp': false,
        'ArrowDown': false
    };
    const paddleInfo = { width: 12, height: 120, speed: 5, color: 'BLACK' };
    const ballInfo = { radius: 12, speed: 5, velocityX: 5, velocityY: 5, color: 'RED' };

    const gameInit = () => {
        canvas = $container.querySelector('.pong-canvas');
        ctx = canvas.getContext('2d');
        // 캔버스 크기 설정
        canvas.width = 800;
        canvas.height = 400;
        // 플레이어, 공 초기화
        player1 = { x: 0, y: canvas.height / 2 - 60, score: 0 };
        player2 = { x: canvas.width - 12, y: canvas.height / 2 - 60, score: 0 };
        ball = { x: canvas.width / 2, y: canvas.height / 2 };

        gameLoop();
        setTimeout(() => {
            isBallMoving = true;
        }, 1000);
    };

    const gameLoop = () => {
        movePaddle();
        update();
        renderGame();
        animationFrameId = requestAnimationFrame(gameLoop); // 게임 루프 생성
    };

    const movePaddle = () => {
        if (keys['w']) {
            player1.y = Math.max(player1.y - paddleInfo.speed, 0);
        }
        if (keys['s']) {
            player1.y = Math.min(player1.y + paddleInfo.speed, canvas.height - paddleInfo.height);
        }
        if (keys['ArrowUp']) {
            player2.y = Math.max(player2.y - paddleInfo.speed, 0);
        }
        if (keys['ArrowDown']) {
            player2.y = Math.min(player2.y + paddleInfo.speed, canvas.height - paddleInfo.height);
        }
    };

    const update = () => {
        if (!isBallMoving) return;
        // 공의 위치 업데이트
        ball.x += ballInfo.velocityX;
        ball.y += ballInfo.velocityY;
        // 벽 충돌 검사
        if (ball.y + ballInfo.radius > canvas.height || ball.y - ballInfo.radius < 0) {
            ballInfo.velocityY = -ballInfo.velocityY; // Y 방향 반전
        }
        // 공이 왼쪽 또는 오른쪽 끝에 도달했을 때 점수 처리
        if (ball.x - ballInfo.radius < 0) { // 왼쪽 벽에 충돌
            player2.score++;
            resetBall();
        } else if (ball.x + ballInfo.radius > canvas.width) { // 오른쪽 벽에 충돌
            player1.score++;
            resetBall();
        }
        // 패들 충돌 검사
        let nearestPlayer = (ball.x < canvas.width / 2) ? player1 : player2;
        if (ball.x - ballInfo.radius <= nearestPlayer.x + paddleInfo.width
            && ball.x + ballInfo.radius >= nearestPlayer.x
            && ball.y - ballInfo.radius <= nearestPlayer.y + paddleInfo.height
            && ball.y + ballInfo.radius >= nearestPlayer.y) {
            ballInfo.velocityX = -ballInfo.velocityX; // X 방향 반전
        }
    };

    const resetBall = () => {
        isBallMoving = false;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        // 랜덤한 방향으로 시작 각도 조정
        ballInfo.velocityX = ballInfo.speed * (Math.random() > 0.5 ? 1 : -1);
        ballInfo.velocityY = ballInfo.speed * (Math.random() > 0.5 ? 1 : -1);
        setTimeout(() => {
            isBallMoving = true;
        }, 500);
    };

    const renderGame = () => {
        // 배경 클리어
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 플레이어 패들 그리기
        ctx.fillStyle = paddleInfo.color;
        ctx.fillRect(player1.x, player1.y, paddleInfo.width, paddleInfo.height);
        ctx.fillStyle = paddleInfo.color;
        ctx.fillRect(player2.x, player2.y, paddleInfo.width, paddleInfo.height);
        // 공 그리기
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballInfo.radius, 0, Math.PI*2, true);
        ctx.fillStyle = ballInfo.color;
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
            switch (event.code) {
                case 'KeyW': keys['w'] = true; break;
                case 'KeyS': keys['s'] = true; break;
                case 'ArrowUp': keys['ArrowUp'] = true; break;
                case 'ArrowDown': keys['ArrowDown'] = true; break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW': keys['w'] = false; break;
                case 'KeyS': keys['s'] = false; break;
                case 'ArrowUp': keys['ArrowUp'] = false; break;
                case 'ArrowDown': keys['ArrowDown'] = false; break;
            }
        });
    };

    importCss("assets/css/game.css");
    render();
    setupEventListener();
    gameInit();
}