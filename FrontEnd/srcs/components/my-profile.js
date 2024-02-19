/**
 * @param {HTMLElement} $container
 */
export default function MyProfile($container) {
    const render = () => {
        $container.querySelector('#profile').innerHTML = `
            <div>MyProfile</div>
        `;
    }

    render()
}