import Chat from "../components/chat.js";
import GameSettings from "../components/game-settings.js";
import TournamentRoom from "../components/tournament-room.js";
import UserList from "../components/user-list.js";
import Login from "../pages/login.js";
import LogoBackground from "../pages/logo-background.js";

export const routes = [
    {path: /^\/$/, layout: "full", page: Login},
    {path: /^\/lobby$/, layout: "grid", page: LogoBackground, components: { menu: UserList, main: GameSettings, footer: Chat }},
    {path: /^\/tournament-room$/, layout: "grid", page: LogoBackground, components: { menu: UserList, main: TournamentRoom, footer: Chat }},
]