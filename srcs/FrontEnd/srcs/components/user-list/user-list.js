import FriendCell from "./friend-cell.js";
import ProfileModal from "../../pages/profile-modal/profile-modal.js";
import { importCss } from "../../utils/import-css.js";
import Error from "../../pages/error.js";
import UserCell from "./user-cell.js";
// import { getCookie } from "../../utils/cookie.js";
import getCookie from "../../utils/cookie.js";

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
    { nickname: "친구 6", isOnline: false },
  ];
  let userListData = [];

//   const userListData = [
//     { nickname: "유저 1" },
//     { nickname: "유저 2" },
//     { nickname: "유저 3" },
//     { nickname: "유저 4" },
//     { nickname: "유저 5" },
//     { nickname: "유저 6" },
//     { nickname: "유저 7" },
//     { nickname: "유저 8" },
//     { nickname: "유저 9" },
//     { nickname: "유저 10" },
//     { nickname: "유저 11" },
//     { nickname: "유저 12" },
//   ];

  fetch("https://127.0.0.1/api/user/list", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getCookie("access_token")}`,
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
  })
  .then(response => {
    if (response.status === 401) {
        return fetch('https://127.0.0.1/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie("csrftoken")
            },
            body: JSON.stringify({
                'refresh': getCookie("refresh_token")
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('New tokens:', data);
            return data;
        });
    } else {
        return response.json();
    }
})
    // .then((response) => response.json())
    .then((data) => {
        console.log(data);
    //   userListData = data.userList.map((user) => user.nickname);
      userListData = data.userList;
        console.log(userListData);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  const render = () => {
    $container.querySelector("#menu").innerHTML = `
            <div id="user-list-container">
                <div id="user-list-button-container">
                    <button class="user-list-button non-outline-btn" id="friends-btn">친구</button>
                    <button class="user-list-button non-outline-btn" id="all-btn">전체</button>
                </div>
                <div id="user-list-tab-container">
                    <div id="friend-list-tab" class="list-tab"></div>
                    <div id="user-list-tab" class="list-tab"></div>
                </div>
            </div>
        `;
  };

  const setupFriendList = () => {
    const friendsList = $container.querySelector("#friend-list-tab");
    if (friendsList) {
      friendsList.innerHTML = friendListData
        .map((friend) => FriendCell(friend.nickname, friend.isOnline))
        .join("");

      friendListData.forEach((friend) => {
        const cell = $container.querySelector(
          `[data-nickname="${friend.nickname}"]`
        );
        if (cell) {
          cell.addEventListener("click", () => {
            new ProfileModal($container, friend.nickname, false);
          });

          cell.querySelector(".dm-btn").addEventListener("click", (event) => {
            event.stopPropagation();
            alert(`${friend.nickname}에게 귓속말`);
          });
        }
      });
    }
  };

  const setupUserList = () => {
    const userList = $container.querySelector("#user-list-tab");
    if (userList) {
      userList.innerHTML = userListData
        .map((user) => UserCell(user.nickname))
        .join("");

      userListData.forEach((user) => {
        const cell = $container.querySelector(
          `[data-nickname="${user.nickname}"]`
        );
        if (cell) {
          cell.addEventListener("click", () => {
            new ProfileModal($container, user.nickname, false);
          });
        }
      });
    }
  };

  const toggleList = (showListId) => {
    document.querySelectorAll(".list-tab").forEach((list) => {
      list.style.display = list.id === showListId ? "block" : "none";
    });
  };

  const setupEventListener = () => {
    $container.querySelectorAll(".user-list-button").forEach((button) => {
      button.addEventListener("click", function () {
        $container.querySelectorAll(".user-list-button").forEach((btn) => {
          btn.dataset.selected = "false";
          btn.classList.remove("selected");
        });
        this.dataset.selected = "true";
        this.classList.add("selected");
        const listToShow =
          this.id === "friends-btn" ? "friend-list-tab" : "user-list-tab";
        toggleList(listToShow);
      });
    });
  };

  const init = () => {
    // 초기 선택 상태 설정
    const friendsBtn = $container.querySelector("#friends-btn");
    if (friendsBtn) {
      friendsBtn.click();
    }
  };

  importCss("assets/css/user-list.css");
  render();
  setupFriendList();
  setupUserList();
  setupEventListener();
  init();
}
