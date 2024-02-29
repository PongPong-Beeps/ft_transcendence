export default function InfoTab(nickname, isMe, infoDummyData) {
    const totalWinRateBar = createWinRateBar(infoDummyData.totalWinRate, '전체');
    const oneOnOneWinRateBar = createWinRateBar(infoDummyData.oneOnOneWinRate, '1vs1');
    const tournamentWinRateBar = createWinRateBar(infoDummyData.tournamentWinRate, '토너먼트');
    const nicknameBox = createNicknameBox(nickname, isMe);
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
                <div class="win-rate-gauge" style="width: ${barWidth}; background-color: ${gaugeColor};"></div>
            </div>
            <div class="win-rate">${winRate}%</div>
        </div>`;
}

function createNicknameBox(nickname, isMe) {
    return `
            <input type="text" id="nickname-input" placeholder="${nickname}" ${isMe ? '' : 'disabled'}>
        ${isMe ? '<input type="submit" id="nickname-submit-btn" value="변경">' : ''}
    `;
}