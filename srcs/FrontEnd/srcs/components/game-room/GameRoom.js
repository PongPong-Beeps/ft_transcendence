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

/**
 * @param {HTMLElement} $container
 * @param { [WebSocketManager] } wsManagers
 */
export default function GameRoom($container, wsManagers) {
    if (hasUndefinedArgs($container, wsManagers))
        return;
    
    const { gameWsManager, connWsManager } = wsManagers;
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
                    타입:<img style="width: 30px" src="../../../assets/image/${data.game_type}.png" alt="type">  모드: ${data.game_mode}
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
            data.additionalData = { "wsManagers": wsManagers };
            navigate('game', data);
        }
    });
    
    importCss("assets/css/game-room.css")
    init();
    render();
    setupEventListener();
}