import {importCss} from "../utils/import-css.js";

export default function Header($container) {
    const render = () => {
        const header = $container.querySelector('#header');
        if (header) {
            header.innerHTML = `
                <div id="header-container">
                    <img src="../../assets/image/logo.png" alt="logo">
                    <button id="logout-btn" class="non-outline-btn">
                        <span id="logout-icon"></span>
                    </button>
                </div>
            `;
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