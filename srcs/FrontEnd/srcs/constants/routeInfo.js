import Chat from "../components/chat.js";
import GameSettings from "../components/game-settings/game-settings.js";
import TournamentRoom from "../components/tournament-room.js";
import UserList from "../components/user-list/user-list.js";
import Login from "../headers/login.js";
import Logo from "../headers/logo.js";
import VsRoom from "../components/vs-room.js";

export const routes = [
    {path: /^\/$/, layout: "full", page: Login},
    {path: /^\/lobby$/, layout: "grid", page: Logo, components: { menu: UserList, main: GameSettings, footer: Chat }},
    {path: /^\/tournament-room$/, layout: "grid", page: Logo, components: { menu: UserList, main: TournamentRoom, footer: Chat }},
    {path: /^\/vs-room$/, layout: "grid", page: Logo, components: { menu: UserList, main: VsRoom, footer: Chat }},
]