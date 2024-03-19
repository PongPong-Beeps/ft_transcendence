/**
 * @param { string } nickname
 * @param { boolean } is_online
 */
export default function FriendCell({ nickname, is_online }) {
    return `
        <div class="friend-cell" data-nickname="${nickname}">
            <div class="status-indicator ${is_online ? 'online' : 'offline'}"></div>
            <span class="nickname">${nickname}</span>
            ${is_online ? `
            <button class="invite-btn green-btn non-outline-btn">초대</button>
            <button class="dm-btn green-btn non-outline-btn">귓속말</button>` : ''}
        </div>
    `;
}