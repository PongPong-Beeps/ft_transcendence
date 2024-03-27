/**
 * @param { number } id
 * @param { string } nickname
 * @param { string } image
 */
export default function PlayerCell({ id, nickname, image }) {
    let imageSrc = image ? 'data:image/jpeg;base64,' + image : "../../../assets/image/cruiser.gif";
    return `
        <div class="player-cell">
            <div class="player-thumbnail-container">
                <img src="${imageSrc}" alt="nickname" />
            </div>
            <div class="player-nickname">${nickname}</div>
        </div>
    `;
}