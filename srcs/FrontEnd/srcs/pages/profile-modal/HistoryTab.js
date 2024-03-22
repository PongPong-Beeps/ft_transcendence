export default function HistoryTab(historyData) {
    if (historyData.length === 0) {
        return `<div id="history-message">데이터가 없습니다</div>`;
    }

    let tableRows = historyData.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.opponent}</td>
            <td>${item.matchType === "1vs1" ? '<img src="../../../assets/image/one_to_one.png" alt="vs">' : '<img src="../../../assets/image/tournament.png" alt="tournament">'}</td>
            <td style="color: ${item.result === "승" ? '#2A46D9' : '#E73C3C'}">${item.result}</td>
        </tr>
    `).join('');

    return `
        <table>
            <thead>
                <tr>
                    <th>날짜</th>
                    <th>상대</th>
                    <th>매치 종류</th>
                    <th>결과</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}