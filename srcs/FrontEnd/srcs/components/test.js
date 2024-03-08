import getCookie from "../utils/cookie.js";

export default function TestButton($container) {
    const button = document.createElement('button');
    button.id = 'back-test-btn';
    button.textContent = '더미';
    $container.appendChild(button);

    button.addEventListener('click', () => {
        alert('테스트버튼 클릭');

		// WebSocket 연결 시작
        var ws = new WebSocket("wss://127.0.0.1/ws/chat/");
        ws.onmessage = function(event) {
            var data = JSON.parse(event.data);
            console.log(data);
        };
        ws.onopen = function(event) {
            ws.send(JSON.stringify({message: "Hello, server!"}));
        };
        
    });
}
