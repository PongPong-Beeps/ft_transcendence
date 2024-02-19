/**
 * @param {HTMLElement} $container
 */
export default function TournamentRoom($container) {
    const render = () => {
        $container.querySelector('#main').innerHTML = `
            <div>TournamentRoom</div>
        `;
    }

    render()
}