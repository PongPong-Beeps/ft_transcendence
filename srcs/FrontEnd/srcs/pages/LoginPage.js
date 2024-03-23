import {navigate} from "../utils/navigate.js";
import {importCss} from "../utils/importCss.js";
import getCookie from "../utils/cookie.js";
import {BACKEND, fetchWithAuth} from "../api.js";
import { WebSocketManager } from "../utils/webSocketManager.js";
import ErrorPage from "./ErrorPage.js";

/**
 * @param {HTMLElement} $container
 */
export default function LoginPage($container) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="login-container">
                    <img id="logo" src="../../assets/image/logo.png"  alt="logo" />
                    <button id="login-btn" class="green-btn non-outline-btn">42 계정으로 로그인</button>
                    <button id="google-login-btn" class="non-outline-btn">
                        <img src="../../assets/image/web_neutral_sq_SI@2x.png" alt="google" />
                    </button>
                    <button id="kakao-login-btn" class="social-login-btn non-outline-btn">
                        <img src="../../assets/image/kakao_login_large_narrow.png" alt="kakao" />
                    </button>
                </div>
            `;
            page.style.display = 'block';
        }
    }

    const handleAccessToken = () => {
        if (getCookie("access_token")) {
            fetchWithAuth(`${BACKEND}`)
                .then(data => {
                    const ws = new WebSocket(`wss://127.0.0.1/ws/connect/?token=${getCookie('access_token')}`);
                    const wsManager = new WebSocketManager(ws);
                    ws.onopen = function(event) {
                        console.log("웹 소켓 생성 완료");
                        navigate('lobby', wsManager);
                    }
                    ws.onclose = function(event) {
                        console.log("웹 소켓 닫아용");
                    }
                    wsManager.addMessageHandler(function(data) {
                        if (data.status === 4003)
                            new ErrorPage($container, 4003);
                    });
                });
            return;
        }
    };

    const setupEventListener = () => {
        const loginButtons = {
          '#login-btn': '42',
          '#google-login-btn': 'google',
          '#kakao-login-btn': 'kakao'
        };
        const handleLogin = (endpoint) => {
          localStorage.setItem('provider', endpoint);
          window.location.href = `${BACKEND}/login/${endpoint}/`;
        };
      
        Object.entries(loginButtons).forEach(([selector, endpoint]) => {
          $container.querySelector(selector).addEventListener('click', () => handleLogin(endpoint));
        });
      };

    importCss("assets/css/login.css");
    handleAccessToken();
    render();
    setupEventListener();
}
