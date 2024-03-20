/**
 * @param { number } id
 * @param { string } nickname
 * @param { boolean } is_online
 */
export default function FriendCell({ id, nickname, is_online }) {
    return `
        <div class="friend-cell" data-id="${id}">
            <div class="status-indicator ${is_online ? 'online' : 'offline'}"></div>
            <span class="nickname">${nickname}</span>
            ${is_online ? `
            <button class="invite-btn green-btn non-outline-btn">초대</button>
            <button class="dm-btn green-btn non-outline-btn">귓속말</button>` : ''}
        </div>
    `;
}