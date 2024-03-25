import {importCss} from "../../utils/importCss.js";
import useState from "../../utils/useState.js";
import FriendCell from "../user-list/FriendCell.js";
import PlayerCell from "./PlayerCell.js";

export default function PlayerList($container) {

    const dummy = [
        { "nickname" : "player123" },
        { "nickname" : "player2" },
        { "nickname" : "player3" },
        { "nickname" : "player4" },
    ]
    let [getPlayerList, setPlayerList] = useState(dummy, this, 'renderPlayerList');

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