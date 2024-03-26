import {importCss} from "../../utils/importCss.js";
import useState from "../../utils/useState.js";
import PlayerCell from "./PlayerCell.js";

export default function PlayerList($container, data) {

    const initPlayerList = () => {
        let players = [];

        data.round_data.forEach(round => {
            if (round) {
                round.forEach(player => {
                    players.push(player);
                })
            }
        });

        return players;
    };

    let [getPlayerList, setPlayerList] = useState(initPlayerList(), this, 'renderPlayerList');

    const render = () => {
        const menu = $container.querySelector('#menu');
        if (!menu) return;
        menu.innerHTML = `
            <div id="player-list-container">
            </div>
        `;
        this.renderPlayerList(); // 임시
    }

    this.renderPlayerList = () => {
        const playerListContainer = $container.querySelector('#player-list-container');
        if (!playerListContainer) return;
        playerListContainer.innerHTML = getPlayerList()
            .map(player => PlayerCell(player))
            .join('');
    }

    importCss("assets/css/player-list.css");
    render();
}