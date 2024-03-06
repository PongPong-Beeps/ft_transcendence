import {importCss} from "../utils/importCss.js";
import TestButton from "./test.js";

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
           console.log("logout");
        });
    }

    importCss("assets/css/header.css");
    render();
    setupEventListener();
}