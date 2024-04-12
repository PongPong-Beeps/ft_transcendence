import {navigate} from "../utils/navigate.js";
import {importCss} from "../utils/importCss.js";
import getCookie from "../utils/cookie.js";
import {BACKEND, fetchWithAuth} from "../api.js";
import ErrorPage from "./ErrorPage.js";
import { WebSocketManager } from "../utils/webSocketManager.js";

/**
 * @param {HTMLElement} $container
 */
export default function AuthPage($container) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="auth-container">
                <div class="spinner-border text-light" style="width: 3em; height: 3em;" role="status">
                </div>
            </div>
            `;
            page.style.display = 'block';
        }
    }

    function sendAuthorizationCode() {
        // authorization_code 추출
        const provider = localStorage.getItem('provider');
        localStorage.clear();
        console.log("[ sendAuthorizationCode ] provider : ", provider);
        const urlParams = new URLSearchParams(window.location.search);
        const authorization_code = urlParams.get('code');

        // 백엔드로 전송
        fetch(`https://${BACKEND}/api/login/${provider}/callback/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie("csrftoken")
            },
            body: JSON.stringify({ code: authorization_code }),
        })
            .then(response => {
                if (!response.ok) {
                    new ErrorPage($container, response.status);
                } else {
                    console.log("[ sendAuthorizationCode ] 토큰 발급 성공");
                    const connWs = new WebSocket(`wss://${BACKEND}/ws/connect/?token=${getCookie('access_token')}`);
                    const connWsManager = new WebSocketManager(connWs);
                    connWs.onopen = function(event) {
                        console.log("웹 소켓 생성 완료");
                        navigate('lobby', connWsManager);
                    }
                    connWs.onclose = function(event) {
                        console.log("웹 소켓 닫아용");
                    }
                    connWsManager.addMessageHandler(function(data) {
                        if (data.status === 4003)
                        {
                            const event = new CustomEvent('duplicated-login');
                            document.dispatchEvent(event);
                            new ErrorPage($container, 4003);
                        }
                    });
                }
            })
            .catch(error => {
                console.error("[ sendAuthorizationCode ] ", error);
                localStorage.clear();
            });
    }

    importCss("assets/css/auth.css");
    render();
    sendAuthorizationCode();
}


