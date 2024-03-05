import {importCss} from "../utils/importCss.js";
import {navigate} from "../utils/navigate.js";

/**
 * @param { HTMLElement } $container
 * @param { number } errorCode
 */
export default function Error($container, errorCode = 0) {
    let errorMessage = ""

    const init = () => {
        switch (errorCode) {
            case 400:
                errorMessage = "잘못된 요청입니다";
                break;
            case 401:
                errorMessage = "권한이 없습니다";
                break;
            case 500:
                errorMessage = "서버 오류 (ㅠ ㅠ)";
                break;
            default:
                errorMessage = "알 수 없는 오류입니다";
                break;
        }
    }

    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="error-container">
                    <div id="home">
                        <img id="error_face" src="../../assets/image/error_face.png"  alt="error_face" />
                    </div>
                    <div id="error_message">${errorMessage}</div>
                </div>
            `;
            page.style.display = 'block';
        }
    }

    const setupEventListener = () => {
        $container.querySelector('#home').addEventListener('click', () => {
            navigate('/');
        });
    }

    importCss("assets/css/error.css");
    init();
    render();
    setupEventListener();
}