import {importCss} from "../utils/importCss.js";
import {navigate} from "../utils/navigate.js";

/**
 * @param { HTMLElement } $container
 * @param { [WebSocketManager] } wsManagers
 */
export default function ExitConfirmationAlert($container, wsManagers) {
    const { gameWsManager, connWsManager } = wsManagers;

    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="alert-background">
                    <div id="alert-container">
                    <div id="alert-title">정말로 게임방을 나가시나요 ?</div>
                    <div id="alert-button-container">
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
            navigate("lobby", connWsManager);
        });

        $container.querySelector('#exit-confirmation-stay-btn').addEventListener('click', () => {
            $container.querySelector('#page').style.display = 'none';
        });
    }

    importCss("assets/css/alert.css");
    render();
    setupEventListener();
}