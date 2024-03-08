import getCookie from "../utils/cookie.js";

export default function TestButton($container) {
    const button = document.createElement('button');
    button.id = 'back-test-btn';
    button.textContent = '테스트';
    $container.appendChild(button);

    button.addEventListener('click', () => {
        alert('테스트 버튼이 클릭되었습니다!');

        fetch('https://127.0.0.1/api/user/dummy/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getCookie("access_token")}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie("csrftoken")
            },
            // body: JSON.stringify({
            //     // 요청 본문 내용을 여기에 작성합니다.
            // })
        })
            .then(response => {
                // 401 응답을 확인합니다.
                if (response.status === 401) {
                    // 401 응답일 경우, refresh 토큰을 사용하여 access 토큰을 새로 요청합니다.
                    return fetch('https://127.0.0.1/api/token/refresh/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie("csrftoken")
                        },
                        body: JSON.stringify({
                            'refresh': getCookie("refresh_token") // 쿠키 또는 다른 저장소에서 refresh 토큰을 가져옵니다.
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            // 새로운 access 토큰과 refresh 토큰을 받아 처리합니다.
                            console.log('New tokens:', data);
                            return data; // 새 토큰으로 다시 원래 요청을 시도할 수도 있습니다.
                        });
                } else {
                    // 401이 아닌 다른 응답은 정상적으로 처리합니다.
                    return response.json();
                }
            })
            .then(data => console.log(data))
            .catch((error) => {
                console.error('Error:', error);
            });
    });
}