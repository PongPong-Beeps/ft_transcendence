import { importCss } from "../utils/importCss.js";

export default function ImgUploadError($container) {
    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML += `
                <div id="img-upload-error-background" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;">
                    <div id="img-upload-error-container">
                        <div id="img-upload-error-title">이미지의 크기는 3MB를 넘을 수 없습니다.</div>
                        <div id="img-upload-error-button-container">
                            <button class="green-btn" id="img-upload-error-check-btn">확인</button>
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