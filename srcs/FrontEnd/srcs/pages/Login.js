import {navigate} from "../utils/navigate.js";
import {importCss} from "../utils/importCss.js";

/**
 * @param {HTMLElement} $container
 */
export default function Login($container) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="login-container">
                    <img id="logo" src="../../assets/image/logo.png"  alt="logo" />
                    <button id="login-btn" class="green-btn non-outline-btn">42 계정으로 로그인</button>
                </div>
            `;
            page.style.display = 'block';
        }
    }

    const setupEventListener = () => {
        $container.querySelector('#login-btn').addEventListener('click', () => {
		   window.location.href = `https://127.0.0.1/api/login/42`;
        });
    }

    importCss("assets/css/login.css");
    render();
    setupEventListener();
}
