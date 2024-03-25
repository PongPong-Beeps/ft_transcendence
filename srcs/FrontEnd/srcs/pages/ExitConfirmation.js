import {importCss} from "../utils/importCss.js";
import {navigate} from "../utils/navigate.js";

/**
 * @param { HTMLElement } $container
 * @param { WebSocketManager } gameWsManager
 */
export default function ExitConfirmation($container, gameWsManager = undefined) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="exit-confirmation-background">
                    <div id="exit-confirmation-container">
                    <div id="exit-confirmation-title">정말로 게임방을 나가시나요 ?</div>
                    <div id="exit-confirmation-button-container">
                        <button class="green-btn" id="exit-confirmation-leave-btn">나가기</button>
                        <button class="green-btn" id="exit-confirmation-stay-btn">머무르기</button>
                    </div>
                    </div>
                </div>
            `;
            page.style.display = 'block';
        }
    }

    const setupEventListener = () => {
        $container.querySelector('#exit-confirmation-leave-btn').addEventListener('click', () => {
            if (gameWsManager)
                gameWsManager.ws.close();
            navigate("lobby");
        });

        $container.querySelector('#exit-confirmation-stay-btn').addEventListener('click', () => {
            $container.querySelector('#page').style.display = 'none';
        });
    }

    importCss("assets/css/exit-confirmation.css");
    render();
    setupEventListener();
}