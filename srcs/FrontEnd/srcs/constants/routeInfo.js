import Chat from "../components/Chat.js";
import DisplayBoard from "../components/DisplayBoard.js";
import GameSettings from "../components/game-settings/GameSettings.js";
import TournamentRoom from "../components/game-room/TournamentRoom.js";
import UserList from "../components/user-list/UserList.js";
import LoginPage from "../pages/LoginPage.js";
import VsRoom from "../components/game-room/VsRoom.js";
import VsSchedule from "../pages/vs-schedule/VsSchedule.js";
import AuthPage from "../pages/AuthPage.js";
import Practice from "../components/game/practice.js";

export const routes = [
    {path: /^\/$/, layout: "full", page: LoginPage},
    {path: /^\/auth$/, layout: "full", page: AuthPage},
    {path: /^\/lobby$/, layout: "grid", components: { menu: UserList, main: GameSettings, footer: Chat }},
    {path: /^\/practice$/, layout: "grid", components: { menu: UserList, main: Practice, footer: Chat }},
    {path: /^\/tournament-room$/, layout: "grid", components: { menu: UserList, main: TournamentRoom, footer: Chat }},
    {path: /^\/vs-room$/, layout: "grid", components: { menu: UserList, main: VsRoom, footer: Chat }},
    {path: /^\/vs-game$/, layout: "grid", components: { menu: UserList, main: VsRoom, footer: DisplayBoard }},
    {path: /^\/vs-schedule$/, layout: "full", page: VsSchedule},
]