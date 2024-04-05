import VsSchedule from "../../pages/vs-schedule/VsSchedule.js";
import hasUndefinedArgs from "../../utils/hasUndefinedArgs.js";
import GameWinner from "../../pages/GameWinner.js";
import { navigate } from "../../utils/navigate.js";

/**
 * @param { HTMLElement } $container
 * @param { Object } data
 */
export default function Game($container, data) {
     if (hasUndefinedArgs($container, data))
          return;

     const { gameWsManager, connWsManager } = data.additionalData.wsManagers;

     let backgroundCanvas, backgroundCtx, gameCanvas, gameCtx;
     let itemImage = new Image();
     const paddleColor = '#ffffff', pongColor = '#ffa939', attackBallColor = '#ff396e', backgroundColor = '#27522d';
     let playerData, playerArea, fixWidth, fixHeight, paddleWidth, itemRadius; // round_ready 때 받을 정보
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

          // 필요한 이미지 초기화
          itemImage.src = "../../assets/image/item.png";
     }

     const drawBackground = () => {
          gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
          // 플레이어 닉네임
          const playerNicknameContainer = $container.querySelector('.game-player-nickname-container');
          if (playerNicknameContainer) {
               playerNicknameContainer.innerHTML = playerData
                   .map(player => `<div>${player.nickname}</div>`)
                   .join('');
          }
          // 배경 캔버스
          backgroundCtx.fillStyle = backgroundColor;
          backgroundCtx.fillRect(playerArea, 0, backgroundCanvas.width - playerArea * 2, backgroundCanvas.height);
          backgroundCtx.strokeStyle = paddleColor;
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
     };

     const adjustScale = (value, axis) => {
          if (axis === 'x') {
               return value / fixWidth * gameCanvas.width;
          } else {
               return value / fixHeight * gameCanvas.height
          }
     }

     const drawGame = (players, balls, item) => {
          gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
          players.forEach((player, index) => {
               let paddle = { "x": adjustScale(player.paddle.x, 'x'), "y": adjustScale(player.paddle.y, 'y'), "height": adjustScale(player.paddle.height, 'y') }
               let playerPos = { "x" : (index === 0) ? paddle.x - playerArea : paddle.x + paddleWidth, "y": paddle.y + (paddle.height / 2) - (playerArea / 2)};
               drawPlayerPaddle(paddle, playerData[index].image, playerPos);
               // 점수, 아이템
               drawItemHeart(index, player.item, player.heart);
          });
          balls.forEach((ball, index) => {
               let ballPos = { "x": adjustScale(ball.x, 'x'), "y": adjustScale(ball.y, 'y') };
               let radius = adjustScale(ball.radius, 'x');
               let color = (index === 0) ? pongColor : attackBallColor;
               drawBall(ballPos, radius, color);
          });
          if (item) {
               let itemPos = { "x": adjustScale(item.x, 'x'), "y": adjustScale(item.y, 'y') };
               gameCtx.drawImage(itemImage, itemPos.x, itemPos.y, itemRadius * 2, itemRadius * 2);
          }
     }

     const drawPlayerPaddle = (paddle, playerImage, playerPos) => {
          gameCtx.fillStyle = paddleColor;
          gameCtx.fillRect(paddle.x, paddle.y, paddleWidth, paddle.height);
          gameCtx.drawImage(playerImage, playerPos.x, playerPos.y, playerArea, playerArea);
     };

     const drawItemHeart = (index, item, heart) => {
          const playerInfoContainer = $container.querySelector(`#player${index + 1}`);
          playerInfoContainer.innerHTML = '';
          let heartsHTML = '';
          let itemHTML = data.game_mode === 'hard' // 아이템 모드일 때만 슬롯 표시
              ? item ? '<img src="../../assets/image/item-on.png" style="height: 30px; margin: 0 5px;" />'
                  : '<img src="../../assets/image/item-off.png" style="height: 30px; margin: 0 5px;" />'
              : '';

          for (let i = 0; i < heart; i++) {
               heartsHTML += '<img src="../../assets/image/heart.png" style="height: 30px; margin: 0 5px;" />';
          }

          if (index === 0) {
               playerInfoContainer.innerHTML = itemHTML + heartsHTML;
          } else {
               playerInfoContainer.innerHTML = heartsHTML + itemHTML;
          }
     }

     const drawBall = (ballPos, radius, color) => {
          gameCtx.beginPath();
          gameCtx.arc(ballPos.x, ballPos.y, radius, 0, Math.PI * 2, true);
          gameCtx.fillStyle = color;
          gameCtx.fill();
          gameCtx.closePath();
     };

     const drawText = (text, clear = false) => {
          gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
          if (clear) return;
          gameCtx.font = '2vw DNF Bit Bit v2';
          gameCtx.fillStyle = '#ffffff';
          gameCtx.strokeStyle = '#5C7320';
          gameCtx.lineWidth = 2;
          gameCtx.textAlign = 'center';
          const lines = text.split('\n');
          const lineHeight = gameCtx.measureText('M').width * 1.5; // Increase line height
          lines.forEach((line, i) => {
              gameCtx.fillText(line, gameCanvas.width / 2, gameCanvas.height / 2 + i * lineHeight);
              gameCtx.strokeText(line, gameCanvas.width / 2, gameCanvas.height / 2 + i * lineHeight); // Draw border
          });
      };

     const render = () => {
          const main = $container.querySelector('#main');
          if (!main) return;
          main.innerHTML = `
            <div class="game-container">
                <div class="game-info-container">
                    <div class="game-player-nickname-container"></div>
                    <div class="game-player-info-container">
                        <div id="player1"></div>
                        <div id="player2"></div>
                    </div>
                </div>
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
                         gameWsManager.sendMessage({ "type": "paddle", "direction": "up" });
                         break;
                    case 'KeyS':
                    case 'ArrowDown':
                         gameWsManager.sendMessage({ "type": "paddle", "direction": "down" });
                         break;
                    case 'ShiftLeft':
                    case 'ShiftRight':
                         gameWsManager.sendMessage({ "type": "item" });
                         break;
               }
          });
     };

     gameWsManager.addMessageHandler(function (roundData) {
          if (roundData.type === 'round_ready') {
               // 플레이어 정보 저장
               $container.querySelector('#page').style.display = 'none';
               playerData = []; // 빈 배열로 초기화
               roundData.player_data.map(player => {
                    let image = new Image();
                    image.src = player.image ? 'data:image/jpeg;base64,' + player.image : "../../../assets/image/cruiser.gif";
                    playerData.push({ "nickname" : player.nickname, "image" : image});
               });
               // 변수 저장
               fixWidth = roundData.fix.canvas.width;
               fixHeight = roundData.fix.canvas.height;
               playerArea = adjustScale(roundData.fix.player_area, 'x');
               paddleWidth = adjustScale(roundData.fix.paddle_width, 'x');
               itemRadius = adjustScale(roundData.fix.item_radius, 'x');
               // 배경 그리기
               drawBackground();
               drawText("곧 게임이 시작됩니다");
          }
     });

     gameWsManager.addMessageHandler(function (roundData) {
          if (roundData.type === 'round_start') {
               drawText('', true);
          }
     });

     gameWsManager.addMessageHandler(function (gameData) {
          if (gameData.type === 'round_ing') {
               drawGame(gameData.players, gameData.balls, gameData.item);
          }
     });

     gameWsManager.addMessageHandler(function (roundData) {
          if (roundData.type === 'round_end') {
               drawText(`${roundData.winner.nickname}님이\n 이겼습니다.`);
          }
     })

     gameWsManager.addMessageHandler(function (gameData) {
          if (gameData.type === 'item') {
               // 🌟 item_type에 따라 사운드 처리 예정
               console.log("@@@ ITEM @@@ ", gameData.nickname, "님이 ", gameData.item_type, " 아이템을 사용했습니다");
          }
     });

     gameWsManager.addMessageHandler(function (gameData) {
          if (gameData.type === "game_end") {
               gameWsManager.ws.close();
               drawText('', true);
               new GameWinner($container, gameData, connWsManager);
          }
     });

     render();
     setupEventListener();
     initCanvas();
}