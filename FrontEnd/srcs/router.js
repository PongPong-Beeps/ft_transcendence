import { routes } from "./constants/routeInfo.js";

/**
 * @param {HTMLElement} $container
 * @description URL 변경을 감지하고 해당하는 페이지 컴포넌트를 렌더링
 */
export default function Router($container) {
    const findMatchedRoute = () =>
        routes.find((route) =>
            route.path.test(location.pathname)
        );

    const route = () => {
        const TargetPage = findMatchedRoute()?.page;
        new TargetPage($container);
    };

    const setupEventListener = () => {
        // 페이지 이동
        window.addEventListener("historyChanged", ({ detail }) => {
            const { to } = detail;

            if (to === location.pathname) { // 같은 페이지로 이동 시 히스토리를 쌓지 않음
                history.replaceState(null, "", to);
            } else {
                history.pushState(null, "", to);
                route();
            }
        });
        // 뒤로 가기
        window.addEventListener("popstate", () => {
            route();
        });
    }

    setupEventListener();
    route();
}
