/**
 * @param { number } id
 * @param { string } nickname
 */
export default function UserCell({ id, nickname }) {
    return `
        <div class="user-cell" data-id="${id}">
            <span class="nickname">${nickname}</span>
        </div>
    `;
}