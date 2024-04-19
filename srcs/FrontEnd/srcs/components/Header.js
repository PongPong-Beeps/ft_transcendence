import { importCss } from "../utils/importCss.js";
import { BACKEND, fetchWithAuth } from "../api.js";
import ErrorPage from "../pages/ErrorPage.js";
import { navigate } from "../utils/navigate.js";
import getDevelopersPage from "../pages/developersPage.js";
import getPatchNotePage from "../pages/PatchNote.js";
import hasUndefinedArgs from "../utils/hasUndefinedArgs.js";
import getNoticePage from "../pages/NoticePage.js";
/**
 * @param { HTMLElement } $container
 * @param { WebSocketManager } connWsManager
 */
export default function Header($container, connWsManager) {
    if (hasUndefinedArgs($container, connWsManager))
    {
        console.error(connWsManager, " [ Header ] args are not defined");
        return;
    }
    const render = () => {
        const header = $container.querySelector('#header');
        if (header) {
            header.innerHTML = `
                <div id="header-container">
                    <img src="../../assets/image/logo.png" alt="logo">
                    <div id="header-button-container">
                        <button id="version-btn" class="non-outline-btn">
                            <span id="version">v2.0.0</span>
                        </button>
                        <button id="bug-report-btn" class="non-outline-btn">
                            <span id="bug-report-icon"></span>
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
            `;
        }
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
        const versionBtn = $container.querySelector('#version-btn');
        if (versionBtn) {
            versionBtn.addEventListener('click', () => {
                new getPatchNotePage($container);
            });
        }
        const bugReportBtn = $container.querySelector('#bug-report-btn');
        if (bugReportBtn) {
            bugReportBtn.addEventListener('click', async (event) => {
                const bugReportMsg = prompt("발생한 버그의 내용을 작성해주세요.");
                if (bugReportMsg) {
                    try {
                        await fetchWithAuth(`https://${BACKEND}/api/bug_report/`, {
                            method: 'POST',
                            body: JSON.stringify({ "content": bugReportMsg }),
                        });
                        alert("성공적으로 버그 내용을 제출하였습니다.");
                    } catch (error) {
                        console.error("[ bug report ] " + error.message);
                        alert(`버그 내용 제출에 실패하였습니다. 에러: ${error.message}`);
                    }
                }
            });
        }

        const noticeBtn = $container.querySelector('#help-btn');
        if (noticeBtn) {
            noticeBtn.addEventListener('click', async (event) => {
                connWsManager.sendMessage({ "type": "check_admin" });
            });
        }

    }

    connWsManager.addMessageHandler(function (response) {
        if ( response.type === 'check_admin' && response.status === 2000) {
            const content = prompt("공지할 내용을 입력해주세요");
            if (content) {
                let msgObject = { "type": "notice", "content": content };
                if (content === "stop")
                    msgObject = { "type": "notice", "content": "" };
                connWsManager.sendMessage(msgObject);
            }
            else
                return;
        } else if (response.status === 4000) {
            // status가 4000일 때의 처리를 여기에 작성하세요.
            console.log("관리자가 아닙니다.");
        }
    });

    connWsManager.addMessageHandler(function (noticeData) {
        if (noticeData.type === "notice") {
            // alert(noticeData.content);
            console.log("notice hadnler ", noticeData.content);
            new getNoticePage($container, noticeData.content);
        }
    });
    
    importCss("assets/css/header.css");
    render();
    setupEventListener();
}