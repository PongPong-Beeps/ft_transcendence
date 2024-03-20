import {importCss} from "../utils/importCss.js";
import getCookie from "../utils/cookie.js";
import useState from "../utils/useState.js";
import {BACKEND, fetchWithAuth} from "../api.js";
import { WebSocketManager } from "../utils/webSocketManager.js";

/**
 * @param {HTMLElement} $container
 */
export default function Chat($container, wsManager) {
    let myId = '';  

    fetchWithAuth(`${BACKEND}/user/me`)
    .then(data => {
        myId = data.id;
    })
    .catch(error => {
        console.error("[ fetchMyNickname ] " + error.message);
        new ErrorPage($container, error.status);
    });

    wsManager.addMessageHandler(function(data) {
        if (data.sender && data.message) {
            const chatMessages = document.querySelector('#chat-messages');
            const messageElement = document.createElement('p');
            messageElement.textContent = `${data.sender}: ${data.message}`;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });

    const sendMessage = (message) => {
        wsManager.sendMessage({ "type": "all_chat", "sender": myId, "message": message });
    };

    const render = () => {
        $container.querySelector("#footer").innerHTML = `
            <div id="Chat">
                <div class="container">
                    <div class="chat-box">
                        <div id="chat-messages"></div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">To</button>
                                <div class="dropdown-menu">
                                    <a class="dropdown-item" href="#">User 1</a>
                                    <a class="dropdown-item" href="#">User 2</a>
                                    <a class="dropdown-item" href="#">User 3</a>
                                </div>
                            </div>
                            <input type="text" id="message-input" class="form-control" placeholder="채팅 입력..">
                            <div class="input-group-append">
                                <button id="send-button" class="btn btn-outline-secondary" type="button">전송</button>     
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const sendButton = document.querySelector('#send-button');
        const messageInput = document.querySelector('#message-input');

        const handleSendMessage = () => {
            const message = messageInput.value;
            if (!message.trim())
                return;
            sendMessage(message);
            messageInput.value = '';
        };

        sendButton.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleSendMessage();
            }
        });
    };

    importCss("assets/css/chat.css");
    render();
}