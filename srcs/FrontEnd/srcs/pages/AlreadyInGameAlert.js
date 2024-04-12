import {importCss} from "../utils/importCss.js";

export default function AlreadyInGameAlert($container) {
    let audio_button = new Audio("../../assets/sound/button.mp3");

    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="alert-background">
                    <div id="alert-container">
                    <div id="alert-title">이미 게임중인 유저입니다.</div>
                    <div id="alert-button-container">
                        <button class="green-btn" id="already-invite-ok-btn">확인</button>
                    </div>
                    </div>
                </div>
            `;
            page.style.display = 'block';
        }
    };

    const setupEventListener = () => {
        $container.querySelector('#already-invite-ok-btn').addEventListener('click', () => {
            audio_button.play();
            $container.querySelector('#page').style.display = 'none';
        });
    };

    importCss("assets/css/alert.css");
    render();
    setupEventListener();
}