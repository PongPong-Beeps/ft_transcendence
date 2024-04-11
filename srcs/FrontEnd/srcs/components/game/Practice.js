import ExitConfirmationAlert from "../../pages/ExitConfirmationAlert.js";
import fadeOutAudio from "../../utils/audio.js";

export default function Practice($container, connWsManager) {
    let audio_pong = new Audio("../../../assets/sound/pong.mp3");
    let audio_out = new Audio("../../../assets/sound/out.mp3");
    let playerImage = new Image();

    let backgroundCanvas, backgroundCtx, gameCanvas, gameCtx;
    let paddle, pong, player1, player2, balls, playerArea = 50;
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
        // 게임 오브젝트 초기화
        paddle = { width: containerHeight * 0.03, height: containerHeight * 0.2, speed: containerHeight * 0.015, color: 'WHITE' };
        pong = { radius: containerHeight * 0.03, speed: containerHeight * 0.015, color: '#ffa939' };
        // 이미지 초기화
        playerImage.src = "../../assets/image/character.png";
    }

    function getRandomDirection() {
        // 20도에서 40도 사이의 각도를 라디안으로 변환
        let minAngle = 20 * Math.PI / 180;
        let maxAngle = 40 * Math.PI / 180;
        // 랜덤 각도 생성
        let angle = Math.random() * (maxAngle - minAngle) + minAngle;
        // 무작위로 방향 뒤집기
        let dirX = Math.cos(angle) * (Math.random() < 0.5 ? -1 : 1);
        let dirY = Math.sin(angle) * (Math.random() < 0.5 ? -1 : 1);
        return {
            dirX: dirX,
            dirY: dirY
        };
    }
    const  initGameObjects = (resetScores = false) => {
        // 플레이어 초기 위치 설정
        player1.y = gameCanvas.height / 2 - paddle.height / 2;
        player2.y = gameCanvas.height / 2 - paddle.height / 2;
        // 점수를 리셋해야 하는 경우에만 점수 초기화
        if (resetScores) {
            player1.score = 0;
            player2.score = 0;
        }
        // 공의 위치와 방향 초기화
        balls = []; // 공 배열 초기화
        let initialBallDirection = getRandomDirection();
        balls.push({ x: gameCanvas.width / 2, y: gameCanvas.height / 2, ...initialBallDirection });
        if (gameMode === 'hard') {
            let ball2Direction = { dirX: -initialBallDirection.dirX, dirY: -initialBallDirection.dirY };
            balls.push({ x: gameCanvas.width / 2, y: gameCanvas.height / 2, ...ball2Direction });
        }
        // 키 입력 상태 초기화
        for (const key in keys) {
            keys[key] = false;
        }
    }

    const gameInit = () => {
        isBallMoving = false;
        player1 = { x: playerArea, y: 0, score: 0 }
        player2 = { x: gameCanvas.width - paddle.width - playerArea, y: 0, score: 0 }
        initGameObjects(true);

        setTimeout(() => {
            isBallMoving = true;
        }, 500);

        gameLoop();
    }

    const gameLoop = () => {
        movePaddle();
        update();
        drawGame();
        animationFrameId = requestAnimationFrame(gameLoop); // 게임 루프 생성
    };

    const resetPosition = () => {
        isBallMoving = false;
        audio_out.play();
        initGameObjects(); // 위치만 재설정, 점수는 유지

        setTimeout(() => {
            isBallMoving = true;
        }, 500);
    }

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
                audio_pong.play();
            }
            // 공이 왼쪽 또는 오른쪽 끝에 도달했을 때 점수 처리
            if (ball.x - pong.radius < playerArea) { // 왼쪽 벽에 충돌
                player2.score++;
                resetPosition();
            } else if (ball.x + pong.radius > gameCanvas.width - playerArea) { // 오른쪽 벽에 충돌
                player1.score++;
                resetPosition();
            }
            // 패들 충돌 검사
            let nearestPlayer = (ball.x < gameCanvas.width / 2) ? player1 : player2;
            if (ball.x - pong.radius <= nearestPlayer.x + paddle.width
                && ball.x + pong.radius >= nearestPlayer.x
                && ball.y - pong.radius <= nearestPlayer.y + paddle.height
                && ball.y + pong.radius >= nearestPlayer.y) {
                ball.dirX = -ball.dirX; // X 방향 반전
                ball.x += ball.dirX;
                audio_pong.play();
            }
        });
    };

    const drawBackground = () => {
        backgroundCtx.fillStyle = '#27522d';
        backgroundCtx.fillRect(playerArea, 0, backgroundCanvas.width - playerArea * 2, backgroundCanvas.height);
        backgroundCtx.strokeStyle = "WHITE";
        backgroundCtx.lineWidth = 1;
        backgroundCtx.beginPath();
        backgroundCtx.setLineDash([]);
        backgroundCtx.moveTo(playerArea, backgroundCanvas.height / 2);
        backgroundCtx.lineTo(backgroundCanvas.width - playerArea, backgroundCanvas.height / 2);
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
        gameCtx.fillText(player1.score.toString(), gameCanvas.width / 4, playerArea);
        gameCtx.fillText(player2.score.toString(), (3 * gameCanvas.width) / 4, playerArea);
        // 플레이어 패들 그리기
        gameCtx.fillStyle = paddle.color;
        gameCtx.fillRect(player1.x, player1.y, paddle.width, paddle.height);
        gameCtx.fillStyle = paddle.color;
        gameCtx.fillRect(player2.x, player2.y, paddle.width, paddle.height);
        if (playerImage.complete) {
            gameCtx.drawImage(playerImage, player1.x - playerArea, player1.y + (paddle.height / 2) - (playerArea / 2), playerArea, playerArea);
            gameCtx.drawImage(playerImage, player2.x + paddle.width + 5, player2.y + (paddle.height / 2) - (playerArea / 2) , playerArea, playerArea);
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
        const main = $container.querySelector('#main');
        if (!main) return;
        main.innerHTML = `
            <div class="game-container">
                <div class="game-title-container">
                    <button class="game-back-btn non-outline-btn">< 로비로 돌아가기</button>
                    <div id="game-mode-button-container">
                        <button id="easy-btn" class="game-mode-btn green-btn non-outline-btn">공 1개</button>
                        <button id="hard-btn" class="game-mode-btn green-btn non-outline-btn">공 2개</button>
                    </div>
                </div>
                <div class="game-canvas-container">
                    <canvas id="background-canvas"></canvas>
                    <canvas id="game-canvas"></canvas>
                </div>
            </div>
        `;
        const easyButton = $container.querySelector('#easy-btn');
        if (easyButton) {
            easyButton.classList.add('selected');
        }
    };

    const setupEventListener = () => {
        const gameBackButton = $container.querySelector('.game-back-btn');
        if (gameBackButton) {
            gameBackButton.addEventListener('click', () => {
                new ExitConfirmationAlert($container, { "connWsManager": connWsManager });
            });
        }

        const gameModeButtonContainer = $container.querySelector('#game-mode-button-container');
        if (gameModeButtonContainer) {
            gameModeButtonContainer.addEventListener('click', (event) => {
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
        }

        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW': keys['s'] = false; keys['w'] = true; break;
                case 'KeyS': keys['w'] = false; keys['s'] = true; break;
                case 'ArrowUp': keys['ArrowDown'] = false; keys['ArrowUp'] = true; break;
                case 'ArrowDown': keys['ArrowUp'] = false; keys['ArrowDown'] = true; break;
            }
        });

        document.addEventListener('leave-game', () => {
            cancelAnimationFrame(animationFrameId); // 현재 게임 루프 중지
        });
    };

    render();
    setupEventListener();
    init();
    gameInit();
}