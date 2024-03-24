// GameSettings.js
import { navigate } from "../../utils/navigate.js";
import GameSettingsOption from "./GameSettingsOption.js";
import {importCss} from "../../utils/importCss.js";
import {WebSocketManager} from "../../utils/webSocketManager.js";
import getCookie from "../../utils/cookie.js";

/**
 * @param { HTMLElement } $container
 * @param { WebSocketManager } wsManager
 */
export default function GameSettings($container, wsManager) {
    const typeOption = [
        { label: 'one_to_one', image: '../../../assets/image/one_to_one.png' },
        { label: 'tournament', image: '../../../assets/image/tournament.png' }
    ];

    const modeOption = [
        { label: 'easy', image: '../../../assets/image/easy.png' },
        { label: 'hard', image: '../../../assets/image/hard.png' }
    ];

    const render = () => {
        $container.querySelector('#main').innerHTML = `
            <div id="game-settings-container">
                <div id="game-settings-title-container">
                    <div id="game-settings-title">게임 설정</div>
                    <div id="game-settings-warning-message">모든 옵션을 정상적으로 선택하세요 !</div>
                    <button id="practice-btn" class="green-btn non-outline-btn">연습 게임</button>
                </div>
                <div id="game-settings-option-container">
                    ${GameSettingsOption("type", typeOption)}
                    ${GameSettingsOption("mode", modeOption)}
                </div>
                <div id="game-settings-button-container">
                    <button id="create-room-btn" data-label="create_room" class="game-settings-button green-btn non-outline-btn">방 만들기</button>
                    <button id="quick-start-btn" data-label="quick_start" class="game-settings-button red-btn non-outline-btn">빠른 시작</button>
                </div>
            </div>
        `;
    };

    const setupEventListener = () => {
        $container.querySelector('#practice-btn').addEventListener('click', () => {
           navigate('practice');
        });

        $container.querySelector('#game-settings-option-container').addEventListener('click', (event) => {
            const target = event.target.closest('.game-settings-option-item');
            if (!target) return;

            const isSelected = target.getAttribute('data-selected') === 'true';
            const option = target.getAttribute('data-option');

            // 같은 카테고리 내의 다른 아이템들의 선택 상태를 해제
            const sameCategoryItems = $container.querySelectorAll(`.game-settings-option-item[data-option="${option}"]`);
            sameCategoryItems.forEach(item => {
                item.setAttribute('data-selected', 'false');
                item.classList.remove('selected');
            });

            // 현재 아이템의 선택 상태를 업데이트
            target.setAttribute('data-selected', String(!isSelected));
            target.classList.toggle('selected', !isSelected);
        });

        $container.querySelector('#game-settings-button-container').addEventListener('click', (event) => {
            const target = event.target.closest('.game-settings-button');
            if (!target) return;
            // 모든 옵션이 선택되었는지 확인
            const selectedOptions = $container.querySelectorAll('.game-settings-option-item[data-selected="true"]');
            if (selectedOptions.length < 2) {
                $container.querySelector('#game-settings-warning-message').style.display = 'block';
                return;
            }

            const category = target.dataset.label
            const type = [...selectedOptions].find(option => option.dataset.option === "type").dataset.label;
            const mode = [...selectedOptions].find(option => option.dataset.option === "mode").dataset.label;
            // 웹 소켓 생성
            const ws = new WebSocket(`wss://127.0.0.1/ws/game/?token=${getCookie('access_token')}&category=${category}&type=${type}&mode=${mode}`);
            ws.onopen = function(event) {
                console.log("게임 웹 소켓 생성 완료");
                const data = {"gameWsManager" : new WebSocketManager(ws), "connWsManager": wsManager};
                navigate('game-room', data);
            }
            ws.onclose = function(event) {
                console.log("게임 웹 소켓 닫힘");
            }
        });
    };

    const init = () => {
        $container.querySelectorAll('.invite-btn').forEach(button => {
            button.style.display = 'none';
        });
    }

    importCss("assets/css/game-settings.css");
    init();
    render();
    setupEventListener();
}
