export default function VsScheduleUserCard(name, playerImg) {
   return `
        <div id="VsScheduleUserCard" class="card">
            <div class="profile-image">
                <img src="${playerImg}" alt="playerImg"/>
            </div>
            <div class="user-name">${name}</div>
        </div>
  `;
}