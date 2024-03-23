import FriendCell from "./FriendCell.js";
import ProfileModal from "../../pages/profile-modal/ProfileModal.js";
import {importCss} from "../../utils/importCss.js";
import ErrorPage from "../../pages/ErrorPage.js";
import UserCell from "./UserCell.js";
import useState from "../../utils/useState.js";
import getCookie from "../../utils/cookie.js";
import {BACKEND, fetchWithAuth} from "../../api.js";
import { WebSocketManager } from "../../utils/webSocketManager.js";
import InviteModal from "../../pages/InviteModal.js";

/**
 * @param { HTMLElement } $container
 * @param { [WebSocketManager] } wsManager
 */
export default function UserList($container, wsManager) {
    let id;
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
        if (location.pathname === '/game-room') {
            $container.querySelectorAll('.invite-btn').forEach(button => {
                button.style.display = 'block';
            });
        }
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
        const userCell = event.target.closest('[data-id]');
        if (!userCell) return; // margin으로 인한 빈 공간 클릭했을 때
        const targetId = userCell.getAttribute('data-id');
        const targetNickname = userCell.querySelector('.nickname').innerText;
        if (event.target.matches('.dm-btn')) {
            const event = new CustomEvent('dmMessage', {
                detail: {
                    type: "dm_chat",
                    receiver: parseInt(targetId),
                    nickname: targetNickname,
                    focusInput: true
                } 
            });
            document.dispatchEvent(event);
        } else if (event.target.matches('.invite-btn')) {
            fetchWithAuth(`${BACKEND}/connect/invite/`, {
                method: 'POST',
                body: JSON.stringify({
                    sender: id,
                    receiver: parseInt(targetId),
                })
            })
            .then(response => {
                if (response) {
                    const event = new CustomEvent('inviteUser', {
                        detail: {
                            sender: id,
                            receiver: parseInt(targetId),
                        }
                    });
                    document.dispatchEvent(event);
                } else {
                    console.error('Invite request failed');
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            new ProfileModal($container, wsManager, id, targetId, false);
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
                id = data.id;
                wsManager.sendMessage({ type: "friend_list", sender: id });
            })
            .catch(error => {
                console.error("[ setupUserListData ] ", error.message);
                new ErrorPage($container, error.status);
            });
        wsManager.addMessageHandler(function(data) {
            if (data.friendList) {
                setFriendList(data.friendList);
            }
        });
    }

    if (wsManager) {
        wsManager.addMessageHandler(function (data) {
            if (data.type === "invited") {
                const {sender, receiver, game_type, game_mode, sender_id, receiver_id} = data;
                new InviteModal($container, sender, receiver, game_type, game_mode, sender_id, receiver_id);
            }
        });
    }

    importCss("assets/css/user-list.css");
    render();
    setupEventListener();
    setupUserListData();
}
