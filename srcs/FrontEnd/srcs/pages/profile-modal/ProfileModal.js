import BlacklistCell from "./BlacklistCell.js";
import InfoTab from "./InfoTab.js";
import {importCss} from "../../utils/importCss.js";
import useState from "../../utils/useState.js";
import {BACKEND, fetchWithAuth, fetchWithAuthFormData} from "../../api.js";
import ErrorPage from "../ErrorPage.js";
import HistoryTab from "./HistoryTab.js";

/**
 * @param {HTMLElement} $container
 * @param {string} nickname
 * @param {boolean} isMe
 */
export default function ProfileModal($container, nickname, isMe) {
    let [getHistory, setHistory] = useState([{}], this, 'renderHistory');
    let [getBlacklist, setBlacklist] = useState([{}], this, 'renderBlacklist');
    let [getInfo, setInfo] = useState({}, this, 'renderInfo');
    const blockButtonText = '차단';

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
                            <button class="non-outline-btn" id="block-btn">${blockButtonText}</button>
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

    this.handleImageChange = function() {
        let formData = new FormData();
        if (this.files.length > 0) {
            formData.append('image', this.files[0]);
        }
        fetchWithAuthFormData(`${BACKEND}/user/me/image/`, {
            method: 'POST',
            body: formData,
        })
        .then(data => {
            console.log('Success:', data);
            fetchProfileModalData();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    this.renderInfo = () => {
        const infoTabContainer = $container.querySelector('#info-content');
        if (infoTabContainer) {
            let infoData = getInfo();
            infoTabContainer.innerHTML = InfoTab(isMe, infoData);
            if (infoData.block)
                $container.querySelector('#block-btn').innerHTML = '차단 해제';
            let inputElement = $container.querySelector('#profile-picture-input');
            if (inputElement) { // Add this condition
                inputElement.addEventListener('change', this.handleImageChange);
            };
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
            if (getBlacklist().length === 0) {
                blacklist.innerHTML = '<div id="blacklist-message">블랙리스트가 비어있습니다</div>';
            }
            getBlacklist().forEach(blacklist => {
                const cell = $container.querySelector(`[data-nickname="${blacklist.nickname}"]`);
                if (cell) {
                    cell.querySelector('.unblock-btn').addEventListener('click', (event) => {
                        event.stopPropagation();
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
                if ($container.querySelector('#block-btn').innerHTML === '차단 해제') {
                    console.log(nickname);
                    handleUnBlockButtonClick(nickname);
                } else {
                    handleBlockButtonClick();
                }
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
            $container.querySelector('#block-btn').innerHTML = '차단 해제';
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
            $container.querySelector('#block-btn').innerHTML = '차단';
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

    const highlightInputBox = (inputBox) => {
        inputBox.classList.add('input-highlight');
        setTimeout(() => {
            inputBox.classList.remove('input-highlight');
        }, 1000);
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
        const option = {
            method: 'POST',
            body: JSON.stringify({ nickname: nickname }),
        };

        if (isMe) {
            updateBlacklist();
        } else {
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
            });

        fetchWithAuth(`${BACKEND}/user/info/`, option)
            .then(data => {
                setInfo(data);
                console.log("[ fetchInfoData ] 정보 패치 완료");
            })
            .catch(error => {
                console.error("[ fetchInfoData ] " + error.message);
                new ErrorPage($container, error.status);
            });
    };

    importCss("assets/css/profile-modal.css");
    render();
    setupEventListener();
    fetchProfileModalData();
}
