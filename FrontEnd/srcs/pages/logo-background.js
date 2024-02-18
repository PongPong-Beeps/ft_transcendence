/**
 * @param {HTMLElement} $container
 */
export default function LogoBackground($container) {
    const render = () => {
        $container.querySelector('#header').innerHTML = `
            <div id="logo">
                <img src="../../assets/image/logo.png" alt="logo">
            </div>
            
        `;
    }

    render()
}