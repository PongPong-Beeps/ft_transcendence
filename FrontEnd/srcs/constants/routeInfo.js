import Chat from "../components/chat.js";
import GameSettings from "../components/game-settings.js";
import TournamentRoom from "../components/tournament-room.js";
import UserList from "../components/user-list.js";
import Login from "../headers/login.js";
import Logo from "../headers/logo.js";

export const routes = [
    {path: /^\/$/, layout: "full", header: Login},
    {path: /^\/lobby$/, layout: "grid", header: Logo, components: { menu: UserList, main: GameSettings, footer: Chat }},
    {path: /^\/tournament-room$/, layout: "grid", header: Logo, components: { menu: UserList, main: TournamentRoom, footer: Chat }},
]