import FriendCell from "./friend-cell.js";

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
            <link rel="stylesheet" href="../../../assets/css/user-list.css">
            <div id="user-list-container">
                <div id="user-list-button-container">
                    <button class="user-list-button" id="friends-btn" data-selected="true">친구</button>
                    <button class="user-list-button" id="all-btn" data-selected="false">전체</button>
                </div>
                <div id="user-list-list-container">
                    <div id="friends-list" class="list"></div>
                    <div id="all-list" class="list" style="display: none;">
                        <div class="user">사용자 1</div>
                        <div class="user">사용자 2</div>
                    </div>
                </div>
            </div>
        `;
    }

    const updateFriendList = () => {
        const friendsList = $container.querySelector('#friends-list');
        if (friendsList) {
            friendsList.innerHTML = friendListData.map(friend => FriendCell(friend.nickname, friend.isOnline)).join('');
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
    }

    render();
    updateFriendList(); // 데이터 기반으로 친구 목록 업데이트
    setupEventListener();

    // 초기 선택 상태 설정
    const friendsBtn = $container.querySelector('#friends-btn');
    if (friendsBtn) {
        friendsBtn.click();
    }
}
