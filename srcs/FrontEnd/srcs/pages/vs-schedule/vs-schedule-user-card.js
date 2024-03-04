export default function VsScheduleUserCard(name, profileImg) {
   return `
        <div id="VsScheduleUserCard" class="card">
            <div class="profile-image">
                <img src="${profileImg[0].image}" alt="${profileImg[0].label}"/>
            </div>
            <div class="user-name">${name}</div>
        </div>
  `;
}