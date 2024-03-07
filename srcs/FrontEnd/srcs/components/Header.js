import {importCss} from "../utils/importCss.js";
import TestButton from "./test.js";
import {BACKEND, fetchWithAuth} from "../api.js";
import ErrorPage from "../pages/ErrorPage.js";
import {navigate} from "../utils/navigate.js";

export default function Header($container) {
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
        $container.querySelector('#logout-btn').addEventListener('click', () => {
           fetchWithAuth(`${BACKEND}/logout/`, { method: 'POST' })
               .then(data => {
                   console.log("[ logout ] 완료");
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