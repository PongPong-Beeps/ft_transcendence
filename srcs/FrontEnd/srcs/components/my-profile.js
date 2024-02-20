/**
 * @param {HTMLElement} $container
 */
export default function MyProfile($container) {
    const render = () => {
        $container.querySelector('#profile').innerHTML = `
            <link rel="stylesheet" href="../../assets/css/profile.css">
            <div id="profile-container">
                <div id="profile-image"></div>
                <div id="nickname">닉네임</div>
                <button class="green-btn" id="detail-btn">상세 정보</button>
            </div>
        `;
    }

    render()
}