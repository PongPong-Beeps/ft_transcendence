export default function GameSettingsOption(option, items) {
    const optionsHtml = items.map(item => `
        <button class="game-settings-option-item non-outline-btn" data-selected="false" data-label="${item.label}" data-option="${option}">
            <img src="${item.image}" alt="${item.label}"/>
        </button>
    `).join('');

    return `
        <div class="game-settings-option">
            <div class="game-settings-option-title">${option === "type" ? "타입" : "모드"}</div>
            <div class="game-settings-option-item-container">
                ${optionsHtml}
            </div>
        </div>
    `;
}