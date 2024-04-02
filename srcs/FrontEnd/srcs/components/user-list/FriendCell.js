/**
 * @param { number } id
 * @param { string } nickname
 * @param { boolean } is_online
 * @param { boolean } is_block
 */
export default function FriendCell({ id, nickname, is_online, is_block }) {
    return `
        <div class="friend-cell" data-id="${id}">
            <div class="status-indicator ${is_online ? 'online' : 'offline'}"></div>
            <span class="nickname">${nickname}</span>
            ${is_online ? `
            <button class="invite-btn green-btn non-outline-btn">초대</button>
            <button class="dm-btn green-btn non-outline-btn ${is_block ? 'disabled' : ''}" ${is_block ? 'disabled' : ''}>귓속말</button>` : ''}
        </div>
    `;
}