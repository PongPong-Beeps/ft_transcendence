import FriendCell from "./FriendCell.js";
import ProfileModal from "../../pages/profile-modal/ProfileModal.js";
import {importCss} from "../../utils/importCss.js";
import ErrorPage from "../../pages/ErrorPage.js";
import UserCell from "./UserCell.js";
import useState from "../../utils/useState.js";
import getCookie from "../../utils/cookie.js";
import {BACKEND, fetchWithAuth} from "../../api.js";

/**
 * @param { HTMLElement } $container
 * @param { WebSocket } ws
 */
export default function UserList($container, ws) {
    let [getFriendList, setFriendList] = useState([], this, 'renderFriendList');
    let [getAllUserList, setAllUserList] = useState([], this, 'renderAllUserList');

    const render = () => {
        $container.querySelector('#menu').innerHTML = `
            <div id="user-list-container">
                <div id="user-list-button-container">
                    <button class="user-list-button non-outline-btn" id="friend-btn">친구</button>
                    <button class="user-list-button non-outline-btn" id="all-user-btn">전체</button>
                </div>
                <div id="user-list-tab-container">
                    <div class="user-list-tab" id="friend-list-tab"></div>
                    <div class="user-list-tab" id="all-user-list-tab"></div>
                </div>
            </div>
        `;
        const friendButton = $container.querySelector('#friend-btn');
        toggleUserListByButton(friendButton); // 초기 설정
    }

    this.renderFriendList = () => {
        const friendsListTab = $container.querySelector('#friend-list-tab');
        friendsListTab.innerHTML = getFriendList()
            .map(friend => FriendCell(friend))
            .join('');
    };

    this.renderAllUserList = () => {
        const userListTab = $container.querySelector('#all-user-list-tab');
        userListTab.innerHTML = getAllUserList()
            .map(user => UserCell(user))
            .join('');
    };

    const setupEventListener = () => {
        const userListContainer = $container.querySelector('#user-list-container');
        userListContainer.addEventListener('click', (event) => {
            if (event.target.closest('.user-list-button')) {
                handleUserListButtonClick(event);
            } else if (event.target.closest('.user-list-tab')) {
                handleUserListCellClick(event);
            }
        });
    };

    const handleUserListButtonClick = (event) => {
        const button = event.target;
        $container.querySelectorAll('.user-list-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        toggleUserListByButton(button);
    };

    const handleUserListCellClick = (event) => {
        const userCell = event.target.closest('[data-nickname]');
        if (!userCell) return; // margin으로 인한 빈 공간 클릭했을 때
        const nickname = userCell.getAttribute('data-nickname');
        if (event.target.matches('.dm-btn')) {
            alert(`${nickname}에게 귓속말`);
        } else if (event.target.matches('.invite-btn')) {
            alert(`${nickname} 초대`);
        } else {
            new ProfileModal($container, ws, nickname, false);
        }
    };

    const toggleUserListByButton = (selectedButton) => {
        selectedButton.classList.add('selected');
        const showListId = selectedButton.id === 'friend-btn' ? 'friend-list-tab' : 'all-user-list-tab';
        $container.querySelectorAll('.user-list-tab').forEach(list => {
            list.style.display = list.id === showListId ? 'block' : 'none';
        });
        if (showListId === 'all-user-list-tab') {
            fetchWithAuth(`${BACKEND}/user/list/`)
                .then(data => {
                    console.log("[ fetchUserListData ] 유저 리스트 패치 완료");
                    setAllUserList(data.userList);
                })
                .catch(error => {
                    console.error("[ fetchUserListData ] " + error.message);
                    new ErrorPage($container, error.status);
                });
        }
    };

    const setupUserListData = () => {
        fetchWithAuth(`${BACKEND}/user/me/`)
            .then(data => {
                ws.send(JSON.stringify({ type: "friend_list", sender: data.nickname }));
            })
            .catch(error => {
                console.error("[ setupUserListData ] ", error.message);
                new ErrorPage($container, error.status);
            });
        ws.onmessage = function(event) {
            setFriendList(JSON.parse(event.data).friendList);
            console.log(getFriendList());
        }
    }

    importCss("assets/css/user-list.css");
    render();
    setupEventListener();
    setupUserListData();
}
