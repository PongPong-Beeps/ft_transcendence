import {importCss} from "../utils/importCss.js";

export default function DuplicateInviteMessage($container) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="exit-confirmation-background">
                    <div id="exit-confirmation-container">
                    <div id="exit-confirmation-title">이미 이 방에 있는 유저입니다.</div>
                    <div id="exit-confirmation-button-container">
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

    importCss("assets/css/exit-confirmation.css");
    render();
    setupEventListener();
}