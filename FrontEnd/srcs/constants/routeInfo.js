import RootPage from "../pages/root/page.js"
import LobbyPage from "../pages/lobby/page.js";
import TournamentRoomPage from "../pages/tournament-room/page.js";
import VsRoomPage from "../pages/vs-room/page.js";
import TournamentSchedulePage from "../pages/tournament-schedule/page.js";
import VsSchedulePage from "../pages/vs-schedule/page.js";
import TournamentGamePage from "../pages/tournament-game/page.js";
import VsGamePage from "../pages/vs-game/page.js";
import TournamentResultPage from "../pages/tournament-result/page.js";
import VsResultPage from "../pages/vs-result/page.js";

export const routes = [
    {path: /^\/$/, page: RootPage},
    {path: /^\/lobby$/, page: LobbyPage},
    // {path: /^\/profile$/, page: ProfilePage},
    {path: /^\/tournament-room$/, page: TournamentRoomPage},
    {path: /^\/vs-room$/, page: VsRoomPage},
    {path: /^\/tournament-schedule$/, page: TournamentSchedulePage},
    {path: /^\/vs-schedule$/, page: VsSchedulePage},
    {path: /^\/tournament-game$/, page: TournamentGamePage},
    {path: /^\/vs-game$/, page: VsGamePage},
    {path: /^\/tournament-result$/, page: TournamentResultPage},
    {path: /^\/vs-result$/, page: VsResultPage}

]