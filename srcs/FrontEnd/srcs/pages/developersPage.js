import { importCss } from "../utils/importCss.js";

/**
 * @param { HTMLElement } $container
 */
export default function getDevelopersPage($container) {
    const logoImage = $container.querySelector('#header-container img');
    if (!logoImage) return;
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="developers-page-background">
                    <div id="developers-page-container">
                        <div id="developers-page-img">
                            <img src="../../assets/image/developers.jpg" alt="개발자들">
                        </div>
                    </div>
                </div>
            `;
            page.style.display = 'block';
        }
    }

    const setupEventListener = () => {
        const renderedImage = $container.querySelector('#developers-page-img img');
        if (renderedImage) {
            renderedImage.addEventListener('click', () => {
                const page = $container.querySelector('#page');
                if (page) {
                    page.style.display = 'none';
                }
            });
        }
    }
    
    importCss("assets/css/developers.css");
    render();
    setupEventListener();
}