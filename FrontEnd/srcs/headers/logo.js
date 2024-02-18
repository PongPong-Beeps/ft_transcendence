/**
 * @param {HTMLElement} $container
 */
export default function Logo($container) {
    const render = () => {
        $container.querySelector('#page').innerHTML = `
            <div id="logo">
                <img src="../../assets/image/logo.png" alt="logo">
            </div>
            
        `;
    }

    render()
}