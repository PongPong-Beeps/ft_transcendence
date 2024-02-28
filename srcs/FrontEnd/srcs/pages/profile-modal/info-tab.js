export default function InfoTab(nickname, isMe, totalWinRate, oneOnOneWinRate, tournamentWinRate) {
    const totalWinRateBar = createWinRateBar(totalWinRate, '전체');
    const oneOnOneWinRateBar = createWinRateBar(oneOnOneWinRate, '1vs1');
    const tournamentWinRateBar = createWinRateBar(tournamentWinRate, '토너먼트');
    let nicknameBox = createNicknameBox(nickname, isMe);
    return `
        <div id="profile-picture-container">
            <img src="../../../assets/image/cruiser.gif" alt="profile picture">
            <div id="change-picture-container">
                ${isMe ? '<button id="change-picture-button">*</button>' : ''}
            </div>
        </div>
        <div id="nickname-container">
            ${nicknameBox}
        </div>
        <div id="winrate-container">
            <div id="total-win-rate-container">
                ${totalWinRateBar}
            </div>
            <div id="one-on-one-win-rate-container">
                ${oneOnOneWinRateBar}
            </div>
            <div id="tournament-win-rate-container">
                ${tournamentWinRateBar}
            </div>
        </div>
     `;
}

function createWinRateBar(winRate, type) {
    const barWidth = winRate + '%';
    const gaugeColor = winRate >= 50 ? 'steelblue' : 'coral';
    return `
        <div class="win-rate-box">
            <div class="type-box">${type}</div>
            <div class="win-rate-gauge-box">
                <div class="win-rate-gauge" style="width: ${barWidth};background-color: ${gaugeColor}; border-radius: 5px; overflow: hidden;"></div>
            </div>
        </div>`;
}

function createNicknameBox(nickname, isMe = true) {
    return `
        <div id="nickname-Box">
            ${nickname}
        </div>
        ${isMe ? '<button id="change-nickname-btn">변경</button>' : ''}
    `;
}