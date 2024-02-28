import FriendCell from "./friend-cell.js";
import ProfileModal from "../../pages/profile-modal/profile-modal.js";
import {importCss} from "../../utils/import-css.js";
import Error from "../../pages/error.js";

/**
 * @param {HTMLElement} $container
 */
export default function UserList($container) {
    // 더미 데이터
    const friendListData = [
        { nickname: "친구 1", isOnline: true },
        { nickname: "친구 2", isOnline: true },
        { nickname: "친구 3", isOnline: true },
        { nickname: "친구 4", isOnline: true },
        { nickname: "친구 5", isOnline: true },
        { nickname: "친구 6", isOnline: true },
        { nickname: "친구 7", isOnline: true },
        { nickname: "친구 8", isOnline: true },
        { nickname: "친구 9", isOnline: true },
        { nickname: "친구 10", isOnline: false },
        { nickname: "친구 11", isOnline: false },
        { nickname: "친구 12", isOnline: false }
    ];

    const render = () => {
        $container.querySelector('#menu').innerHTML = `
            <div id="user-list-container">
                <div id="user-list-button-container">
                    <button class="user-list-button non-outline-btn" id="friends-btn">친구</button>
                    <button class="user-list-button non-outline-btn" id="all-btn">전체</button>
                </div>
                <div id="user-list-list-container">
                    <div id="friends-list" class="list"></div>
                    <div id="all-list" class="list" style="display: none;">
                        <!-- 테스트용 -->
                        <button id="four_zero_one">401</button>
                        <button id="four_zero_four">404</button>
                        <button id="five_zero_zero">500</button>
                    </div>
                </div>
            </div>
        `;
    }

    const updateFriendList = () => {
        const friendsList = $container.querySelector('#friends-list');
        if (friendsList) {
            friendsList.innerHTML = friendListData.map(friend => FriendCell(friend.nickname, friend.isOnline)).join('');

            friendListData.forEach(friend => {
                const cell = $container.querySelector(`[data-nickname="${friend.nickname}"]`);
                if (cell) {
                    cell.addEventListener('click', () => {
                        new ProfileModal($container, friend.nickname, false); // ProfileModal 호출할 때 nickname 정보를 넘깁니다.
                    });

                    cell.querySelector('.dm-btn').addEventListener('click', (event) => {
                        event.stopPropagation(); // 이벤트 전파를 막음
                        alert(`${friend.nickname}에게 귓속말`);
                    });
                }
            });
        }
    }

    const toggleList = (showListId) => {
        document.querySelectorAll('.list').forEach(list => {
            list.style.display = list.id === showListId ? 'block' : 'none';
        });
    }

    const setupEventListener = () => {
        $container.querySelectorAll('.user-list-button').forEach(button => {
            button.addEventListener('click', function() {
                $container.querySelectorAll('.user-list-button').forEach(btn => {
                    btn.dataset.selected = 'false';
                    btn.classList.remove('selected');
                });
                this.dataset.selected = 'true';
                this.classList.add('selected');
                const listToShow = this.id === 'friends-btn' ? 'friends-list' : 'all-list';
                toggleList(listToShow);
            });
        });

        // 테스트용
        $container.querySelector('#four_zero_one').addEventListener('click', () => {
            new Error($container, 401);
        });
        $container.querySelector('#four_zero_four').addEventListener('click', () => {
            new Error($container, 404);
        });
        $container.querySelector('#five_zero_zero').addEventListener('click', () => {
            new Error($container, 500);
        });
    }

    const init = () => {
        // 초기 선택 상태 설정
        const friendsBtn = $container.querySelector('#friends-btn');
        if (friendsBtn) {
            friendsBtn.click();
        }
    }

    importCss("assets/css/user-list.css");
    render();
    updateFriendList(); // 데이터 기반으로 친구 목록 업데이트
    setupEventListener();
    init();
}
