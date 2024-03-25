/**
 * @param { string } nickname
 * @parmm { string } image
 */
export default function PlayerCell({ nickname, image }) {
    image = image ? 'data:image/jpeg;base64,' + image : "../../../assets/image/cruiser.gif";
    return `
        <div class="player-cell">
            <div class="player-thumbnail-container">
                <img src="${image}" alt="nickname" />
            </div>
            <div class="player-nickname">${nickname}</div>
        </div>
    `;
}