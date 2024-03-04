import {importCss} from "../../utils/import-css.js";
import {navigate} from "../../utils/navigate.js";
import ExitConfirmation from "../../pages/exit-confirmation.js";
import PlayerInfo from "./player-info.js";
import Error from "../../pages/error.js";

/**
 * @param { HTMLElement } $container
 * @param { Object } difficulty
 */
export default function TournamentRoom($container, difficulty) {
    const render = () => {
        $container.querySelector('#main').innerHTML = `
            <div class="game-room-container">
                <div class="game-room-title-container">
                    <button class="game-room-back-btn non-outline-btn"><</button>
                    <div class="game-room-title">게임방</div>
                    <div class="game-room-difficulty">난이도 : ${difficulty === "easy" ? "쉬움" : "어려움"}</div>
                </div>
                <div class="game-room-player-container">
                    ${PlayerInfo()}
                    ${PlayerInfo()}
                    ${PlayerInfo()}
                    ${PlayerInfo()}
                </div>
            </div>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('.game-room-back-btn').addEventListener('click', () => {
            new ExitConfirmation($container)
        });
    }

    if (difficulty === undefined) {
        new Error($container);
        return;
    }

    importCss("assets/css/game-room.css")
    render();
    setupEventListener();
}