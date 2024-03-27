/**
 * @param {HTMLElement} $container
 */

import VsScheduleUserCard from "./VsScheduleUserCard.js";
import {importCss} from "../../utils/importCss.js";
import hasUndefinedArgs from "../../utils/hasUndefinedArgs.js";

export default function VsSchedule($container, roundData) {
    if (hasUndefinedArgs($container, roundData))
        return;
    const createPlayerCard = (player) => VsScheduleUserCard(player.nickname, `data:image/png;base64,${player.image}`);
    const createVsText = (index, round) => index < round.length - 1 ? '<div class="vs-text">vs</div>' : '';
    const createRound = (round) => round.map((player, index) => `${createPlayerCard(player)}${createVsText(index, round)}`).join('');
    const createRounds = (roundData) => roundData.filter(Array.isArray).map((round, index) => `<div class="round"><div class="round-number">Round ${index + 1}</div>${createRound(round)}</div>`).join('');
    const render = () => {
        const page = $container.querySelector("#page");
        if (page) {
            page.innerHTML = `<div id="VsSchedule" class="vs-screen">${createRounds(roundData || [])}</div>`;
            page.style.display = 'block';

            const cardCount = page.querySelectorAll('.card').length;
            const rootStyle = document.documentElement.style;

            if (cardCount <= 2) {
                rootStyle.setProperty('--card-height', '40vw');
                rootStyle.setProperty('--card-font-size', '2vw');
            } else {
                rootStyle.setProperty('--card-height', '20vw');
                rootStyle.setProperty('--card-font-size', '1vw');
            }
        }
    };

    importCss("assets/css/vs-schedule.css");
    render();
}