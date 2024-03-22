import { importCss } from "../utils/importCss.js";
import { BACKEND, fetchWithAuth } from "../api.js";

/**
 * @param {HTMLElement} $container
 */
export default function Chat($container, wsManager) {
    let myId = '';
    let currentType, currentReceiver;

    fetchWithAuth(`${BACKEND}/user/me`)
        .then(data => {
            myId = data.id;
        })
        .catch(error => {
            console.error("[ fetchMyNickname ] " + error.message);
            new ErrorPage($container, error.status);
        });

    wsManager.addMessageHandler(function (data) {
        if (data.message && (data.receiver || data.sender)) {
            const chatType = getChatType(data);
            const senderOrReceiver = data.sender || data.receiver;
            const messageElement = createMessageElement(chatType, senderOrReceiver, data.message);
            appendMessageToChat(messageElement);
        }
    });

    function getChatType(data) {
        if (data.type === "all_chat") {
            return "전체";
        } else if (data.type === "dm_chat") {
            return data.receiver ? "To" : "From";
        }
        return "";
    }

    function createMessageElement(chatType, senderOrReceiver, message) {
        const messageElement = document.createElement('p');
        const chatTypeElement = document.createElement('span');
        chatTypeElement.textContent = `[${chatType}]`;
        chatTypeElement.style.color = chatType === "전체" ? '#D3E95A' : '#372073';
        messageElement.appendChild(chatTypeElement);
        messageElement.appendChild(document.createTextNode(` ${senderOrReceiver}: ${message}`));
        return messageElement;
    }

    function appendMessageToChat(messageElement) {
        const chatMessages = document.querySelector('#chat-messages');
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    const sendMessage = (message, type = "all_chat", receiver = null) => {
        let msgObject = { "type": type, "sender": myId, "message": message };
        if (type === "dm_chat") {
            msgObject.receiver = receiver;
        }
        console.log("sendMessage : ", msgObject);
        wsManager.sendMessage(msgObject);
        console.log("Message sent");
    };

    const render = () => {
        $container.querySelector("#footer").innerHTML = `
            <div id="Chat">
                <div class="container">
                    <div class="chat-box">
                        <div id="chat-messages"></div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <button id="chat-toggle-button" class="btn btn-outline-secondary" type="button">전체채팅</button>
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

        const focusToMessageInput = () => {
            const messageInput = document.querySelector('#message-input');
            if (messageInput) {
                messageInput.focus();
            }
        }

        const chatToggleButton = document.querySelector('#chat-toggle-button');
        chatToggleButton.addEventListener('click', () => {
            if (currentType === "dm_chat") {
                currentType = undefined;
                currentReceiver = undefined;
                chatToggleButton.textContent = "전체채팅";
                console.log("chatToggleButton clicked");
                focusToMessageInput();
            }
        });

        const sendButton = document.querySelector('#send-button');
        const messageInput = document.querySelector('#message-input');

        const handleSendMessage = () => {
            const message = messageInput.value;
            if (!message.trim())
                return;
            sendMessage(message, currentType, currentReceiver);
            messageInput.value = '';
        };

        sendButton.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleSendMessage();
            }
        });
        document.addEventListener('dmMessage', (event) => {
            const { type, receiver, nickname } = event.detail;
            currentType = type;
            chatToggleButton.textContent = `TO ${nickname}`;
            currentReceiver = receiver;
            console.log("dmMessage data: ", type, receiver, nickname);
            if (event.detail.focusInput) {
                focusToMessageInput();
            }
        });
    };

    importCss("assets/css/chat.css");
    render();
}