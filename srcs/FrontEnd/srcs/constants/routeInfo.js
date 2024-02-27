import Chat from "../components/chat.js";
import DisplayBoard from "../components/display-board.js";
import GameSettings from "../components/game-settings/game-settings.js";
import TournamentRoom from "../components/tournament-room.js";
import UserList from "../components/user-list/user-list.js";
import Login from "../pages/login.js";
import VsRoom from "../components/vs-room.js";
import VsSchedule from "../pages/vs-schedule.js";

export const routes = [
    {path: /^\/$/, layout: "full", page: Login},
    {path: /^\/lobby$/, layout: "grid", components: { menu: UserList, main: GameSettings, footer: Chat }},
    {path: /^\/tournament-room$/, layout: "grid", components: { menu: UserList, main: TournamentRoom, footer: Chat }},
    {path: /^\/vs-room$/, layout: "grid", components: { menu: UserList, main: VsRoom, footer: Chat }},
    {path: /^\/vs-game$/, layout: "grid", components: { menu: UserList, main: VsRoom, footer: DisplayBoard }},
    {path: /^\/vs-schedule$/, layout: "full", page: VsSchedule},
]