/**
 * @param {HTMLElement} $container
 */
export default function Login($container) {
    const render = () => {
        $container.querySelector('#header').innerHTML = `
            <div>Login</div>
<!--            <div style="position: fixed; top: 0; left: 0; height: 100vh; width: 100vw;"></div>-->
        `;
    }

    render()
}