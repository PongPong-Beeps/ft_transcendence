export default function GameSettingsOption(category, options) {
    const optionsHtml = options.map(option => `
        <button class="game-settings-option-item non-outline-btn" data-selected="false" data-label="${option.label}" data-category="${category}">
            <img src="${option.image}" alt="${option.label}"/>
        </button>
    `).join('');

    return `
        <div class="game-settings-option">
            <div class="game-settings-option-title">${category}</div>
            <div class="game-settings-option-item-container">
                ${optionsHtml}
            </div>
        </div>
    `;
}