import PlayerInfo from "./PlayerInfo.js";
import ExitConfirmation from "../../pages/ExitConfirmation.js";
import {importCss} from "../../utils/importCss.js";
import ErrorPage from "../../pages/ErrorPage.js";
import useState from "../../utils/useState.js";
import UserCell from "../user-list/UserCell.js";

/**
 * @param {HTMLElement} $container
 * @param { WebSocketManager } wsManager
 */
export default function GameRoom($container, wsManager) {
    let [getPlayers, setPlayers] = useState([], this, 'renderPlayers');

    const init = () => {
        $container.querySelectorAll('.invite-btn').forEach(button => {
            button.style.display = 'block';
        });
    }

    const render = () => {
        $container.querySelector('#main').innerHTML = `
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
                new ExitConfirmation($container);
            } else if (event.target.closest('.game-room-ready-btn')) {
                console.log("hi")
                wsManager.sendMessage({ "type" : "ready" });
            }
        });
    }

    wsManager.addMessageHandler(function (data) {
        if (data.type && data.mode) {
            $container.querySelector('.game-room-detail').innerHTML = `
                타입:<img style="width: 30px" src="../../../assets/image/${data.type}.png" alt="type">  모드: ${data.mode}
            `;
            setPlayers(data.players);
        }
    });
    importCss("assets/css/game-room.css")
    init();
    render();
    setupEventListener();
}