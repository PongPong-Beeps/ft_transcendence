import {navigate} from "../../utils/navigate.js";
import Header from "../header.js";

export default function TournamentResultPage($container) {

    const render = () => {
        $container.innerHTML = `
             <div class="grid-container">
                <div class="header">${Header()}</div>
                <div class="menu1">Menu1</div>
                <div class="menu2">Menu2</div>
                <div class="main">TournamentResultPage</div>
                <div class="footer">Footer</div>
            </div>
        `;
    }

    render();
}