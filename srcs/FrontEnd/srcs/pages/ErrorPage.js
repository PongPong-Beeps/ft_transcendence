import {importCss} from "../utils/importCss.js";
import {navigate} from "../utils/navigate.js";

/**
 * @param { HTMLElement } $container
 * @param { number } errorCode
 */
export default function ErrorPage($container, errorCode = 0) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="error-container">
                    <div id="home">
                        <img id="error_face" src="../../assets/image/error_face.png"  alt="error_face" />
                    </div>
                    <div id="error_message">${getErrorMessage()}</div>
                </div>
            `;
            page.style.display = 'block';
        }
    }

    const getErrorMessage = () => {
        switch (errorCode) {
            case 400:
                return "잘못된 요청입니다";
            case 401:
                return "권한이 없습니다";
            case 500:
                return  "서버 오류 (ㅠ ㅠ)";
            default:
                return "알 수 없는 오류입니다";
        }
    }

    const setupEventListener = () => {
        const homeButton = $container.querySelector('#home');
        homeButton.addEventListener('click', () => {
            navigate('/');
        });
    }

    importCss("assets/css/error.css");
    render();
    setupEventListener();
}