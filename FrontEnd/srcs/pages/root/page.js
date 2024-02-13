import {navigate} from "../../utils/navigate.js";

export default function RootPage($container) {

    const render = () => {
        $container.innerHTML = `
        <button id="next">페이지 이동</button>
    `;
    }

    const setupEventListener = () => {
        $container.querySelector('#next').addEventListener('click', () => {
            navigate('/hello')
        });
    }

    render();
    setupEventListener();
}