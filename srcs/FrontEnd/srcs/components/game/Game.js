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
     let players = [], fixCanvas, player_area, paddleWidth, itemRadius;
     const paddleColor = '#FFFFFF', pongColor = '#FFA939', backgroundColor = '#27522D', itemColor = '#00FF00';
     let currentKey = '';
     let itemImage = new Image();
     let audio_pong = new Audio("../../../assets/sound/pong.mp3");
     let audio_item = new Audio("../../../assets/sound/item.mp3");
     let audio_attack = new Audio("../../../assets/sound/attack.mp3");
     // let bgm_versus = new Audio("../../../assets/sound/bgm_versus.mp3")
     // let bgm_in_game = new Audio("../../../assets/sound/bgm_game.mp3")
     // let bgm_end_game = new Audio("../../../assets/sound/bgm_room.mp3")
     itemImage.src = "../../../assets/image/img.png"; // 가정
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
               return value / fixCanvas.height * gameCanvas.height;
          }
     }
     const drawGame = (playersData, ballsData, itemData, soundData) => {
          gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
          playersData.forEach((player, index) => {
               let paddle = { "x": adjustScale(player.paddle.x, 'x'), "y": adjustScale(player.paddle.y, 'y'), "width": adjustScale(paddleWidth, 'x'), "height": adjustScale(player.paddle.height, 'y') };
               drawPlayerPaddle(players[index], paddle, paddle.x, paddle.y, index);

               // 심장 및 아이템 상태 표시
               if (index < 2) {
                    gameCtx.font = "20px Arial";  // 원래 글꼴 크기가 10px라고 가정하고 3배로 늘립니다.
                    let textX = 10 + 500 * index;  // 텍스트의 x 좌표를 고정값으로 설정
                    let textY = 0;  // 텍스트의 y 좌표를 고정값으로 설정, 각 플레이어의 정보가 겹치지 않게 하기 위해 index를 사용
                    gameCtx.fillText(`${players[index].nickname}`, textX, textY);
                    gameCtx.fillText(`Heart: ${player.heart}`, textX, textY + 20);
                    if (player.item) {
                         gameCtx.fillText(`Item: ON`, textX, textY + 40);
                    }
                    else {
                         gameCtx.fillText(`Item: OFF`, textX, textY + 40);
                    }
               }
          });

          ballsData.forEach(ball => {
               let ballPos = { "x": adjustScale(ball.x, 'x'), "y": adjustScale(ball.y, 'y') };
               let radius = adjustScale(ball.radius, 'x');
               drawBall(ballPos, radius);
          });
          if (itemData) {
               let itemPos = { "x": adjustScale(itemData.x, 'x'), "y": adjustScale(itemData.y, 'y') };
               gameCtx.drawImage(itemImage, itemPos.x, itemPos.y, itemRadius * 2, itemRadius * 2);
          }
          if (soundData.pong) {
               audio_pong.play();
          }
          if (soundData.item) {
               audio_item.play();
          }
          if (soundData.attack) {
               audio_attack.play();
          }
     }
     // 플레이어 패들 그리기 함수는 이전과 동일하나, paddle_size 인자를 제거합니다.
     const drawPlayerPaddle = (player, paddle, x, y, idx) => {
          gameCtx.fillStyle = paddleColor;
          gameCtx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
          if (idx == 0) {
               x -= 50;
          }
          else {
               x += 20;
          }
          y += paddle.height;
          if (player.image.complete) {
               gameCtx.drawImage(player.image, x, y, player_area, player_area);
          }
     };
     // render 함수와 setupEventListener 함수는 이전과 동일합니다.
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

     // 페이드 아웃 함수 정의
     function fadeOut(audio) {
          let volume = audio.volume;
          // 100ms마다 볼륨을 감소시킵니다.
          let fadeoutInterval = setInterval(function () {
               volume -= 0.1; // 볼륨을 0.1씩 감소시킵니다.
               if (volume > 0) {
                    audio.volume = volume; // 볼륨을 설정합니다.
               } else {
                    clearInterval(fadeoutInterval); // 페이드 아웃이 완료되면 타이머를 중지합니다.
                    audio.pause(); // 재생을 멈춥니다.
               }
          }, 100);
     }

     gameWsManager.addMessageHandler(function (roundData) {
          if (roundData.type === 'round_ready') {
               // "round_ready" 메시지 핸들러
               $container.querySelector('#page').style.display = 'none';
               // 플레이어 정보 저장
               roundData.player_data.map(player => {
                    let image = new Image();
                    image.src = player.image ? 'data:image/jpeg;base64,' + player.image : "../../../assets/image/cruiser.gif";
                    players.push({ "nickname": player.nickname, "image": image });
               });
               console.log(players[0].nickname, "님과 ", players[1].nickname, "님의 게임이 곧 시작됩니다");
               // 변수 저장
               fixCanvas = roundData.fix.canvas;
               player_area = adjustScale(roundData.fix.player_area, 'x');
               paddleWidth = roundData.fix.paddle_width;
               itemRadius = roundData.fix.item_radius;
               // 배경 그리기
               drawBackground();

               // bgm_in_game.volume = 0.2;
               // bgm_in_game.play();
               // console.log("bgm in_game");
          }
     });

     gameWsManager.addMessageHandler(function (gameData) {
          if (gameData.type === 'round_ing') {
               drawGame(gameData.players, gameData.balls, gameData.item, gameData.sound);
          }
     });

     // game_end 처리는 이전과 동일합니다.
     gameWsManager.addMessageHandler(function (gameData) {
          if (gameData.type === "game_end") {
               console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~", gameData);
               gameWsManager.ws.close();
               new GameWinner($container, gameData, connWsManager);

               // fadeOut(bgm_in_game);
               // // bgm_in_game.pause();
               // bgm_end_game.currentTime = 0;
               // bgm_end_game.volume = 0.3;
               // bgm_end_game.play();

               // // 3초 후에 재생을 멈춥니다.
               // setTimeout(function () {
               //      fadeOut(bgm_end_game);
               //      // bgm_end_game.pause();
               // }, 3000);

               // console.log("bgm end_game");
          }
     });
     render();
     setupEventListener();
     initCanvas();
     new VsSchedule($container, data.round_data);
}
