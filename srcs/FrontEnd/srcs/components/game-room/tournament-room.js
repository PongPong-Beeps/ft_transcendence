import {importCss} from "../../utils/import-css.js";
import {navigate} from "../../utils/navigate.js";
import ExitConfirmation from "../../pages/exit-confirmation.js";

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
                
                </div>
            </div>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('.game-room-back-btn').addEventListener('click', () => {
           new ExitConfirmation($container)
            $container.querySelector('#page').style.display = 'block'
        });
    }

    importCss("assets/css/game-room.css")
    render();
    setupEventListener();
}