import ProfileModal from "../pages/profile-modal/profile-modal.js";
import {importCss} from "../utils/import-css.js";
import Router from "../router.js";

/**
 * @param {HTMLElement} $container
 */
export default function MyProfile($container) {
    const render = () => {
        $container.querySelector('#profile').innerHTML = `
            <div id="profile-container">
                <div id="profile-image"></div>
                <div id="nickname">닉네임</div>
                <button class="green-btn non-outline-btn" id="profile-btn">상세 정보</button>
            </div>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('#profile-btn').addEventListener('click', () => {
            new ProfileModal($container, "내 닉네임", true)
            $container.querySelector('#page').style.display = 'block'
        });
    }

    importCss("assets/css/my-profile.css");
    render();
    setupEventListener();
}