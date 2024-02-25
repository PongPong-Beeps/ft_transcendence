/**
 * @param {HTMLElement} $container
 */
export default function VsSchedule($container) {
    const render = () => {
        $container.querySelector('#page').innerHTML = `
            <link rel="stylesheet" href="../../assets/css/vs-schedule.css">
            <div id="VsSchedule" class="vs-screen">
                <img src="assets/image/cardFrame.jpg" alt="me" class="player player1">
                <div class="vs-text">vs</div>
                <img src="assets/image/cardFrame.jpg" alt="you" class="player player2">
            </div>
        `;
    };
    render();
}