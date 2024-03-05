/**
 * @param { string } nickname
 */
export default function UserCell({ nickname }) {
    return `
        <div class="user-cell" data-nickname="${nickname}">
            <span class="nickname">${nickname}</span>
        </div>
    `;
}