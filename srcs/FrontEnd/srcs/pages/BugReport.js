import { importCss } from "../utils/importCss.js";

/**
 * @param { HTMLElement } $container
 */
export default function getBugReportPage($container, bug_content) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="bug-report-page-background">
                    <div id="bug-report-page-container">
                        <h1>Bug-reports</h1>
                        <table id="bug-report-list">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Content</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bug_content.map(report => `
                                    <tr>
                                        <td>${report.id}</td>
                                        <td>${report.reporter}</td>
                                        <td>${report.content}</td>
                                        <td>${report.created_at}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            page.style.display = 'block';
        }
    }

    const setupEventListener = () => {
        const renderedImage = $container.querySelector('#bug-report-page-background');
        if (renderedImage) {
            renderedImage.addEventListener('click', () => {
                const page = $container.querySelector('#page');
                if (page) {
                    page.style.display = 'none';
                }
            });
        }
    }

    importCss("assets/css/bug-reports.css");
    render();
    setupEventListener();
}