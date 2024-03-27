import { importCss } from "../utils/importCss.js";
import TestButton from "./test.js";
import { BACKEND, fetchWithAuth } from "../api.js";
import ErrorPage from "../pages/ErrorPage.js";
import { navigate } from "../utils/navigate.js";

/**
 * @param { HTMLElement } $container
 * @param { WebSocket } ws
 */
export default function Header($container, wsManager) {
    const render = () => {
        const header = $container.querySelector('#header');
        if (header) {
            header.innerHTML = `
                <div id="header-container">
                    <img src="../../assets/image/logo.png" alt="logo">
                    <div id="test-button-container"></div> <!-- 테스트 -->
                    <button id="logout-btn" class="non-outline-btn">
                        <span id="logout-icon"></span>
                    </button>
                </div>
            `;
            TestButton(header.querySelector('#test-button-container')); // 테스트
        }
    }

    const setupEventListener = () => {
        const logoutButton = $container.querySelector('#logout-btn');
        if (!logoutButton) return;
        logoutButton.addEventListener('click', () => {
            fetchWithAuth(`${BACKEND}/logout/`, { method: 'POST' })
                .then(data => {
                    console.log("[ logout ] 완료");
                    wsManager.ws.close();
                    const event = new CustomEvent('logout');
                    document.dispatchEvent(event);
                    navigate('/');
                })
                .catch(error => {
                    console.error("[ logout ] " + error.message);
                    new ErrorPage($container, error.status);
                });
        });
    }

    importCss("assets/css/header.css");
    render();
    setupEventListener();
}