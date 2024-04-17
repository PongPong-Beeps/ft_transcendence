import { importCss } from "../utils/importCss.js";
import { BACKEND, fetchWithAuth } from "../api.js";
import ErrorPage from "../pages/ErrorPage.js";
import { navigate } from "../utils/navigate.js";
import getDevelopersPage from "../pages/developersPage.js";

/**
 * @param { HTMLElement } $container
 * @param { WebSocketManager } connWsManager
 */
export default function Header($container, connWsManager) {
    const render = () => {
        const header = $container.querySelector('#header');
        if (header) {
            header.innerHTML = `
                <div id="header-container">
                    <img src="../../assets/image/logo.png" alt="logo">
                    <div id="header-button-container">
                        <button id="bug-report-btn" class="non-outline-btn">
                            <span id="bug-report-icon"></span>
                            버그리포팅
                        </button>
                        <button id="help-btn" class="non-outline-btn">
                            <span id="help-icon"></span>
                            <div id="guide-image"></div>
                        </button>
                        <button id="logout-btn" class="non-outline-btn">
                            <span id="logout-icon"></span>
                        </button>
                    </div>
                </div>
                <div id="bug-report-modal" class="modal">
                    <div class="modal-content">
                        <textarea id="bug-report-text" placeholder="버그 리포팅 내용을 입력하세요."></textarea>
                        <button id="bug-report-submit-btn">제출</button>
                    </div>
                </div>
            `;
        }
        
        const bugReportBtn = $container.querySelector('#bug-report-btn');
        const bugReportModal = $container.querySelector('#bug-report-modal');
        const bugReportText = $container.querySelector('#bug-report-text');
        const bugReportSubmitBtn = $container.querySelector('#bug-report-submit-btn');

        bugReportBtn.addEventListener('click', () => {
            bugReportModal.style.display = 'block';
        });

        bugReportSubmitBtn.addEventListener('click', () => {
            const report = bugReportText.value;
            if (report) {
                fetchWithAuth(`https://${BACKEND}/api/bug_report/`, {
                method: 'POST',
                body: JSON.stringify({ "content": report }),
                })
                bugReportModal.style.display = 'none';
                bugReportText.value = '';
            } else {
                alert('버그 리포팅 내용을 입력하세요.');
            }
        });
    }

    const setupEventListener = () => {
        const logoutButton = $container.querySelector('#logout-btn');
        if (!logoutButton) return;
        logoutButton.addEventListener('click', () => {
            fetchWithAuth(`https://${BACKEND}/api/logout/`, { method: 'POST' })
                .then(data => {
                    console.log("[ logout ] 완료");
                    connWsManager.ws.close();
                    const event = new CustomEvent('logout');
                    document.dispatchEvent(event);
                    document.dispatchEvent(new Event('pause-lobby-bgm'));
                    document.dispatchEvent(new Event('leave-game'));
                    navigate('/');
                })
                .catch(error => {
                    console.error("[ logout ] " + error.message);
                    new ErrorPage($container, error.status);
                });
        });
        const logoImage = $container.querySelector('#header-container img');
        if (logoImage) {
            logoImage.addEventListener('click', (event) => {
                const totalWidth = logoImage.offsetWidth;
                const clickPosition = event.offsetX;
                if (clickPosition > totalWidth * 0.9) {
                    new getDevelopersPage($container);
                }
            });
        }
    }

    importCss("assets/css/header.css");
    render();
    setupEventListener();
}