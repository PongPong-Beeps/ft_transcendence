import { BACKEND, fetchWithAuth } from "../api.js";
import { importCss } from "../utils/importCss.js";
import { navigate } from "../utils/navigate.js";
import getCookie from "../utils/cookie.js";
import { WebSocketManager } from "../utils/webSocketManager.js";

/**
 *@param { HTMLElement } $container
 *@param { string } sender
 *@param { string } receiver
 *@param { string } game_type
 *@param { string } game_mode
 *@param { string } sender_id
 *@param { string } receiver_id
*/
export default function InviteModal($container, sender, receiver, game_type, game_mode, sender_id, receiver_id, wsManager) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="invite-modal-background">
                    <div id="invite-modal-container">
                        <div id="invite-modal-title">초대장</div>
                        <div id="invite-modal-content-container">
                        <div id="invite-info-container"></div>
                            <div id=invite-game-info-container>
                                <div id="invite-message">${sender}님으로부터 게임 초대가 왔습니다.</div>
                                <div id="invite-game-info-box-container">
                                    <div class="invite-game-info-box-img">게임종류
                                        <img src="../../assets/image/${game_type}.png" alt="game-type">
                                    </div>
                                    <div class="invite-game-info-box-img">난이도
                                        <img src="../../assets/image/${game_mode}.png" alt="game-mode">
                                    </div>
                                </div>
                                <div id="invite-message">게임에 참가하시겠습니까?</div>
                            </div>
                        </div>
                    <div id="invite-modal-button-container">
                        <button class="green-btn" id="invite-modal-accept-btn">참가</button>
                        <button class="red-btn" id="invite-modal-refuse-btn">거절</button>
                    </div>
                </div>
            `;
            page.style.display = 'block';
        }
    };

    const setupEventListener = () => {
        $container.querySelector('#invite-modal-refuse-btn').addEventListener('click', () => {
            fetchWithAuth(`${BACKEND}/connect/invite/refuse/`, {
                method: 'POST',
                body: JSON.stringify({
                    sender: sender_id,
                    receiver: receiver_id,
                })
            })
            .then(response => {
                if (response) {
                    console.log("invite refused");
                }
                $container.querySelector('#page').style.display = 'none';
            })
            .catch(error => console.error("[ inviteModal ] " + error.message));
        }); 

        $container.querySelector('#invite-modal-accept-btn').addEventListener('click', () => {
            $container.querySelector('#page').style.display = 'none';
            const ws = new WebSocket(`wss://127.0.0.1/ws/game/?token=${getCookie('access_token')}&category=invite`);
            ws.onopen = function(event) {
                console.log("초대 모달에서 게임 웹 소켓 생성 완료");
                const data = {"gameWsManager" : new WebSocketManager(ws), "connWsManager": wsManager};
                navigate('game-room', data);
            };
            $container.querySelector('#page').style.display = 'none';
        });
    };

    importCss("assets/css/invite-modal.css");
    render();
    setupEventListener();
}