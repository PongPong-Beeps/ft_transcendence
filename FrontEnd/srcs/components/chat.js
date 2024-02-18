/**
 * @param {HTMLElement} $container
 */
export default function Chat($container) {
    const render = () => {
        $container.querySelector('#footer').innerHTML = `
            <div>Chat</div>
        `;
    }

    render()
}