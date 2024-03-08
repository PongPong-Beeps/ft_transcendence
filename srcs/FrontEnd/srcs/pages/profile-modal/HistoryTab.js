export default function HistoryTab() {
    return `
        <div id="history-message">데이터가 없습니다</div>
        <div id="history-table">
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
                </tbody>
            </table>
        </div>
    `;
}