// GameSettings.js
import { navigate } from "../../utils/navigate.js";
import GameSettingsOption from "./game-settings-option.js";

export default function GameSettings($container) {
    const modeOptions = [
        { label: 'vs', image: '../../../assets/image/vs.png' },
        { label: 'tournament', image: '../../../assets/image/tournament.png' }
    ];

    const difficultyOptions = [
        { label: 'easy', image: '../../../assets/image/easy.png' },
        { label: 'hard', image: '../../../assets/image/hard.png' }
    ];

    const render = () => {
        $container.querySelector('#main').innerHTML = `
            <link rel="stylesheet" href="../../../assets/css/game-settings.css">
            <div id="game-settings-container">
                <div id="game-settings-title">게임 설정</div>
                <div id="game-settings-option-container">
                    ${GameSettingsOption("모드", modeOptions, "mode")}
                    ${GameSettingsOption("난이도", difficultyOptions, "difficulty")}
                </div>
                <div id="game-settings-button-container">
                    <button class="game-settings-button green-btn non-outline-btn">방 만들기</button>
                    <button class="game-settings-button red-btn non-outline-btn">빠른 시작</button>
                </div>
            </div>
        `;
    };

    const setupEventListener = () => {
        $container.querySelector('#game-settings-option-container').addEventListener('click', (event) => {
            const target = event.target.closest('.game-settings-option-item');
            if (!target) return;

            const isSelected = target.getAttribute('data-selected') === 'true';
            const category = target.getAttribute('data-category');

            // 같은 카테고리 내의 다른 아이템들의 선택 상태를 해제
            const sameCategoryItems = $container.querySelectorAll(`.game-settings-option-item[data-category="${category}"]`);
            sameCategoryItems.forEach(item => {
                item.setAttribute('data-selected', 'false');
                item.classList.remove('selected');
            });

            // 현재 아이템의 선택 상태를 업데이트
            target.setAttribute('data-selected', String(!isSelected));
            target.classList.toggle('selected', !isSelected);
        });

        $container.querySelectorAll('.game-settings-button').forEach(button => {
            button.addEventListener('click', () => {
                const selectedOptions = $container.querySelectorAll('.game-settings-option-item[data-selected="true"]');
                if (selectedOptions.length < 2) {
                    alert("모든 옵션을 정상적으로 선택해야 합니다 !") // alert보다 UI 내에 안내 문구로 넣는 게 더 좋을 것 같다
                    return;
                }

                const selectedMode = [...selectedOptions].find(option => option.dataset.category === "mode");
                const selectedDifficulty = [...selectedOptions].find(option => option.dataset.category === "difficulty");
                navigate(`${selectedMode.dataset.label}-room`, selectedDifficulty.dataset.label);
            });
        });
    };

    render();
    setupEventListener();
}
