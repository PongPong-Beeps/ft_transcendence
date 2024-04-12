import hasUndefinedArgs from "../utils/hasUndefinedArgs.js";
import { importCss } from "../utils/importCss.js";
import { navigate } from "../utils/navigate.js";
import fadeOutAudio from "../utils/audio.js";

export default function GameWinner($container, gameData, wsManagers) {
    if (hasUndefinedArgs($container, gameData, wsManagers))
        return;

    let audio_button = new Audio("../../assets/sound/button.mp3");
    let bgm_win = new Audio("../../../assets/sound/bgm_win.mp3");
    const image = 'data:image/jpeg;base64,' + gameData.winner.image;
    const nickname = gameData.winner.nickname;
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
            <div id = "game-winner-background">
                <div id="game-winner-container">
                    <div id="game-winner-title">최고의 플레이어</div>
                    <div id="game-winner-img">
                        <img id="player-img" src=${image}  alt="error_face" />
                    </div>
                    <div id="player-nickname">${nickname}</div>
                    <div id="move-message">로비로 이동합니다</div>
                    <div id="move-button-container">
                        <button class="green-btn" id="move-button">확인</button>
                    </div>
                </div>
            </div>
            `;
            page.style.display = 'block';
        }
    }

    const setupEventListener = () => {
        const moveButton = $container.querySelector('#move-button');
        if (moveButton) {
            moveButton.addEventListener('click', () => {
                audio_button.play();
                fadeOutAudio(bgm_win, 1000);
                wsManagers.gameWsManager.ws.close();
                navigate('lobby', wsManagers.connWsManager);
                $container.querySelector('#page').style.display = 'none';
                const confettiElements = document.querySelectorAll('.confetti');
                confettiElements.forEach(confetti => confetti.remove());
            });
        }
    }

    const createConfetti = () => {
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.top = -(Math.random() * 20) + '%'; // 화면 상단 밖에서 생성
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.zIndex = 9999;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            document.body.appendChild(confetti);
        }
    }

    bgm_win.volume = 0.5;
    bgm_win.play();
    importCss("assets/css/game-winner.css");
    render();
    setupEventListener();
    createConfetti();
}