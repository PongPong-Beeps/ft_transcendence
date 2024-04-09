export default function InfoTab(isMe, infoData) {
    const totalWinRateBar = createWinRateBar(infoData.total, 'TOTAL');
    const basicWinRateBar = createWinRateBar(infoData.easy, 'BASIC');
    const itemWinRateBar = createWinRateBar(infoData.hard, 'ITEM');
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
            <div id="basic-win-rate-container">
                ${basicWinRateBar}
            </div>
            <div id="item-win-rate-container">
                ${itemWinRateBar}
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
                <input type="file" id="profile-picture-input" accept="image/*" style="display: none;">
            </label>
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
    if (winRate >= 80) {
        gaugeColor = 'dodgerblue';
    } else if (winRate >= 60) {
        gaugeColor = 'limegreen';
    } else if (winRate >= 40) {
        gaugeColor = 'gold';
    } else if (winRate >= 20) {
        gaugeColor = 'coral';
    } else {
        gaugeColor = 'orangered';
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