import getCookie from "./utils/cookie.js";

export const BACKEND = 'pongpong-beeps.site';

async function refreshToken() {
    const refreshTokenResponse = await fetch(`https://${BACKEND}/api/token/refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie("csrftoken"),
        },
        body: JSON.stringify({'refresh': getCookie("refresh_token")}),
    });
    // 토큰 재발급 실패(리프레시 토큰도 만료) 시 재로그인 유도
    if (!refreshTokenResponse.ok) {
        const error = new Error("[ refreshToken ] 토큰 재발급 실패");
        error.status = 401;
        throw error;
    }

    console.log("[ refreshToken ] 토큰 재발급 완료");
}

export async function fetchWithAuth(url, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie("csrftoken"),
        'Authorization': `Bearer ${getCookie("access_token")}`,
    };

    let response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });
    // 토큰 만료 시 재발급 후 요청 재시도
    if (response.status === 401) {
        await refreshToken();
        response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
                'Authorization': `Bearer ${getCookie("access_token")}`,
            },
        });
    }
    // 요청 실패 시 상태 코드 설정 후 에러 던짐
    if (!response.ok) {
        const error = new Error(`'${url}' 요청 실패`);
        error.status = response.status;
        throw error;
    }

    return await response.json();
}

export async function fetchWithAuthFormData(url, options = {}) {
    const defaultHeaders = {
        'X-CSRFToken': getCookie("csrftoken"),
        'Authorization': `Bearer ${getCookie("access_token")}`,
    };

    let response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });
    // 토큰 만료 시 재발급 후 요청 재시도
    if (response.status === 401) {
        await refreshToken();
        response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
                'Authorization': `Bearer ${getCookie("access_token")}`,
            },
        });
    }
    // 요청 실패 시 상태 코드 설정 후 에러 던짐
    if (!response.ok) {
        const error = new Error(`'${url}' 요청 실패`);
        error.status = response.status;
        throw error;
    }

    return await response.json();
}

/*

[ 바디 없을 때 ]
fetchWithAuth('https://${BACKEND}/api/resource')
.then(data => {
    console.log('Data:', data);
})
.catch(error => {
    console.error('Error:', error);
});

[ 바디 있을 때 ]
const data = { key: 'value' };
fetchWithAuth('https://${BACKEND}/api/resource', {
    method: 'POST',
    body: JSON.stringify(data),
})
.then(data => {
    console.log('Success:', data);
})
.catch(error => {
    console.error('Error:', error);
});

 */