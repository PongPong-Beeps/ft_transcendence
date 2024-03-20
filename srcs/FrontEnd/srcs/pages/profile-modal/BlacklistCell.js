/**
 * @param { number } id
 * @param { string } nickname
 */
export default function BlacklistCell({id, nickname}) {
    return `
        <div class="blacklist-cell" data-id="${id}">
            <div>${nickname}</div>
            <button class="unblock-btn non-outline-btn">차단해제</button>
        </div>
    `;
}