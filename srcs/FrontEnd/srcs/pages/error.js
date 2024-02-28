import {importCss} from "../utils/import-css.js";
import {navigate} from "../utils/navigate.js";

/**
 * @param { HTMLElement } $container
 * @param { number } errorCode
 */
export default function Error($container, errorCode) {
    let errorMessage = ""

    const init = () => {
        switch (errorCode) {
            case 401:
                errorMessage = "권한이 없습니다";
                break;
            case 404:
                errorMessage = "페이지를 찾을 수 없습니다";
                break;
            case 500:
                errorMessage = "서버 오류 (ㅠ ㅠ)";
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