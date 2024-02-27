import { routes } from "./constants/routeInfo.js";
import MyProfile from "./components/my-profile.js";

/**
 * @param {HTMLElement} $container
 * @description URL 변경을 감지하고 해당하는 페이지 컴포넌트를 렌더링
 */
export default function Router($container) {
    let currentPage = undefined
    let currentMenu = undefined
    let currentProfile = undefined
    let currentMain = undefined
    let currentFooter = undefined

    const findMatchedTarget = () =>
        routes.find((route) =>
            route.path.test(location.pathname)
        );

    const route = (data) => {
        const target = findMatchedTarget();
        if (target.layout === "full") {
            if (!(currentPage instanceof target.page)) currentPage = new target.page($container);
            $container.querySelector('#page').style.display = "block";
        } else if (target.layout === "grid") {
            if (currentPage) currentPage = undefined
            $container.querySelector('#page').style.display = "none";
            if (!(currentMenu instanceof target.components.menu)) currentMenu = new target.components.menu($container);
            if (!(currentProfile instanceof MyProfile)) currentProfile = new MyProfile($container);
            if (!(currentMain instanceof target.components.main)) currentMain = new target.components.main($container, data);
            if (!(currentFooter instanceof target.components.menu)) currentFooter = new target.components.footer($container);
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
