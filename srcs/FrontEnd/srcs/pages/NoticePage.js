import { importCss } from "../utils/importCss.js";

/**
 * @param { HTMLElement } $container
 */
export default function getNoticePage($container, content) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            console.log(content);
            page.innerHTML = `
                <div id="notice-note-page-background">
                    <div id="notice-note-page-container">
                        <h1>Notice Notes</h1>
                        <div>${content}</div>
                    </div>
                </div>
            `;
            // page.style.display = 'block';
        }
    }

    // const setupEventListener = () => {
    //     const renderedImage = $container.querySelector('#notice-note-page-background');
    //     if (renderedImage) {
    //         renderedImage.addEventListener('click', () => {
    //             const page = $container.querySelector('#page');
    //             if (page) {
    //                 page.style.display = 'none';
    //             }
    //         });
    //     }
    // }

    // importCss("assets/css/notice-notes.css");
    render();
    // setupEventListener();
}