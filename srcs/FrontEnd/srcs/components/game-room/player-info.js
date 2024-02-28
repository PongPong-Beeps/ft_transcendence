export default function PlayerInfo() {
    // 닉네임으로부터 데이터 받아오기 필요
    return `
        <div class="game-room-player-info-container">
            <div class="game-room-player-thumbnail-container">
                <div class="game-room-player-thumbnail">
                    <img src="../../../assets/image/question-mark.png" alt="thumbnail">
                </div>
            </div>
            <div class="game-room-player-nickname">닉네임</div>
        </div>
    `;
}