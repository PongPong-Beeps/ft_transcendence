import { importCss } from "../utils/importCss.js";

/**
 * @param { HTMLElement } $container
 */
export default function getPatchNotePage($container) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="patch-note-page-background">
                    <div id="patch-note-page-container">
                        <h1>Patch Notes</h1>
                        <ul id="patch-note-list">
                            <li>Version 1.0 - Initial release</li>
                            <li>Version 1.1 - Bug fixes and performance improvements</li>
                            <li>Version 1.2 - Added new features</li>
                            <!-- Add more patch notes here -->
                        </ul>
                    </div>
                </div>
            `;
            page.style.display = 'block';
        }
    }

    const setupEventListener = () => {
        const renderedImage = $container.querySelector('#patch-note-page-background');
        if (renderedImage) {
            renderedImage.addEventListener('click', () => {
                const page = $container.querySelector('#page');
                if (page) {
                    page.style.display = 'none';
                }
            });
        }
    }

    importCss("assets/css/patch-notes.css");
    render();
    setupEventListener();
}