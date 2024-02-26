export default function BlacklistCell(nickname) {
    return `
        <div class="blacklist-cell">
            <div>${nickname}</div>
            <button class="unblock-btn non-outline-btn">차단해제</button>
        </div>
    `;
}