export default function BlacklistCell(nickname) {
    return `
        <div class="blacklist-cell" data-nickname="${nickname}">
            <div>${nickname}</div>
            <button class="unblock-btn non-outline-btn">차단해제</button>
        </div>
    `;
}