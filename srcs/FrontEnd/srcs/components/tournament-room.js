/**
 * @param { HTMLElement } $container
 * @param { Object } difficulty
 */
export default function TournamentRoom($container, difficulty) {
    const render = () => {
        $container.querySelector('#main').innerHTML = `
            <div>난이도 : ${difficulty}</div>
        `;
    }

    render();
}