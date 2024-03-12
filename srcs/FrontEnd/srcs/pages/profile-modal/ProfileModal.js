import BlacklistCell from "./BlacklistCell.js";
import InfoTab from "./InfoTab.js";
import {importCss} from "../../utils/importCss.js";
import useState from "../../utils/useState.js";
import {BACKEND, fetchWithAuth} from "../../api.js";
import ErrorPage from "../ErrorPage.js";
import HistoryTab from "./HistoryTab.js";

/**
 * @param {HTMLElement} $container
 * @param {string} nickname
 * @param {boolean} isMe
 */
export default function ProfileModal($container, nickname, isMe) {
    let [getHistory, setHistory] = useState([{}], this, 'renderHistory');
    let [getBlacklist, setBlacklist] = useState([{}], this, 'renderBlacklist')

    const render = () => {
        const page = $container.querySelector('#page');
        if (page) {
            page.innerHTML = `
                <div id="profile-modal-background">
                    <div id="profile-modal-container">
                        <div id="profile-modal-title"><img src="../../../assets/image/profile.png" alt="profile title"></div>
                        <div id="profile-modal-tab-container">
                            <div id="profile-modal-tab-button-container">
                                <button class="profile-modal-tab-button non-outline-btn" id="info-btn">정보</button>
                                <button class="profile-modal-tab-button non-outline-btn" id="history-btn">전적</button>
                                <button class="profile-modal-tab-button non-outline-btn" id="blacklist-btn">블랙리스트</button>
                            </div>
                            <div id="profile-modal-tab-content-container">
                                <div class="profile-modal-tab-content" id="info-content"></div>
                                <div class="profile-modal-tab-content" id="history-content"></div>
                                <div class="profile-modal-tab-content" id="blacklist-content"></div>
                            </div>
                        </div>
                        <div id="profile-modal-button-container">
                            ${isMe ? '<button class="non-outline-btn" id="ok-btn">확인</button>' : `
                            <button class="non-outline-btn" id="block-btn">차단</button>
                            <button class="non-outline-btn" id="add-friend-btn">친구 추가</button>
                            <button class="non-outline-btn" id="ok-btn">확인</button>
                            `}
                        </div>
                    </div>
                </div>
            `;
            page.style.display = 'block';
            const infoButton = $container.querySelector('#info-btn');
            toggleProfileModalTabContentByButton(infoButton); // 초기 설정
        }

    };

    this.renderHistory = () => {
        const historyTabContainer = $container.querySelector('#history-content');
        if (historyTabContainer) {
            historyTabContainer.innerHTML = HistoryTab(getHistory());
        }
    };

    this.renderBlacklist = () => {
        const blacklist = $container.querySelector('#blacklist-content');
        if (blacklist) {
            blacklist.innerHTML = getBlacklist().map(blacklist => BlacklistCell(blacklist.nickname)).join('');
            getBlacklist().forEach(blacklist => {
                const cell = $container.querySelector(`[data-nickname="${blacklist.nickname}"]`);
                if (cell) {
                    cell.querySelector('.unblock-btn').addEventListener('click', (event) => {
                        event.stopPropagation(); // 이벤트 전파를 막음
                        handleUnBlockButtonClick(blacklist.nickname);
                    });
                }
            }
            );
        }
    }           

    const setupEventListener = () => {
        const profileModalContainer = $container.querySelector('#profile-modal-container');
        profileModalContainer.addEventListener('click', (event) => {
            if (event.target.closest('.profile-modal-tab-button')) {
                handleProfileModalTabButtonClick(event);
            } else if (event.target.closest('#ok-btn')) {
                $container.querySelector('#page').style.display = 'none';
            } else if (event.target.closest('#nickname-submit-btn')) {
                handleUpdateNicknameButtonClick(event.target);
            } else if (event.target.closest('#block-btn')) {
                handleBlockButtonClick();
            }
        });
    };
    
    const handleBlockButtonClick = () => {
        const toBlock = { "nickname": nickname };
        fetchWithAuth(`${BACKEND}/user/block/`, {
            method: 'POST',
            body: JSON.stringify(toBlock),
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    const handleUnBlockButtonClick = (unblockNickname) => {
        const toUnBlock = { "nickname": unblockNickname };
        fetchWithAuth(`${BACKEND}/user/unblock/`, {
            method: 'POST',
            body: JSON.stringify(toUnBlock),
        })
        .then(data => {
            updateBlacklist();
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    const handleProfileModalTabButtonClick = (event) => {
        const button = event.target;
        $container.querySelectorAll('.profile-modal-tab-button').forEach(btn => {
            btn.classList.remove('selected')
        });
        toggleProfileModalTabContentByButton(button);
    };

    const toggleProfileModalTabContentByButton = (selectedButton) => {
        selectedButton.classList.add('selected');
        const selectedTabId = selectedButton.id.replace('-btn', '-content');
        $container.querySelectorAll('.profile-modal-tab-content').forEach(tab => {
            tab.style.display = tab.id === selectedTabId ? 'block' : 'none';
        });
    };

    const handleUpdateNicknameButtonClick = (button) => {
        const nicknameInput = $container.querySelector('#nickname-input');
        if (nicknameInput/* && nicknameInput.value !== nickname*/) {
            fetchWithAuth(`${BACKEND}/user/me/nickname/`, {
                method: 'POST',
                body: JSON.stringify({ nickname: nicknameInput.value }),
            })
                .then(() => {
                    nicknameInput.placeholder = nicknameInput.value;
                    highlightInputBox(nicknameInput);
                    console.log("[ fetchNickname ] 닉네임 변경 완료");
                })
                .catch(error => {
                    switch (error.status) {
                        case 400:
                            nicknameInput.placeholder = "기존 닉네임과 동일";
                            break;
                        case 401:
                            nicknameInput.placeholder = "이미 존재하는 닉네임";
                            break;
                        case 402:
                            nicknameInput.placeholder = "2~8글자 사이로 입력";
                            break;
                        case 403:
                            nicknameInput.placeholder = "숫자, 영어, 한글만 입력";
                            break;
                        default:
                            console.error("[ fetchNickname ] " + error.message);
                            new ErrorPage($container, error.status);
                            return;
                    }
                    nicknameInput.value = "";
                    shakeButton(button);
                })
        }
    };

    const shakeButton = (button) => {
        button.classList.add('shake-animation');
        setTimeout(() => {
            button.classList.remove('shake-animation');
        }, 500);
    };

    const updateInfo = () => {
        const infoTabContainer = $container.querySelector('#info-content');
        let image = "";
        let option = {};
        let data = [];
        option = {
            method: 'POST',
            body: JSON.stringify({ nickname: nickname }),
        };
        try {
            let data = await fetchWithAuth(`${BACKEND}/user/info/`, option);
            image = data.image ? 'data:image/jpeg;base64,' + data.image : "../../../assets/image/cruiser.gif";
        } catch (error) {
            console.error('Error:', error);
        }
        if (infoTabContainer) {
            infoTabContainer.innerHTML = InfoTab(nickname, isMe, data, image);
        }
    }

    const updateBlacklist = () => {
        fetchWithAuth(`${BACKEND}/user/blacklist/`)
            .then(data => {
                setBlacklist(data.blacklist);
                console.log("[ updateBlacklist ] 블랙리스트 패치 완료");
            })
            .catch(error => {
                console.error("[ updateBlacklist ] " + error.message);
                new ErrorPage($container, error.status);
            });
    }

    const fetchProfileModalData = () => {
        let option = {};
        if (isMe) {
            updateBlacklist();
        } else {
            option = {
                method: 'POST',
                body: JSON.stringify({ nickname: nickname }),
            };
            $container.querySelector('#blacklist-btn').classList.add('hidden');
        }
        // 데이터 채우기
        fetchWithAuth(`${BACKEND}/user/history/`, option)
            .then(data => {
                setHistory(data.history);
                console.log("[ fetchHistoryData ] 전적 리스트 패치 완료");
            })
            .catch(error => {
                console.error("[ fetchHistoryData ] " + error.message);
                new ErrorPage($container, error.status);
            })
        updateInfo();
    };

    importCss("assets/css/profile-modal.css");
    render();
    setupEventListener();
    fetchProfileModalData();
}
