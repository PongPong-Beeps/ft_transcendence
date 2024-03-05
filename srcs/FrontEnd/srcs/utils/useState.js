/**
 * @description 타입을 비교하는 함수
 * @returns { boolean }
 */
function deepEqual(a, b) {
    // 두 인자의 타입이 다르거나, 하나가 null이면 바로 false 반환
    if (typeof a !== typeof b || a === null || b === null) return a === b;
    // 기본 타입이거나 함수인 경우, 단순 비교
    if (typeof a !== "object" || typeof b !== "object") return a === b;
    // 배열인 경우, 길이와 각 요소 비교
    if (Array.isArray(a) && Array.isArray(b)) return compare(a, b);
    // 객체인 경우, 키의 개수와 각 키의 값을 비교
    if (isObject(a) && isObject(b)) return compare(Object.entries(a), Object.entries(b));
    // 타입이 매칭되지 않는 경우
    return false;
}

function isObject(obj) {
    return typeof obj === "object" && obj !== null;
}

function compare(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (Array.isArray(a[i]) && Array.isArray(b[i])) {
            if (!deepEqual(a[i][0], b[i][0]) || !deepEqual(a[i][1], b[i][1])) return false;
        } else if (!deepEqual(a[i], b[i])) {
            return false;
        }
    }
    return true;
}

/**
 * @description useState 훅 구현
 * @param { array | number | string | boolean | Object } initialState 초기값
 * @param { object } component 전달된 컴포넌트
 * @param { string } render 렌더링 함수 명
 * @returns [getState, setState] 반환
 */
export default function useState(initialState, component, render) {
    let state = cloneState(initialState);
    const getState = () => state;
    const setState = (newState) => {
        if (deepEqual(state, newState)) return;
        state = cloneState(newState);
        component[render]();
    };
    return [getState, setState];
}

function cloneState(state) {
    if (Array.isArray(state)) {
        return [...state]; // 배열의 모든 요소를 새 배열에 복사
    } else if (typeof state === 'object' && state !== null) {
        return { ...state }; // 객체의 모든 속성을 새 객체에 복사
    }
    return state;
}