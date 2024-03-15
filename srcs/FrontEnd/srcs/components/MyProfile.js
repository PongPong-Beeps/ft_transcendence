import ProfileModal from "../pages/profile-modal/ProfileModal.js";
import getCookie from "../utils/cookie.js";
import useState from "../utils/useState.js";
import { importCss } from "../utils/importCss.js";
import Router from "../router.js";

/**
 * @param {HTMLElement} $container
 */
export default function MyProfile($container) {
    let [getNickname, setNickname] = useState("", this, 'renderNickname');
    let [getProfileImage, setProfileImage] = useState("", this, 'renderProfileImage');

    async function getProfile() {
        await fetch("https://127.0.0.1/api/user/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getCookie("access_token")}`,
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
        })
            .then(response => {
                if (response.status === 401) {
                    return fetch('https://127.0.0.1/api/tooken/refresh/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie("csrftoken")
                        },
                        body: JSON.stringify({
                            'refresh': getCookie("refresh_token")
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log('New tokens :', data);
                            return data;
                        });
                } else {
                    return response.json();
                }
            })
            .then(data => {
                data.image = data.image ? 'data:image/jpeg;base64,' + data.image : "../../../assets/image/cruiser.gif";
                setNickname(data.nickname);
                setProfileImage(data.image);
            })
    };
    const render = () => {
        $container.querySelector('#profile').innerHTML = `
            <div id="profile-container">
                <div id="profile-image"><img id="profile-img" src="" alt="Profile Image" width="100%" height="100%"></div>
                <div id="nickname"></div>
                <button class="green-btn non-outline-btn" id="profile-btn">상세 정보</button>
            </div>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('#profile-btn').addEventListener('click', () => {
            new ProfileModal($container, getNickname(), true);
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
    getProfile();
}