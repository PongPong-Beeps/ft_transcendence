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
                    <button class="game-settings-button green-button">방 만들기</button>
                    <button class="game-settings-button red-button">빠른 시작</button>
                </div>
            </div>
        `;
    };

    const setupEventListener = () => {
        $container.querySelectorAll('.game-settings-option-item').forEach(button => {
            button.addEventListener('click', () => {
                const isSelected = button.getAttribute('data-selected') === 'true';
                const category = button.getAttribute('data-category');

                // 같은 카테고리 내의 다른 아이템들의 선택 상태를 해제
                const sameCategoryItems = $container.querySelectorAll(`.game-settings-option-item[data-category="${category}"]`);
                sameCategoryItems.forEach(item => {
                    item.setAttribute('data-selected', 'false');
                    item.classList.remove('selected');
                });

                // 현재 아이템의 선택 상태를 업데이트
                button.setAttribute('data-selected', String(!isSelected));
                button.classList.toggle('selected', !isSelected);
            });
        });

        $container.querySelectorAll('.game-settings-button').forEach(button => {
            button.addEventListener('click', () => {
                const selectedOptions = $container.querySelectorAll('.game-settings-option-item[data-selected="true"]');
                if (selectedOptions.length < 2) {
                    alert("모든 옵션을 선택해야 합니다.");
                    return;
                }

                const selectedMode = [...selectedOptions].find(option => option.dataset.category === "mode")
                const selectedDifficulty = [...selectedOptions].find(option => option.dataset.category === "difficulty")

                navigate(selectedMode.dataset.label + "-room?difficulty=" + selectedDifficulty.dataset.label);
            });
        });
    }


    render();
    setupEventListener();
}
