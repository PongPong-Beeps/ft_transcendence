import { importCss } from "../utils/importCss.js";

/**
 * @param { HTMLElement } $container
 */
export default function getNoticePage($container, content) {
    const render = () => {
        const page = $container.querySelector('#notice');
        if (page) {
            console.log(content);
            if (content === "stop") {
                page.innerHTML = "";
            }
            else {
                page.innerHTML = `
                <div id="notice">
                    <span>${content}</span>
                </div>
            `;
            }
        }
    }

    importCss("assets/css/notice.css");
    render();
}