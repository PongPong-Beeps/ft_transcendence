/**
 * @param { string } nickname
 * @param { string } image
 * @param { boolean } ready
 */
export default function PlayerInfo({ nickname, image, ready }) {
    image = image ? 'data:image/jpeg;base64,' + image : "../../../assets/image/question-mark.png";
    return `
        <div class="game-room-player-info-container">
            <div class="game-room-player-thumbnail-container">
                <div class="game-room-player-thumbnail">
                    <img src=${image} alt="thumbnail">
                </div>
            </div>
            <div class="game-room-player-nickname">${nickname}</div>
            <div class="game-room-player-ready">${ready === true ? "READY" : ""}</div>
        </div>
    `;
}