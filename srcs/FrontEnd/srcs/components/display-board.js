import {importCss} from "../utils/import-css.js";

/**
 * @param {HTMLElement} $container
 */
export default function DisplayBoard($container) {
    const render = () => {
        let neonMessage = '겁나길게 한번 써보겠습니다. 이것보다 더 더 더 더 덛 더 덜 더더더ㅓ더 길면요얼마나 길어야 할까요 한줄로 길려면?'
        $container.querySelector("#footer").innerHTML = `
            <div id="DisplayBoard">
                <div class="neon-text">
                    ${neonMessage}
                </div>
            </div>
        `;
        adjustFontSize();
    };

    const adjustFontSize = () => {
        const neonText = $container.querySelector('.neon-text');
        const containerWidth = $container.offsetWidth - 40; // 왼쪽과 오른쪽에 각각 20픽셀의 패딩을 고려합니다.
        const textWidth = neonText.scrollWidth;
        
        // 컨테이너 너비와 텍스트 너비에 따라 스케일 계수를 계산
        const scaleFactor = containerWidth / textWidth;
        
        // 최소 글꼴 크기를 정의
        const minimumFontSize = 30; // 픽셀 단위로
        
        // 반응형으로 글꼴 크기를 조절하기 위해 Bootstrap 클래스를 적용
        if (scaleFactor < 1 || textWidth > containerWidth) {
            const newFontSize = Math.max(minimumFontSize, neonText.style.fontSize.slice(0, -2) * scaleFactor) + 'px';
            neonText.style.fontSize = newFontSize;
        } else {
            neonText.style.fontSize = ''; // 크기를 축소할 필요가 없는 경우 글꼴 크기를 재설정
        }
    };

    importCss("../../../assets/css/display-board.css");
    render();
}


// 통신 예시. 서버에서 메시지 가져오기
// /**
//  * @param {HTMLElement} $container
//  */
// export default function DisplayBoard($container) {
//     const fetchMessage = async () => {
//         try {
//             const response = await fetch('URL_TO_YOUR_SERVER_ENDPOINT'); // 서버에서 메시지 가져오기
//             const data = await response.json();
//             return data.message;
//         } catch (error) {
//             console.error('Error fetching message:', error);
//             return null; // 에러 발생 시 null 반환
//         }
//     };

//     const render = async () => {
//         const message = await fetchMessage(); // 서버에서 메시지 가져오기
//         const displayMessage = message || "메시지가 여기 표시됩니다"; // 서버에서 받은 메시지가 없으면 기본 메시지 사용
//         $container.querySelector("#footer").innerHTML = `
//             <link rel="stylesheet" href="../../../assets/css/display-board.css">
//             <div id="DisplayBoard">
//                 <div class="neon-text">
//                     ${displayMessage}
//                 </div>
//             </div>
//         `;
//     };

//     render(); // 초기 렌더링
// }