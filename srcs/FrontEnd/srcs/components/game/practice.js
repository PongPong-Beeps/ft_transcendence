import { importCss } from "../../utils/importCss.js";
import ExitConfirmation from "../../pages/ExitConfirmation.js";

export default function Practice($container) {
    let backgroundCanvas, backgroundCtx, gameCanvas, gameCtx;
    let paddle, pong, player1, player2, balls, playerImage = new Image();
    let animationFrameId; // 게임 루프를 관리하는 데 사용될 id
    let isBallMoving;
    let gameMode = 'easy'; // 기본 게임 모드를 'easy'로 설정
    let keys = {
        'w': false,
        's': false,
        'ArrowUp': false,
        'ArrowDown': false
    };

    const init = () => {
        const container = $container.querySelector('.game-canvas-container');
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        playerImage.src = "../../assets/image/img.png";

        paddle = { width: containerHeight * 0.03, height: containerHeight * 0.15, speed: containerHeight * 0.015, color: 'WHITE' };
        pong = { radius: containerHeight * 0.03, speed: containerHeight * 0.02, color: '#ffa939' };

        // 배경용 캔버스 초기화
        backgroundCanvas = $container.querySelector('#background-canvas');
        backgroundCtx = backgroundCanvas.getContext('2d');
        backgroundCanvas.width = containerWidth;
        backgroundCanvas.height = containerHeight;
        drawBackground();

        // 게임 오브젝트용 캔버스 초기화
        gameCanvas = $container.querySelector('#game-canvas');
        gameCtx = gameCanvas.getContext('2d');
        gameCanvas.width = containerWidth;
        gameCanvas.height = containerHeight;
    }

    function getRandomDirection() {
        let angle = Math.random() * Math.PI / 2 - Math.PI / 4;
        return {
            dirX: Math.cos(angle),
            dirY: Math.sin(angle)
        };
    }

    const gameInit = () => {
        isBallMoving = false;
        // 플레이어 초기화
        player1 = { x: 50, y: gameCanvas.height / 2 - paddle.height / 2, score: 0 };
        player2 = { x: gameCanvas.width - paddle.width - 50, y: gameCanvas.height / 2 - paddle.height / 2, score: 0 };
        // 모드에 따른 공 초기화
        if (gameMode === 'easy') {
            balls = [
                { x: gameCanvas.width / 2, y: gameCanvas.height / 2, ...getRandomDirection() }
            ];
        } else {
            let ball1Direction = getRandomDirection();
            let ball2Direction = { dirX: -ball1Direction.dirX, dirY: -ball1Direction.dirY };
            balls = [
                { x: gameCanvas.width / 2, y: gameCanvas.height / 2, ...ball1Direction },
                { x: gameCanvas.width / 2, y: gameCanvas.height / 2, ...ball2Direction }
            ];
        }

        gameLoop();
        setTimeout(() => {
            isBallMoving = true;
        }, 500);
    };

    const gameLoop = () => {
        movePaddle();
        update();
        drawGame();
        animationFrameId = requestAnimationFrame(gameLoop); // 게임 루프 생성
    };

    const movePaddle = () => {
        if (keys['w']) {
            player1.y = Math.max(player1.y - paddle.speed, 0);
        }
        if (keys['s']) {
            player1.y = Math.min(player1.y + paddle.speed, gameCanvas.height - paddle.height);
        }
        if (keys['ArrowUp']) {
            player2.y = Math.max(player2.y - paddle.speed, 0);
        }
        if (keys['ArrowDown']) {
            player2.y = Math.min(player2.y + paddle.speed, gameCanvas.height - paddle.height);
        }
    };

    const update = () => {
        if (!isBallMoving) return;
        balls.forEach(ball => {
            // 공의 위치 업데이트
            ball.x += pong.speed * ball.dirX;
            ball.y += pong.speed * ball.dirY;
            // 벽 충돌 검사
            if (ball.y + pong.radius > gameCanvas.height || ball.y - pong.radius < 0) {
                ball.dirY = -ball.dirY; // Y 방향 반전
            }
            // 공이 왼쪽 또는 오른쪽 끝에 도달했을 때 점수 처리
            if (ball.x - pong.radius < 50) { // 왼쪽 벽에 충돌
                player2.score++;
                resetBall();
            } else if (ball.x + pong.radius > gameCanvas.width - 50) { // 오른쪽 벽에 충돌
                player1.score++;
                resetBall();
            }
            // 패들 충돌 검사
            let nearestPlayer = (ball.x < gameCanvas.width / 2) ? player1 : player2;
            if (ball.x - pong.radius <= nearestPlayer.x + paddle.width
                && ball.x + pong.radius >= nearestPlayer.x
                && ball.y - pong.radius <= nearestPlayer.y + paddle.height
                && ball.y + pong.radius >= nearestPlayer.y) {
                ball.dirX = -ball.dirX; // X 방향 반전
            }
        });
    };

    const resetBall = () => {
        isBallMoving = false;
        balls.forEach((ball, index) => {
            ball.x = gameCanvas.width / 2;
            ball.y = gameCanvas.height / 2;

            let direction = getRandomDirection();
            if (index === 0) {
                ball.dirX = direction.dirX;
                ball.dirY = direction.dirY;
            } else {
                ball.dirX = -direction.dirX;
                ball.dirY = -direction.dirY;
            }
        });
        setTimeout(() => {
            isBallMoving = true;
        }, 500);
    };

    const drawBackground = () => {
        backgroundCtx.fillStyle = '#27522d';
        backgroundCtx.fillRect(50, 0, backgroundCanvas.width - 100, backgroundCanvas.height);
        backgroundCtx.strokeStyle = "WHITE";
        backgroundCtx.lineWidth = 1;
        backgroundCtx.beginPath();
        backgroundCtx.setLineDash([]);
        backgroundCtx.moveTo(50, backgroundCanvas.height / 2);
        backgroundCtx.lineTo(backgroundCanvas.width - 50, backgroundCanvas.height / 2);
        backgroundCtx.stroke();
        backgroundCtx.beginPath();
        backgroundCtx.setLineDash([]);
        backgroundCtx.moveTo(backgroundCanvas.width / 2, 0);
        backgroundCtx.lineTo(backgroundCanvas.width / 2, backgroundCanvas.height);
        backgroundCtx.stroke();
    }

    const drawGame = () => {
        gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        // 점수 그리기
        gameCtx.font = "2em DNF Bit Bit v2";
        gameCtx.fillStyle = "WHITE";
        gameCtx.fillText(player1.score.toString(), gameCanvas.width / 4, 50);
        gameCtx.fillText(player2.score.toString(), (3 * gameCanvas.width) / 4, 50);
        // 플레이어 패들 그리기
        gameCtx.fillStyle = paddle.color;
        gameCtx.fillRect(player1.x, player1.y, paddle.width, paddle.height);
        gameCtx.fillStyle = paddle.color;
        gameCtx.fillRect(player2.x, player2.y, paddle.width, paddle.height);
        if (playerImage.complete) {
            gameCtx.drawImage(playerImage, player1.x - 50, player1.y, 50, 50);
            gameCtx.drawImage(playerImage, player2.x + paddle.width + 5, player2.y, 50, 50);
        }
        // 공 그리기
        balls.forEach(ball => {
            gameCtx.beginPath();
            gameCtx.arc(ball.x, ball.y, pong.radius, 0, Math.PI*2, true);
            gameCtx.fillStyle = pong.color;
            gameCtx.fill();
            gameCtx.closePath();
        });
    };

    const render = () => {
        $container.querySelector('#main').innerHTML = `
            <div class="game-container">
                <div class="game-title-container">
                    <button class="game-back-btn non-outline-btn">< 로비로 돌아가기</button>
                    <div id="game-mode-button-container">
                        <button id="easy-btn" class="game-mode-btn green-btn non-outline-btn">이지</button>
                        <button id="hard-btn" class="game-mode-btn green-btn non-outline-btn">하드</button>
                    </div>
                </div>
                <div class="game-canvas-container">
                    <canvas id="background-canvas"></canvas>
                    <canvas id="game-canvas"></canvas>
                </div>
            </div>
        `;
        const easyButton = $container.querySelector('#easy-btn');
        easyButton.classList.add('selected');
    };

    const setupEventListener = () => {
        $container.querySelector('.game-back-btn').addEventListener('click', () => {
           new ExitConfirmation($container);
        });

        $container.querySelector('#game-mode-button-container').addEventListener('click', (event) => {
            // 클릭된 요소가 게임 모드 버튼인지 확인
            if (event.target.matches('#easy-btn') || event.target.matches('#hard-btn')) {
                gameMode = event.target.matches('#easy-btn') ? 'easy' : 'hard';
                $container.querySelectorAll('.game-mode-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                event.target.classList.add('selected');
                cancelAnimationFrame(animationFrameId); // 현재 게임 루프 중지
                for (const key in keys) {
                    keys[key] = false;
                }
                gameInit(); // 게임 초기화
            }
        });

        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW': keys['s'] = false; keys['w'] = true; break;
                case 'KeyS': keys['w'] = false; keys['s'] = true; break;
                case 'ArrowUp': keys['ArrowDown'] = false; keys['ArrowUp'] = true; break;
                case 'ArrowDown': keys['ArrowUp'] = false; keys['ArrowDown'] = true; break;
            }
        });
    };

    render();
    setupEventListener();
    init();
    gameInit();
}