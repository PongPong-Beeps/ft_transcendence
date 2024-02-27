import {navigate} from "../utils/navigate.js";

/**
 * @param {HTMLElement} $container
 */
export default function Auth($container) {
    const render = () => {
        $container.querySelector('#page').innerHTML = `
            <link rel="stylesheet" href="../../assets/css/auth.css">
            <div id="auth-container">
                <div class="spinner-border text-light" style="width: 3em; height: 3em;" role="status">
                </div>
            </div>
        `;
    }

    const sendAuthorizationCode = () => {
        // authorization_code 추출
        const urlParams = new URLSearchParams(window.location.search);
        const authorization_code = urlParams.get('code');
        console.log(authorization_code)
        // 백엔드로 전송
        fetch('https://127.0.0.1/api/login/42/callback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: authorization_code }),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                navigate('lobby')
            })
            .catch((error) => console.error('Error:', error));
    }

    render();
    sendAuthorizationCode();
}