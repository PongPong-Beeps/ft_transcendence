import FriendCell from "./FriendCell.js";
import ProfileModal from "../../pages/profile-modal/ProfileModal.js";
import {importCss} from "../../utils/importCss.js";
import Error from "../../pages/Error.js";
import UserCell from "./UserCell.js";
import useState from "../../utils/useState.js";

/**
 * @param {HTMLElement} $container
 */
export default function UserList($container) {
    let [getAllUserList, setAllUserList] = useState([], this, 'renderAllUserList');

    // 더미 데이터
    const friendListData = [
        { nickname: "친구 1", isOnline: true },
        { nickname: "친구 2", isOnline: true },
        { nickname: "친구 3", isOnline: true },
        { nickname: "친구 4", isOnline: true },
        { nickname: "친구 5", isOnline: false },
        { nickname: "친구 6", isOnline: false }
    ];

    const render = () => {
        $container.querySelector('#menu').innerHTML = `
            <div id="user-list-container">
                <button id="use-state-test">테스트</button>
                <div id="user-list-button-container">
                    <button class="user-list-button non-outline-btn" id="friends-btn">친구</button>
                    <button class="user-list-button non-outline-btn" id="all-user-btn">전체</button>
                </div>
                <div id="user-list-tab-container">
                    <div id="friend-list-tab" class="list-tab"></div>
                    <div id="all-user-list-tab" class="list-tab"></div>
                </div>
            </div>
        `;
        this.renderAllUserList();
    }

    const setupFriendList = () => {
        const friendsListTab = $container.querySelector('#friend-list-tab');
        if (friendsListTab) {
            friendsListTab.innerHTML = friendListData
                .map(friend => FriendCell(friend))
                .join('');

            friendsListTab.addEventListener('click', (event) => {
                const friendCell = event.target.closest('[data-nickname]');
                if (!friendCell) return;

                const nickname = friendCell.getAttribute('data-nickname');
                if (event.target.matches('.dm-btn')) {
                    alert(`${nickname}에게 귓속말`);
                } else if (event.target.matches('.invite-btn')) {
                    alert(`${nickname} 초대`);
                } else {
                    new ProfileModal($container, nickname, false);
                }
            });
        }
    };

    this.renderAllUserList = () => {
        const userListTab = $container.querySelector('#all-user-list-tab');
        if (userListTab) {
            userListTab.innerHTML = getAllUserList()
                .map(user => UserCell(user))
                .join('');

            userListTab.addEventListener('click', (event) => {
                const userCell = event.target.closest('[data-nickname]');
                if (!userCell) return;

                const nickname = userCell.getAttribute('data-nickname');
                new ProfileModal($container, nickname, false);
            });
        }
    };

    const toggleList = (showListId) => {
        document.querySelectorAll('.list-tab').forEach(list => {
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
                const listToShow = this.id === 'friends-btn' ? 'friend-list-tab' : 'all-user-list-tab';
                toggleList(listToShow);
            });
        });

        // 테스트
        $container.querySelector('#use-state-test').addEventListener('click', () => {
            let userList = [...getAllUserList()]; // 현재 상태 복사
            userList.push({ nickname: "유저" }); // 새 유저 추가
            setAllUserList(userList); // 상태 업데이트
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
    setupFriendList();
    setupEventListener();
    init();
}
