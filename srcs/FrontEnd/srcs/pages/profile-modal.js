import {navigate} from "../utils/navigate.js";

/**
 * @param {HTMLElement} $container
 * @param {string} nickname
 */
export default function ProfileModal($container, nickname) {
    const render = () => {
        $container.querySelector('#page').innerHTML = `
            <link rel="stylesheet" href="../../assets/css/profile-modal.css">
            <div id="profile-modal-background">
                <div id="profile-modal-container">
                    <div id="profile-modal-title"><img src="../../assets/image/profile.png" alt="profile title"></div>
                    <div id="profile-modal-tab-container">
                        <div id="profile-modal-tab-button-container">
                            <button class="profile-modal-tab-button non-outline-btn" id="info-btn">정보</button>
                            <button class="profile-modal-tab-button non-outline-btn" id="history-btn">전적</button>
                            <button class="profile-modal-tab-button non-outline-btn" id="blacklist-btn">블랙리스트</button>
                        </div>
                        <div id="profile-modal-tab">
                            ${nickname}
                        </div>
                    </div>
                    <div id="profile-modal-button-container">
                        <button class="non-outline-btn" id="block-btn">차단</button>
                        <button class="non-outline-btn"id="add-friend-btn">친구 추가</button>
                        <button class="non-outline-btn"id="ok-btn">확인</button>
                    </div>
                </div>
            </div>
        `;
    }

    const setupEventListener = () => {
        $container.querySelectorAll('.profile-modal-tab-button').forEach(button => {
            button.addEventListener('click', function() {
                $container.querySelectorAll('.profile-modal-tab-button').forEach(btn => {
                    btn.dataset.selected = 'false';
                    btn.classList.remove('selected');
                });
                this.dataset.selected = 'true';
                this.classList.add('selected');
            });
        });

        $container.querySelector('#ok-btn').addEventListener('click', () => {
            $container.querySelector('#page').style.display = 'none'
        });
    }

    render()
    setupEventListener()

    // 초기 선택 상태 설정
    const infoBtn = $container.querySelector('#info-btn');
    if (infoBtn) {
        infoBtn.click();
    }
}