export default function InfoTab(isMe, infoData) {
    const totalWinRateBar = createWinRateBar(infoData.total, 'TOTAL');
    const easyWinRateBar = createWinRateBar(infoData.easy, 'EASY');
    const hardWinRateBar = createWinRateBar(infoData.hard, 'HARD');
    const nicknameBox = createNicknameBox(infoData.nickname, isMe);
    const profilePicture = createProfilePicture(isMe, infoData.image);

    return `
        <div id="profile-picture-container">
            ${profilePicture}
        </div>
        <div id="nickname-container">
            ${nicknameBox}
        </div>
        <div id="winrate-container">
            <div id="total-win-rate-container">
                ${totalWinRateBar}
            </div>
            <div id="easy-win-rate-container">
                ${easyWinRateBar}
            </div>
            <div id="hard-win-rate-container">
                ${hardWinRateBar}
            </div>
        </div>
     `;
}

function createProfilePicture(isMe, image) {
    image = image ? 'data:image/jpeg;base64,' + image : "../../../assets/image/cruiser.gif";
    if (isMe) {
        return `
            <label for="profile-picture-input" id="profile-picture-label">
                <img src="${image}" alt="profile picture" id="profile-picture">
            </label>
            <input type="file" id="profile-picture-input" accept="image/*" style="display: none;">
        `;
    } else {
        return `
            <img src="${image}" alt="profile picture" id="profile-picture-not-me">
        `;
    }
}

function createWinRateBar(winRate, type) {
    const barWidth = winRate + '%';
    let gaugeColor;
    if (winRate >= 70) {
        gaugeColor = 'steelblue';
    } else if (winRate >= 30) {
        gaugeColor = 'lightgoldenrod2';
    } else {
        gaugeColor = 'coral';
    }
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
        <input type="text" id="nickname-input" value="${nickname}" placeholder="${nickname}" ${isMe ? '' : 'disabled'}>
        ${isMe ? '<input type="submit" id="nickname-submit-btn" value="변경">' : ''}
    `;
}