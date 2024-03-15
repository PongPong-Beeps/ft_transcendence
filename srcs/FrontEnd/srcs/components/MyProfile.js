import ProfileModal from "../pages/profile-modal/ProfileModal.js";
import getCookie from "../utils/cookie.js";
import useState from "../utils/useState.js";
import { importCss } from "../utils/importCss.js";
import Router from "../router.js";
import {BACKEND, fetchWithAuth} from "../api.js";
import ErrorPage from "../pages/ErrorPage.js";

/**
 * @param {HTMLElement} $container
 */
export default function MyProfile($container) {
    let [getNickname, setNickname] = useState("", this, 'renderNickname');
    let [getProfileImage, setProfileImage] = useState("", this, 'renderProfileImage');

    const render = () => {
        $container.querySelector('#profile').innerHTML = `
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
        $container.querySelector('#profile-btn').addEventListener('click', () => {
            new ProfileModal($container, getNickname(), true, setNickname, setProfileImage);
        });
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
            data.image = data.image ? 'data:image/jpeg;base64,' + data.image : "../../../assets/image/cruiser.gif";
            setNickname(data.nickname);
            setProfileImage(data.image);
        })
        .catch(error => {
            console.error("[ fetchMyProfileData ] " + error.message);
            new ErrorPage($container, error.status);
        });
}
