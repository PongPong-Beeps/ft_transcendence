import hasUndefinedArgs from "../utils/hasUndefinedArgs.js";
import { importCss } from "../utils/importCss.js";
import { navigate } from "../utils/navigate.js";

export default function GameWinner($container, gameData, connWsManager) {
    if (hasUndefinedArgs($container, gameData, connWsManager))
        return;
    const image = 'data:image/jpeg;base64,' + gameData.winner.image;
    const nickname = gameData.winner.nickname;
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
            <div id = "game-winner-background">
                <div id="game-winner-container">
                    <div id="game-winner-title">최고의 플레이</div>
                    <div id="game-winner-img">
                        <img id="player-img" src=${image}  alt="error_face" />
                    </div>
                    <div id="player_nickname">${nickname}</div>
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
                navigate('lobby', connWsManager);
                $container.querySelector('#page').style.display = 'none';
            });
        }
    }

    importCss("assets/css/game-winner.css");
    render();
    setupEventListener();
}