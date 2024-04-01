import {importCss} from "../utils/importCss.js";

export default function DuplicateInviteAlert($container) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="alert-background">
                    <div id="alert-container">
                    <div id="alert-title">이미 이 방에 있는 유저입니다.</div>
                    <div id="alert-button-container">
                        <button class="green-btn" id="duplicate-invite-ok-btn">확인</button>
                    </div>
                    </div>
                </div>
            `;
            page.style.display = 'block';
        }
    };

    const setupEventListener = () => {
        $container.querySelector('#duplicate-invite-ok-btn').addEventListener('click', () => {
            $container.querySelector('#page').style.display = 'none';
        });
    };

    importCss("assets/css/alert.css");
    render();
    setupEventListener();
}