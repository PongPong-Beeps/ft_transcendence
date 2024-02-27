import {importCss} from "../utils/import-css.js";
import {navigate} from "../utils/navigate.js";

/**
 * @param { HTMLElement } $container
 */
export default function ExitConfirmation($container) {
    const render = () => {
        $container.querySelector('#page').innerHTML = `
            <div id="exit-confirmation-background">
                <div id="exit-confirmation-container">
                <div id="exit-confirmation-title">정말로 게임방을 나가시겠습니까 ?</div>
                <div id="exit-confirmation-button-container">
                    <button class="green-btn" id="exit-confirmation-ok-btn">확인</button>
                    <button class="green-btn" id="exit-confirmation-cancel-btn">취소</button>
                </div>
                </div>
            </div>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('#exit-confirmation-ok-btn').addEventListener('click', () => {
            navigate("lobby");
        });
        $container.querySelector('#exit-confirmation-cancel-btn').addEventListener('click', () => {
            $container.querySelector('#page').style.display = 'none';
        });
    }

    importCss("assets/css/exit-confirmation.css");
    render();
    setupEventListener();
}