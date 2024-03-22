import PlayerInfo from "./PlayerInfo.js";
import ExitConfirmation from "../../pages/ExitConfirmation.js";
import {importCss} from "../../utils/importCss.js";
import ErrorPage from "../../pages/ErrorPage.js";

/**
 * @param {HTMLElement} $container
 * @param { WebSocketManager } wsManager
 */
export default function GameRoom($container, wsManager) {
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
                    ${PlayerInfo()}
                    ${PlayerInfo()}
                </div>
            </div>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('.game-room-back-btn').addEventListener('click', () => {
            new ExitConfirmation($container);
        });
    }

    // {
    //     "type" : "one_to_one" or "tournament",
    //     "mode" : "easy" or "hard",
    //
    //     "p1" : "nickname",
    //     "p2" : "nickname",
    //     "p3" : "nickname",
    //     "p4" : "nickname",
    //
    //     "p1_img" : img_binary,
    //     "p2_img" : img_binary,
    //     "p3_img" : img_binary,
    //     "p4_img" : img_binary,
    //
    //     "p1_ready" : True or False,
    //     "p2_ready" : True or False,
    //     "p3_ready" : True or False,
    //     "p4_ready" : True or False,
    // }

    wsManager.addMessageHandler(function (data) {
        if (data.type && data.mode) {
            $container.querySelector('.game-room-detail').innerHTML = `
                타입:<img style="width: 30px" src="../../../assets/image/${data.type}.png" alt="type">  모드: ${data.mode}
            `;
        }
    });
    importCss("assets/css/game-room.css")
    init();
    render();
    setupEventListener();
}