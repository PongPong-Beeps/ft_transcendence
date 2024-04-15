import VsSchedule from "../../pages/vs-schedule/VsSchedule.js";
import hasUndefinedArgs from "../../utils/hasUndefinedArgs.js";
import GameWinner from "../../pages/GameWinner.js";
import fadeOutAudio from "../../utils/audio.js";

/**
 * @param { HTMLElement } $container
 * @param { Object } data
 */
export default function Game($container, data) {
     if (hasUndefinedArgs($container, data))
          return;

     const { gameWsManager, connWsManager } = data.additionalData.wsManagers; // 둘 다 무조건 있음 !

     let bgm_game = new Audio("../../../assets/sound/bgm_game.mp3");
     let bgm_versus = new Audio("../../../assets/sound/bgm_versus.mp3");
     let audio_pong = new Audio("../../../assets/sound/pong.mp3");
     let audio_out = new Audio("../../../assets/sound/out.mp3");
     let audio_item = new Audio("../../../assets/sound/item.mp3");
     let audio_b_up = new Audio("../../../assets/sound/b_up.mp3");
     let audio_b_add = new Audio("../../../assets/sound/b_add.mp3");
     let audio_p_down = new Audio("../../../assets/sound/p_down.mp3");

     let backgroundCanvas, backgroundCtx, gameCanvas, gameCtx;
     let itemImage = new Image();
     const paddleColor = '#ffffff', pongColor = '#ffa939', attackBallColor = '#ff396e', backgroundColor = '#27522d';
     let playerData, playerArea, fixWidth, fixHeight, paddleWidth, itemRadius, shieldArea; // round_ready 때 받을 정보
     let currentKey = '', currentHeart = [0, 0];
     let isPlaying = false, isMoving = false;

     const init = () => {
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
          // 이미지
          itemImage.src = "../../../assets/image/item.png";
          // 오디오
          bgm_game.volume = 0.3;
          bgm_game.loop = true;
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

     const drawGame = (players, balls, item, sound) => {
          gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
          players.forEach((player, index) => {
               let paddle = { "x": adjustScale(player.paddle.x, 'x'), "y": adjustScale(player.paddle.y, 'y'), "height": adjustScale(player.paddle.height, 'y') }
               let playerPos = { "x" : (index === 0) ? paddle.x - playerArea : paddle.x + paddleWidth, "y": paddle.y + (paddle.height / 2) - (playerArea / 2)};
               drawPlayerPaddle(paddle, playerData[index].image, playerPos);
               // 점수, 아이템
               drawItemHeart(index, player.item, player.heart, player.item_info);
               drawShield(player.item_info.shield, index, paddle);
          });
          balls.forEach((ball, index) => {
               let ballPos = { "x": adjustScale(ball.x, 'x'), "y": adjustScale(ball.y, 'y') };
               let radius = adjustScale(ball.radius, 'x');
               let color = (index === 0) ? pongColor : attackBallColor;
               if (index === 0) isMoving = ball.is_moving;
               drawBall(ballPos, radius, color);
          });
          if (item) {
               let itemPos = { "x": adjustScale(item.x, 'x'), "y": adjustScale(item.y, 'y') };
               // drawBall(itemPos, itemRadius, '#4F3096');
               gameCtx.drawImage(itemImage, itemPos.x - itemRadius, itemPos.y - itemRadius, itemRadius * 2, itemRadius * 2);
          }
     }

     const drawShield = (isShield, playerIndex, paddle) => {
          if (isShield === false) return;
          gameCtx.fillStyle = '#1ecbe1';
          if (playerIndex === 0)
               gameCtx.fillRect(paddle.x + paddleWidth, 0, shieldArea, gameCanvas.height);
               // gameCtx.drawImage(playerImage, paddle.x + paddleWidth, 0, shieldArea, gameCanvas.height);
          else
               gameCtx.fillRect(paddle.x - paddleWidth, 0, shieldArea, gameCanvas.height);
               // gameCtx.drawImage(playerImage, paddle.x - paddleWidth, 0, shieldArea, gameCanvas.height);
     };

     const drawPlayerPaddle = (paddle, playerImage, playerPos) => {
          gameCtx.fillStyle = paddleColor;
          gameCtx.fillRect(paddle.x, paddle.y, paddleWidth, paddle.height);
          gameCtx.drawImage(playerImage, playerPos.x, playerPos.y, playerArea, playerArea);
     };

     const drawItemHeart = (index, item, heart, item_info) => {
          if (data.game_mode === 'hard') { // 아이템 모드일 때만 슬롯 표시
               const playerItemContainer = $container.querySelector(`#player${index + 1}-item`);
               let itemImage = '';
               if (item) {
                    if (item_info.can_see) {
                         switch (item_info.type) {
                              case 'b_add':
                                   itemImage = '<img src="../../../assets/image/b_add.png" style="height: 30px; margin: 0 5px;" />';
                                   break;
                              case 'b_up':
                                   itemImage = '<img src="../../../assets/image/b_up.png" style="height: 30px; margin: 0 5px;" />';
                                   break;
                              case 'p_down':
                                   itemImage = '<img src="../../../assets/image/p_down.png" style="height: 30px; margin: 0 5px;" />';
                                   break;
                              case 'p_up':
                                   itemImage = '<img src="../../../assets/image/p_up.png" style="height: 30px; margin: 0 5px;" />';
                                   break;
                              case 'shield':
                                   itemImage = '<img src="../../../assets/image/shield.png" style="height: 30px; margin: 0 5px;" />';
                                   break;
                         }
                    } else {
                         itemImage = '<img src="../../../assets/image/item-on.png" style="height: 30px; margin: 0 5px;" />';
                    }
                    currentKey = ''; // 아이템 갱신될 때 키 리셋
               } else {
                    itemImage = '<img src="../../../assets/image/item-off.png" style="height: 30px; margin: 0 5px;" />';
               }
               playerItemContainer.innerHTML = itemImage;
          }

          if (heart !== currentHeart[index]) { // 하트 갱신될 때만 그리기
               currentHeart[index] = heart;
               let heartsHTML = '';
               for (let i = 0; i < heart; i++)
                    heartsHTML += '<img src="../../../assets/image/heart.png" style="height: 30px; margin: 0 5px;" />';
               const playerHeartContainer = $container.querySelector(`#player${index + 1}-heart`);
               playerHeartContainer.innerHTML = heartsHTML;
               currentKey = ''; // 하트 갱신될 때 키 리셋
          }
     }

     // const drawItemHeart = (index, item, heart, item_info) => {
     //      if (data.game_mode === 'hard') { // 아이템 모드일 때만 슬롯 표시
     //           const playerItemContainer = $container.querySelector(`#player${index + 1}-item`);
     //           playerItemContainer.innerHTML = item ? '<img src="../../../assets/image/item-on.png" style="height: 30px; margin: 0 5px;" />'
     //               : '<img src="../../../assets/image/item-off.png" style="height: 30px; margin: 0 5px;" />';
     //           if (item) currentKey = ''; // 아이템 갱신될 때 키 리셋
     //      }

     //      if (heart !== currentHeart[index]) { // 하트 갱신될 때만 그리기
     //           currentHeart[index] = heart;
     //           let heartsHTML = '';
     //           for (let i = 0; i < heart; i++)
     //                heartsHTML += '<img src="../../../assets/image/heart.png" style="height: 30px; margin: 0 5px;" />';
     //           const playerHeartContainer = $container.querySelector(`#player${index + 1}-heart`);
     //           playerHeartContainer.innerHTML = heartsHTML;
     //           currentKey = ''; // 하트 갱신될 때 키 리셋
     //      }
     // }

     const drawBall = (ballPos, radius, color) => {
          gameCtx.beginPath();
          gameCtx.arc(ballPos.x, ballPos.y, radius, 0, Math.PI * 2, true);
          gameCtx.fillStyle = color;
          gameCtx.fill();
          gameCtx.closePath();
     };

     const playSound = (sound) => {
          if (sound.pong) audio_pong.play();
          if (sound.out) audio_out.play();
          if (sound.item) audio_item.play();
          if (sound.b_up) audio_b_up.play();
          if (sound.b_add) audio_b_add.play();
          if (sound.p_down) {
               audio_p_down.play()
               currentKey = '';
          };
     }

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
                          <div id="player1-item"></div>
                          <div id="player1-heart"></div>
                          <div id="player2-heart"></div>
                          <div id="player2-item""></div>
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
               if (isMoving === false) { // 공이 움직일 때만 이벤트 보내기
                    currentKey = '';
                    return;
               }
               if (isPlaying === false || currentKey === event.code) {  // 같은 키 이벤트 여러 번 보내는 것 방지
                    return;
               }
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

          document.addEventListener('leave-game', () => {
               fadeOutAudio(bgm_game, 1000);
          });
     };

     gameWsManager.addMessageHandler(function (roundData) {
          if (roundData.type === 'round_ready') {
               fadeOutAudio(bgm_versus, 500);
               // 대진표 아웃 !
               $container.querySelector('#page').style.display = 'none';
               // 플레이어 정보 저장
               playerData = []; // 빈 배열로 초기화
               isPlaying = false;
               roundData.player_data.map(player => {
                    let image = new Image();
                    image.src = player.image ? 'data:image/jpeg;base64,' + player.image : "../../../assets/image/cruiser.gif";
                    playerData.push({ "nickname" : player.nickname, "image" : image });
                    if (player.id === data.additionalData.id) {
                         isPlaying = true;
                    }

               });
               // 변수 저장
               fixWidth = roundData.fix.canvas.width;
               fixHeight = roundData.fix.canvas.height;
               playerArea = adjustScale(roundData.fix.player_area, 'x');
               paddleWidth = adjustScale(roundData.fix.paddle_width, 'x');
               itemRadius = adjustScale(roundData.fix.item_radius, 'x');
               shieldArea = adjustScale(roundData.fix.shield_area, 'x');
               // 배경 그리기
               drawBackground();
               drawText("곧 게임이 시작됩니다");
          }
     });

     gameWsManager.addMessageHandler(function (roundData) {
          if (roundData.type === 'round_start') {
               bgm_game.play();
               drawText('', true);
          }
     });

     gameWsManager.addMessageHandler(function (gameData) {
          if (gameData.type === 'round_ing') {
               drawGame(gameData.players, gameData.balls, gameData.item);
               playSound(gameData.sound);
          }
     });

     gameWsManager.addMessageHandler(function (roundData) {
          if (roundData.type === 'round_end') {
               drawText(`${roundData.winner.nickname}님이\n 이겼습니다.`);
               fadeOutAudio(bgm_game, 2000);
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
               drawText('', true);
               new GameWinner($container, gameData, data.additionalData.wsManagers);
          }
     });

     new VsSchedule($container, data.round_data);
     bgm_versus.play();
     render();
     setupEventListener();
     init();
}