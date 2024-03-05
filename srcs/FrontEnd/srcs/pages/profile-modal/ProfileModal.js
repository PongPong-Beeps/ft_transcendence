import HistoryTable from "./HistoryTable.js";
import FriendCell from "../../components/user-list/FriendCell.js";
import BlacklistCell from "./BlacklistCell.js";
import InfoTab from "./InfoTab.js";
import {importCss} from "../../utils/importCss.js";

/**
 * @param {HTMLElement} $container
 * @param {string} nickname
 * @param {boolean} isMe
 */
export default function ProfileModal($container, nickname, isMe) {
    const historyDummyData = [
        { date: "23.02.01", opponent: "wooshin", matchType: "1vs1", result: "승" },
        { date: "23.01.30", opponent: "jikoo", matchType: "토너먼트", result: "패" },
        { date: "23.01.30", opponent: "jonchoi", matchType: "1vs1", result: "승" },
        { date: "23.01.30", opponent: "geonwule", matchType: "1vs1", result: "승" }
    ];

    const blacklistDummyData = [
        { nickname: "wooshin" },
        { nickname: "jikoo" },
        { nickname: "geonwule"},
        { nickname: "jonchoi"}
    ]

    const infoDummyData = [
        { totalWinRate: 50, oneOnOneWinRate: 34, tournamentWinRate: 100 }
    ]

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
                            <div id="profile-modal-tab">
                                <div id="info-tab-container"></div>
                                <div id="history-tab-container">${HistoryTable()}</div>
                                <div id="blacklist-tab-container"></div>
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
        }

    }

    const setupEventListener = () => {
        $container.querySelectorAll('.profile-modal-tab-button').forEach(button => {
            button.addEventListener('click', function() {
                let selectedTabId = this.id.replace('-btn', '-tab-container'); // 버튼 ID에서 탭 컨테이너 ID로 변환
                $container.querySelectorAll('.profile-modal-tab-button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                this.classList.add('selected');

                // 모든 탭 컨텐츠 숨기기
                $container.querySelectorAll('#profile-modal-tab > div').forEach(tab => {
                    tab.style.display = 'none';
                });

                // 선택된 탭 컨텐츠만 표시
                $container.querySelector(`#${selectedTabId}`).style.display = 'block';
            });
        });

        $container.querySelector('#ok-btn').addEventListener('click', () => {
            $container.querySelector('#page').style.display = 'none';
        });
    }

    const updateInfo = () => {
        const infoTabContainer = $container.querySelector('#info-tab-container');
        if (infoTabContainer) {
            infoTabContainer.innerHTML = InfoTab(nickname, isMe, infoDummyData[0]);
        }
    }

    const updateHistory = () => {
        const tableBody = $container.querySelector('#history-tab-container tbody');
        if (!tableBody) return; // tbody가 없으면 함수 종료
        tableBody.innerHTML = ''; // 기존의 테이블 내용을 클리어

        historyDummyData.forEach(item => {
            const row = document.createElement('tr');

            const dateCell = document.createElement('td');
            dateCell.textContent = item.date;
            row.appendChild(dateCell);

            const opponentCell = document.createElement('td');
            opponentCell.textContent = item.opponent;
            row.appendChild(opponentCell);

            // matchType에 따른 이미지 삽입
            const matchTypeCell = document.createElement('td');
            let matchTypeImage = document.createElement('img');
            if (item.matchType === "1vs1") {
                matchTypeImage.src = "../../../assets/image/vs.png"; // 1vs1 매치 이미지 경로
            } else if (item.matchType === "토너먼트") {
                matchTypeImage.src = "../../../assets/image/tournament.png"; // 토너먼트 매치 이미지 경로
            }
            matchTypeCell.appendChild(matchTypeImage);
            row.appendChild(matchTypeCell);

            // 결과에 따른 색상 적용
            const resultCell = document.createElement('td');
            resultCell.textContent = item.result;
            resultCell.style.color = item.result === "승" ? "#2A46D9" : "#E73C3C"; // 승리는 파란색, 패배는 빨간색
            row.appendChild(resultCell);

            tableBody.appendChild(row);
        });
    }

    const updateBlacklist = () => {
        const blacklist = $container.querySelector('#blacklist-tab-container');
        if (blacklist) {
            blacklist.innerHTML = blacklistDummyData.map(blacklist => BlacklistCell(blacklist.nickname)).join('');

            blacklistDummyData.forEach(blacklist => {
                const cell = $container.querySelector(`[data-nickname="${blacklist.nickname}"]`);
                if (cell) {
                    cell.querySelector('.unblock-btn').addEventListener('click', (event) => {
                        event.stopPropagation(); // 이벤트 전파를 막음
                        alert(`${blacklist.nickname} 차단해제`);
                    });
                }
            });
        }
    }

    const init = () => {
        // 초기 선택 상태 설정
        if (!isMe) {
            const blacklistBtn = $container.querySelector('#blacklist-btn');
            if (blacklistBtn) {
                blacklistBtn.classList.add('hidden');
            }
        }
        const infoBtn = $container.querySelector('#info-btn');
        if (infoBtn) {
            infoBtn.click(); // 초기 탭으로 정보 탭 설정
        }
        // 데이터 채우기
        updateInfo();
        updateHistory();
        updateBlacklist();
    }

    importCss("assets/css/profile-modal.css");
    render();
    setupEventListener();
    init();
}
