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
                        <div id="message" style="display: block;">
                            <p>
                            Music from #Uppbeat (free for Creators!):
                            https://uppbeat.io/t/color-parade/pixel-playground
                            License code: 7GWRM0O5WYAE2PWU
                            </p>
                            <p>
                            Music from #Uppbeat (free for Creators!):
                            https://uppbeat.io/t/monument-music/the-festive-fairy
                            License code: PWRRRJVBYCODEJXJ
                            </p>
                            <p>
                            Music from #Uppbeat (free for Creators!):
                            https://uppbeat.io/t/aaron-paul-low/race-to-the-finish
                            License code: WB2YTMS7TMKEKNDB
                            </p>
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