export default function FriendCell(nickname, isOnline) {
    return `
        <div class="friend-cell">
            <div class="status-indicator ${isOnline ? 'online' : 'offline'}"></div>
            <span class="nickname">${nickname}</span>
            <button class="dm-btn green-btn">귓속말</button>
        </div>
    `;
}