import PlayerInfo from "./PlayerInfo.js";
import ExitConfirmationAlert from "../../pages/ExitConfirmationAlert.js";
import {importCss} from "../../utils/importCss.js";
import ErrorPage from "../../pages/ErrorPage.js";
import useState from "../../utils/useState.js";
import UserCell from "../user-list/UserCell.js";
import {navigate} from "../../utils/navigate.js";
import hasUndefinedArgs from "../../utils/hasUndefinedArgs.js";
import GameWinner from "../../pages/GameWinner.js";
import VsSchedule from "../../pages/vs-schedule/VsSchedule.js";
import {BACKEND, fetchWithAuth} from "../../api.js";

/**
 * @param {HTMLElement} $container
 * @param { Object } wsManagers
 */
export default function GameRoom($container, wsManagers) {
    if (hasUndefinedArgs($container, wsManagers))
        return;
    
    const { gameWsManager, connWsManager } = wsManagers; // 둘 다 무조건 있음 !
    let audio_button = new Audio("../../assets/sound/button.mp3");
    let [getPlayers, setPlayers] = useState([], this, 'renderPlayers');

    const init = () => {
        $container.querySelectorAll('.invite-btn').forEach(button => {
            button.style.display = 'block';
        });
    }

    const render = () => {
        const main = $container.querySelector('#main');
        if (!main) return;
        main.innerHTML = `
            <div class="game-room-container">
                <div class="game-room-title-container">
                    <button class="game-room-back-btn non-outline-btn"><</button>
                    <div class="game-room-title">게임방</div>
                    <div class="game-room-detail"></div>
                </div>
                <div class="game-room-player-container">
                </div>
                <div class="game-room-ready-button-container">
                    <button class="game-room-ready-btn red-btn non-outline-btn">준비하기</button>
                </div>
            </div>
        `;
    }

    this.renderPlayers = () => {
        const playerContainer = $container.querySelector('.game-room-player-container');
        if (playerContainer) {
            playerContainer.innerHTML = getPlayers()
                .map(player => PlayerInfo(player))
                .join('');
        }
    };

    const setupEventListener = () => {
        $container.querySelector('.game-room-container').addEventListener('click', function(event) {
            audio_button.play();
            if (event.target.closest('.game-room-back-btn')) {
                new ExitConfirmationAlert($container, wsManagers);
            } else if (event.target.closest('.game-room-ready-btn')) {
                gameWsManager.sendMessage({ "type" : "ready" });
            }
        });
        document.addEventListener('inviteUser', (event) => {
            const {sender, receiver} = event.detail;
            connWsManager.sendMessage({ "type" : "invite", "sender" : sender, "receiver" : receiver });
            console.log("invitation has been sent");
        });

        document.addEventListener('profileChanged', () => {
            gameWsManager.sendMessage({ "type" : "game_status" });
        });
    }

    // 게임방 정보 (타입, 모드, 플레이어 목록, ready 정보)
    gameWsManager.addMessageHandler(function (data) {
        if (data.type === "game_status") {
            // $container.querySelector('#page').style.display = 'none';
            const gameRoomDetail = $container.querySelector('.game-room-detail');
            if (gameRoomDetail) {
                gameRoomDetail.innerHTML = `
                    타입:<img style="height: 30px" src="../../../assets/image/${data.game_type}.png" alt="type">  
                    모드:<img style="height: 30px" src="../../../assets/image/${data.game_mode}.png" alt="mode">
                `;
            }
            if (data.game_type === 'one_to_one') {
                setPlayers([data.players[0], data.players[1]]);
            } else {
                setPlayers(data.players);
            }
        }
    });

    // 게임방 시작 (모두 ready 완료했을 때 게임, 대진표 정보)
    gameWsManager.addMessageHandler(function (data) {
        if (data.type === "game_start") {
            delete data.type;
            fetchWithAuth(`https://${BACKEND}/api/user/me/`)
                .then(userMeData => {
                    data.additionalData = { "wsManagers": wsManagers, "id": userMeData.id };
                    document.dispatchEvent(new Event("pause-lobby-bgm"));
                    navigate('game', data);
                })
                .catch(error => {
                    console.error("게임 컴포넌트에서 user/me 실패");
                    new ErrorPage($container, error.status);
                });
        }
    });
    
    importCss("assets/css/game-room.css")
    init();
    render();
    setupEventListener();
}