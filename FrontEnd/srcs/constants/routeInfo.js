import RootPage from "../pages/root/page.js"
import HelloPage from "../pages/hello/page.js";

export const routes = [
    {path: /^\/$/, page: RootPage},
    {path: /^\/hello$/, page: HelloPage}
]