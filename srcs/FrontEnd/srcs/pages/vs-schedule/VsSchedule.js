/**
 * @param {HTMLElement} $container
 */

import VsScheduleUserCard from "./VsScheduleUserCard.js";
import {importCss} from "../../utils/importCss.js";

export default function VsSchedule($container) {
    let profileImg = [
        { label: 'profile-image-file', image: '../../../assets/image/pongLogo.png' },
    ];

    const render = () => {
        const page = $container.querySelector("#page");
        if (page) {
            page.innerHTML = `
                <div id="VsSchedule" class="vs-screen">
                    ${VsScheduleUserCard("me", profileImg)}
                    <div class="vs-text">vs</div>
                    ${VsScheduleUserCard("you", profileImg)}
                </div>
            `;
            page.style.display = 'block';
        }
    };

    importCss("assets/css/vs-schedule.css");
    render();
}
