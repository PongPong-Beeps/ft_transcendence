import FriendCell from "./FriendCell.js";
import ProfileModal from "../../pages/profile-modal/ProfileModal.js";
import { importCss } from "../../utils/importCss.js";
import ErrorPage from "../../pages/ErrorPage.js";
import UserCell from "./UserCell.js";
import useState from "../../utils/useState.js";
import getCookie from "../../utils/cookie.js";

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
        friendsListTab.innerHTML = friendListData
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
        const nickname = userCell.getAttribute('data-nickname');
        if (event.target.matches('.dm-btn')) {
            alert(`${nickname}에게 귓속말`);
        } else if (event.target.matches('.invite-btn')) {
            alert(`${nickname} 초대`);
        } else {
            new ProfileModal($container, nickname, false);
        }
    };

    const toggleUserListByButton = (selectedButton) => {
        selectedButton.classList.add('selected');
        const showListId = selectedButton.id === 'friend-btn' ? 'friend-list-tab' : 'all-user-list-tab';
        $container.querySelectorAll('.user-list-tab').forEach(list => {
            list.style.display = list.id === showListId ? 'block' : 'none';
        });
    };

    // // 웹소켓으로 변경해야 합니다 !!!
    async function fetchUserList() {
        try {
            let response = await fetch("https://127.0.0.1/api/user/list", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${getCookie("access_token")}`,
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
            });

            // 액세스 토큰 만료 처리
            if (response.status === 401) {
                const refreshTokenResponse = await fetch('https://127.0.0.1/api/token/refresh/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie("csrftoken")
                    },
                    body: JSON.stringify({'refresh': getCookie("refresh_token")})
                });

                if (!refreshTokenResponse.ok) throw new Error(response.status);

                // 새 토큰으로 원본 요청 재시도
                response = await fetch("https://127.0.0.1/api/user/list", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${getCookie("access_token")}`,
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookie("csrftoken"),
                    },
                });
            }

            if (!response.ok) throw new Error(response.status);

             // 데이터 파싱
            return await response.json(); // 최종 데이터 반환
        } catch (error) {
            throw error; // 오류 발생시 상위로 전파
        }
    }

    importCss("assets/css/user-list.css");
    render();
    setupEventListener();
    this.renderFriendList(); // 임시
    fetchUserList()
        .then(data => {
            setAllUserList(data.userList); // 사용자 목록 설정
        })
        .catch(error => {
            console.error("Failed to fetch user list: ", error.errorCode);
            new ErrorPage($container, error.errorCode);
        });
}
