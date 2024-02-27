import {navigate} from "../utils/navigate.js";
import {importCss} from "../utils/import-css.js";

/**
 * @param {HTMLElement} $container
 */
export default function Login($container) {
    const render = () => {
        $container.querySelector('#page').innerHTML = `
            <div id="login-container">
                <img id="logo" src="../../assets/image/logo.png"  alt="logo" />
                <button id="login-btn" class="green-btn non-outline-btn">42 계정으로 로그인</button>
            </div>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('#login-btn').addEventListener('click', () => {
           navigate('lobby');
           // window.location.href = ''; // 여기에 적어주세요
        });
    }

    importCss("../../assets/css/login.css");
    render();
    setupEventListener();
}