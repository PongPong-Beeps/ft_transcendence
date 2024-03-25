import Chat from "../components/Chat.js";
import DisplayBoard from "../components/DisplayBoard.js";
import GameSettings from "../components/game-settings/GameSettings.js";
import UserList from "../components/user-list/UserList.js";
import LoginPage from "../pages/LoginPage.js";
import VsSchedule from "../pages/vs-schedule/VsSchedule.js";
import AuthPage from "../pages/AuthPage.js";
import Practice from "../components/game/practice.js";
import GameRoom from "../components/game-room/GameRoom.js";
import PlayerList from "../components/player-list/PlayerList.js";

export const routes = [
    {path: /^\/$/, layout: "full", page: LoginPage},
    {path: /^\/auth$/, layout: "full", page: AuthPage},
    {path: /^\/lobby$/, layout: "grid", components: { menu: UserList, main: GameSettings, footer: Chat }},
    {path: /^\/practice$/, layout: "grid", components: { menu: UserList, main: Practice, footer: Chat }},
    {path: /^\/game-room$/, layout: "grid", components: { menu: UserList, main: GameRoom, footer: Chat }},
    {path: /^\/game$/, layout: "grid", components: { menu: PlayerList, main: Practice, footer: DisplayBoard }},
    {path: /^\/vs-schedule$/, layout: "full", page: VsSchedule},
]