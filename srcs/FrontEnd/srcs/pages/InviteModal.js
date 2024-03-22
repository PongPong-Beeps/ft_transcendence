import { importCss } from "../utils/importCss.js";
/**
 *@param { HTMLElement } $container
 *@param { string } sender
 *@param { string } receiver
 *@param { string } game_type
 *@param { string } game_mode
 *@param { string } sender_id
 *@param { string } receiver_id
*/
export default function InviteModal($container, sender, receiver, game_type, game_mode, sender_id, receiver_id) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML += `
                <div id="invite-modal-background" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;">
                    <div id="invite-modal-container">
                        <div id="invite-modal-title">${sender}가 ${game_mode}난이도의 ${game_type}게임으로 초대했습네다</div>
                        <div id="invite-modal-button-container">
                            <button class="red-btn" id="invite-modal-deny-btn">거절</button>
                            <button class="grreen-btn" id="invite-modal-accept-btn">참가</button>
                        </div>
                    </div>
                </div>
            `;
            page.style.display = 'block';
        }
    };

    const handleImgUploadErrorEvent = (event) => {
        if (event.target.closest('#img-upload-error-check-btn')) {
            const errorBackground = $container.querySelector('#img-upload-error-background');
            if (errorBackground) {
                errorBackground.remove();
                const errorBackgroundElement = $container.querySelector('#img-upload-error-background');
                if (errorBackgroundElement) {
                    errorBackgroundElement.removeEventListener('click', handleImgUploadErrorEvent);
                }
                setupEventListener();
            }
        }
    };

    const setupEventListener = () => {
        const errorBackgroundElement = $container.querySelector('#img-upload-error-background');
        if (errorBackgroundElement) {
            errorBackgroundElement.addEventListener('click', handleImgUploadErrorEvent);
        }
    };

    importCss("assets/css/img-upload-error.css");
    render();
    setupEventListener();
}