import FriendCell from "./friend-cell.js";
import ProfileModal from "../../pages/profile-modal/profile-modal.js";
import {importCss} from "../../utils/import-css.js";
import Error from "../../pages/error.js";
import UserCell from "./user-cell.js";

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
        { nickname: "친구 5", isOnline: false },
        { nickname: "친구 6", isOnline: false }
    ];

    const userListData = [
        { nickname: "유저 1" },
        { nickname: "유저 2" },
        { nickname: "유저 3" },
        { nickname: "유저 4" },
        { nickname: "유저 5" },
        { nickname: "유저 6" },
        { nickname: "유저 7" },
        { nickname: "유저 8" },
        { nickname: "유저 9" },
        { nickname: "유저 10" },
        { nickname: "유저 11" },
        { nickname: "유저 12" }
    ]

    const render = () => {
        $container.querySelector('#menu').innerHTML = `
            <div id="user-list-container">
                <div id="user-list-button-container">
                    <button class="user-list-button non-outline-btn" id="friends-btn">친구</button>
                    <button class="user-list-button non-outline-btn" id="all-btn">전체</button>
                </div>
                <div id="user-list-list-container">
                    <div id="friends-list" class="list"></div>
                    <div id="user-list" class="list"></div>
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
                        new ProfileModal($container, friend.nickname, false);
                    });

                    cell.querySelector('.dm-btn').addEventListener('click', (event) => {
                        event.stopPropagation();
                        alert(`${friend.nickname}에게 귓속말`);
                    });
                }
            });
        }
    }

    const updateUserList = () => {
        const userList = $container.querySelector('#user-list');
        if (userList) {
            userList.innerHTML = userListData.map(user => UserCell(user.nickname)).join('');

            userListData.forEach(user => {
                const cell = $container.querySelector(`[data-nickname="${user.nickname}"]`);
                if (cell) {
                    cell.addEventListener('click', () => {
                        new ProfileModal($container, user.nickname, false);
                    });
                }
            })
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
                const listToShow = this.id === 'friends-btn' ? 'friends-list' : 'user-list';
                toggleList(listToShow);
            });
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
    updateFriendList();
    updateUserList();
    setupEventListener();
    init();
}
