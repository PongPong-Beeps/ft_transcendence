import VsSchedule from "../../pages/vs-schedule/VsSchedule.js";

/**
 * @param { HTMLElement } $container
 * @param { Object } data
 */
export default function Game($container, data) {
     let backgroundCanvas, backgroundCtx, gameCanvas, gameCtx;
     let players = [], fixCanvas, player_area;
     const paddleColor = '#ffffff', pongColor = '#ffa939', backgroundColor = '#27522d';
     let currentKey = '';

     const initCanvas = () => {
          const container = $container.querySelector('.game-canvas-container');
          const containerWidth = container.offsetWidth;
          const containerHeight = container.offsetHeight;

          // 배경용 캔버스 초기화
          backgroundCanvas = $container.querySelector('#background-canvas');
          backgroundCtx = backgroundCanvas.getContext('2d');
          backgroundCanvas.width = containerWidth;
          backgroundCanvas.height = containerHeight;

          // 게임 오브젝트용 캔버스 초기화
          gameCanvas = $container.querySelector('#game-canvas');
          gameCtx = gameCanvas.getContext('2d');
          gameCanvas.width = containerWidth;
          gameCanvas.height = containerHeight;
     }

     const drawBackground = () => {
          backgroundCtx.fillStyle = backgroundColor;
          backgroundCtx.fillRect(player_area, 0, backgroundCanvas.width - player_area * 2, backgroundCanvas.height);
          backgroundCtx.strokeStyle = paddleColor;
          backgroundCtx.lineWidth = 1;
          backgroundCtx.beginPath();
          backgroundCtx.setLineDash([]);
          backgroundCtx.moveTo(player_area, backgroundCanvas.height / 2);
          backgroundCtx.lineTo(backgroundCanvas.width - player_area, backgroundCanvas.height / 2);
          backgroundCtx.stroke();
          backgroundCtx.beginPath();
          backgroundCtx.setLineDash([]);
          backgroundCtx.moveTo(backgroundCanvas.width / 2, 0);
          backgroundCtx.lineTo(backgroundCanvas.width / 2, backgroundCanvas.height);
          backgroundCtx.stroke();
     };

     const adjustScale = (value, axis) => {
          if (axis === 'x') {
               return value / fixCanvas.width * gameCanvas.width;
          } else {
               return value / fixCanvas.height * gameCanvas.height
          }
     }

     const drawGame = (paddles, balls, score1, score2) => {
          gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
          // 점수
          gameCtx.font = "2em DNF Bit Bit v2";
          gameCtx.fillStyle = "WHITE";
          gameCtx.fillText(score1.toString(), gameCanvas.width / 4, player_area);
          gameCtx.fillText(score2.toString(), (3 * gameCanvas.width) / 4, player_area);
          // 플레이어, 패들
          let paddle1 = { "x": adjustScale(paddles.paddle1.x, 'x'), "y": adjustScale(paddles.paddle1.y, 'y') };
          let paddle2 = { "x": adjustScale(paddles.paddle2.x, 'x'), "y": adjustScale(paddles.paddle2.y, 'y') };
          let paddle_size = { "width": adjustScale(paddles.size.width, 'x'), "height": adjustScale(paddles.size.height, 'y') };
          drawPlayerPaddle(players[0], paddle1, paddle_size, paddle1.x - player_area, paddle1.y + (paddle_size.height / 2) - (player_area / 2));
          drawPlayerPaddle(players[1], paddle2, paddle_size, paddle2.x + paddle_size.width, paddle2.y + (paddle_size.height / 2) - (player_area / 2));
          // 공
          let ball1 = { "x": adjustScale(balls.ball1.x, 'x'), "y": adjustScale(balls.ball1.y, 'y') };
          let radius = adjustScale(balls.radius, 'x');
          drawBall(ball1, radius);
          if (data.game_mode === 'hard') { // 하드 모드
               let ball2 = { "x": adjustScale(balls.ball2.x, 'x'), "y": adjustScale(balls.ball2.y, 'y') };
               drawBall(ball2, radius);
          }
     }

     const drawPlayerPaddle = (player, paddle, paddle_size, x, y) => {
          gameCtx.fillStyle = paddleColor;
          gameCtx.fillRect(paddle.x, paddle.y, paddle_size.width, paddle_size.height);
          if (player.image.complete) {
               gameCtx.drawImage(player.image, x, y, player_area, player_area);
          }
     };

     const drawBall = (ball, radius) => {
          gameCtx.beginPath();
          gameCtx.arc(ball.x, ball.y, radius, 0, Math.PI * 2, true);
          gameCtx.fillStyle = pongColor;
          gameCtx.fill();
          gameCtx.closePath();
     };

     const render = () => {
          const main = $container.querySelector('#main');
          if (!main) return;
          main.innerHTML = `
            <div class="game-container">
                <div class="game-title-container"></div>
                <div class="game-canvas-container">
                    <canvas id="background-canvas"></canvas>
                    <canvas id="game-canvas"></canvas>
                </div>
            </div>
        `;
     };

     const setupEventListener = () => {
          document.addEventListener('keydown', (event) => {
               if (currentKey === event.code) return; // 같은 키 이벤트 여러 번 보내는 것 방지
               currentKey = event.code;
               switch (event.code) {
                    case 'KeyW':
                    case 'ArrowUp':
                         data.additionalData.gameWsManager.sendMessage({ "type": "paddle", "direction": "up" });
                         break;
                    case 'KeyS':
                    case 'ArrowDown':
                         data.additionalData.gameWsManager.sendMessage({ "type": "paddle", "direction": "down" });
                         break;
               }
          });
     };

     data.additionalData.gameWsManager.addMessageHandler(function (roundData) {
          if (roundData.type === 'round_start') {
               $container.querySelector('#page').style.display = 'none';
               // 플레이어 정보 저장
               roundData.player_data.map(player => {
                    let image = new Image();
                    image.src = player.image ? 'data:image/jpeg;base64,' + player.image : "../../../assets/image/cruiser.gif";
                    players.push({ "nickname" : player.nickname, "image" : image});
               });
               console.log(players[0].nickname, "님과 ", players[1].nickname, "님의 게임이 곧 시작됩니다");
               // 변수 저장
               fixCanvas = roundData.fix;
               player_area = adjustScale(roundData.player_area, 'x');
               // 배경 그리기
               drawBackground();
          }
     });

     data.additionalData.gameWsManager.addMessageHandler(function (gameData) {
          if (gameData.type === 'round_ing') {
               drawGame(gameData.paddles, gameData.balls, gameData.score1, gameData.score2);
          }
     });

     render();
     setupEventListener();
     initCanvas();

     new VsSchedule($container, data.round_data);
}