import {navigate} from "../utils/navigate.js";
import {importCss} from "../utils/importCss.js";
import getCookie from "../utils/cookie.js";
import {BACKEND, fetchWithAuth} from "../api.js";
import ErrorPage from "./ErrorPage.js";

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
        console.log("[ sendAuthorizationCode ] 인증 코드 추출 : ", authorization_code);

        // 백엔드로 전송
        fetch(`${BACKEND}/login/${provider}/callback/`, {
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
                    let ws = new WebSocket(`wss://127.0.0.1/ws/connect/?token=${getCookie('access_token')}`);
                    ws.onopen = function(event) {
                        console.log("웹 소켓 생성 완료");
                        navigate('lobby', ws);
                    }
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


