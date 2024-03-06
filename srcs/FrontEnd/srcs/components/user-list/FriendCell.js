/**
 * @param { string } nickname
 * @param { boolean } isOnline
 */
export default function FriendCell({ nickname, isOnline }) {
    return `
        <div class="friend-cell" data-nickname="${nickname}">
            <div class="status-indicator ${isOnline ? 'online' : 'offline'}"></div>
            <span class="nickname">${nickname}</span>
            ${isOnline ? `
            <button class="invite-btn green-btn non-outline-btn">초대</button>
            <button class="dm-btn green-btn non-outline-btn">귓속말</button>` : ''}
        </div>
    `;
}