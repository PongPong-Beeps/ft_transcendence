import { routes } from "./constants/routeInfo.js";
import MyProfile from "./components/MyProfile.js";
import Header from "./components/Header.js";
import ErrorPage from "./pages/ErrorPage.js";

/**
 * @param {HTMLElement} $container
 * @description URL 변경을 감지하고 해당하는 페이지 컴포넌트를 렌더링
 */
export default function Router($container) {
    let currentPage = undefined
    let currentHeader = undefined
    let currentMenu = undefined
    let currentProfile = undefined
    let currentMain = undefined
    let currentFooter = undefined

    const findMatchedTarget = () =>
        routes.find((route) =>
            route.path.test(location.pathname)
        );

    const clearCurrentState = () => {
        currentPage = undefined
        currentHeader = undefined
        currentMenu = undefined
        currentProfile = undefined
        currentMain = undefined
        currentFooter = undefined
    }

    const route = (data) => {
        if (location.pathname === "/") {
            clearCurrentState();
        }
        const target = findMatchedTarget();
        if (!target) {
            new ErrorPage($container, 404);
        } else if (target.layout === "full") {
            if (!(currentPage instanceof target.page)) currentPage = new target.page($container);
        } else if (target.layout === "grid") {
            if (currentPage) currentPage = undefined
            $container.querySelector('#page').style.display = "none";
            if (!(currentHeader instanceof Header)) currentHeader = new Header($container, data);
            if (!(currentMenu instanceof target.components.menu)) currentMenu = new target.components.menu($container, data);
            if (!(currentProfile instanceof MyProfile)) currentProfile = new MyProfile($container, data);
            if (!(currentMain instanceof target.components.main)) currentMain = new target.components.main($container, data);
            if (!(currentFooter instanceof target.components.menu)) currentFooter = new target.components.footer($container, data);
        }
    };

    const setupEventListener = () => {
        // navigate 함수를 통한 페이지 이동
        window.addEventListener("historyChanged", ({ detail }) => {
            const { to, data } = detail;
            history.pushState(null, "", to);
            route(data);
        });
        // 뒤로 가기
        window.addEventListener("popstate", () => {
            route();
        });
    }

    setupEventListener();
    route();
}
