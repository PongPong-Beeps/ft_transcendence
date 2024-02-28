// export default function InfoTab(nickname, isMe, totalWinRate, oneOnOneWinRate, tournamentWinRate) {
//     return `
//         <div id="info-tab-container">
//             <div id="profile-picture-container">
//                 <img src="../../../assets/image/tournament.png" alt="profile picture">
//                 ${isMe ? '<button id="change-picture-button">Change Picture</button>' : ''}
//             </div>
//             <div id="profile-info-container">
//                 <div id="nickname-container">${nickname}</div>
//                 <div id="total-win-rate-container">전체 승률: ${totalWinRate}%</div>
//                 <div id="one-on-one-win-rate-container">1대1 승률: ${oneOnOneWinRate}%</div>
//                 <div id="tournament-win-rate-container">토너먼트 승률: ${tournamentWinRate}%</div>
//             </div>
//         </div>
//     `;
// }

export default function InfoTab(nickname, isMe, totalWinRate, oneOnOneWinRate, tournamentWinRate) {
    const totalWinRateBar = createWinRateBar(totalWinRate);
    const oneOnOneWinRateBar = createWinRateBar(oneOnOneWinRate);
    const tournamentWinRateBar = createWinRateBar(tournamentWinRate);

    return `
        <div id="info-tab-container">
            <div id="profile-picture-container">
                <img src="../../../assets/image/cruiser.gif" alt="profile picture">
                ${isMe ? '<button id="change-picture-button">Change Picture</button>' : ''}
            </div>
            <div id="profile-info-container">
                <div id="nickname-container">${nickname}</div>
                <div id="total-win-rate-container">
                    전체 승률: ${totalWinRate}% ${totalWinRateBar}
                </div>
                <div id="one-on-one-win-rate-container">
                    1대1 승률: ${oneOnOneWinRate}% ${oneOnOneWinRateBar}
                </div>
                <div id="tournament-win-rate-container">
                    토너먼트 승률: ${tournamentWinRate}% ${tournamentWinRateBar}
                </div>
            </div>
        </div>
    `;
}

function createWinRateBar(winRate) {
    const barWidth = winRate + '%';
    return `<div class="win-rate-bar" style="width: ${barWidth};"></div>`;
}
