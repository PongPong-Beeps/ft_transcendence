/**
 * @param {HTMLElement} $container
 */

import VsScheduleUserCard from "./vs-schedule-user-card.js";

export default function VsSchedule($container) {
    let profileImg = [
        { label: 'profile-image-file', image: '../../../assets/image/pongLogo.png' },
    ];
    const render = () => {
        $container.querySelector("#page").innerHTML = `
            <link rel="stylesheet" href="../../assets/css/vs-schedule.css">
            <div id="VsSchedule" class="vs-screen">
                ${VsScheduleUserCard("me", profileImg)}
                <div class="vs-text">vs</div>
                ${VsScheduleUserCard("you", profileImg)}
            </div>
        `;
  };
  render();
}
