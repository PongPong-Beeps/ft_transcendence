/**
 * @param {HTMLElement} $container
 */
export default function VsRoom($container) {
    const render = () => {
        $container.querySelector('#main').innerHTML = `
            <div>VsRoom</div>
        `;
    }

    render()
}