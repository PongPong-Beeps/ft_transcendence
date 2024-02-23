import ProfileModal from "../pages/profile-modal.js";

/**
 * @param {HTMLElement} $container
 */
export default function MyProfile($container) {
    const render = () => {
        $container.querySelector('#profile').innerHTML = `
            <link rel="stylesheet" href="../../assets/css/my-profile.css">
            <div id="profile-container">
                <div id="profile-image"></div>
                <div id="nickname">닉네임</div>
                <button class="green-btn non-outline-btn" id="profile-btn">상세 정보</button>
            </div>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('#profile-btn').addEventListener('click', () => {
            new ProfileModal($container)
            $container.querySelector('#page').style.display = 'block'
        });
    }

    render()
    setupEventListener()
}