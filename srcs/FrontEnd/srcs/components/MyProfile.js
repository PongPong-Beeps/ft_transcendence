import ProfileModal from "../pages/profile-modal/ProfileModal.js";
import getCookie from "../utils/cookie.js";
import useState from "../utils/useState.js";
import { importCss } from "../utils/importCss.js";
import Router from "../router.js";
import {BACKEND, fetchWithAuth} from "../api.js";
import ErrorPage from "../pages/ErrorPage.js";

/**
 * @param { HTMLElement } $container
 * @param { WebSocketManager } connWsManager
 */
export default function MyProfile($container, connWsManager) {
    let id;
    let [getNickname, setNickname] = useState("", this, 'renderNickname');
    let [getProfileImage, setProfileImage] = useState("", this, 'renderProfileImage');

    const render = () => {
        const profile = $container.querySelector('#profile');
        if (!profile) return;
        profile.innerHTML = `
            <div id="profile-container">
                <div id="profile-image"><img id="profile-img" src="" alt="" width="100%" height="100%"></div>
                <div id="profile-detail">
                    <div id="nickname"></div>
                    <button class="green-btn non-outline-btn" id="profile-btn">프로필</button>
                </div>
            </div>
        `;
    }

    const setupEventListener = () => {
        const profileButton = $container.querySelector('#profile-btn');
        if (profileButton) {
            profileButton.addEventListener('click', () => {
                new ProfileModal($container, connWsManager, id, id, true, setNickname, setProfileImage);
            });
        }
    }

    this.renderNickname = () => {
        $container.querySelector('#nickname').textContent = getNickname();
    }
    this.renderProfileImage = () => {
        $container.querySelector('#profile-img').src = getProfileImage();
    }

    importCss("assets/css/my-profile.css");
    render();
    setupEventListener();
    fetchWithAuth(`${BACKEND}/user/me`)
        .then(data => {
            id = data.id;
            data.image = data.image ? 'data:image/jpeg;base64,' + data.image : "../../../assets/image/cruiser.gif";
            setNickname(data.nickname);
            setProfileImage(data.image);
        })
        .catch(error => {
            console.error("[ fetchMyProfileData ] " + error.message);
            new ErrorPage($container, error.status);
        });
}
