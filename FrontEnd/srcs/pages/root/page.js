import {navigate} from "../../utils/navigate.js";

export default function RootPage($container) {

    const render = () => {
        $container.innerHTML = `
            <button id="next">시작</button>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('#next').addEventListener('click', () => {
           navigate('lobby')
        });
    }

    render();
    setupEventListener();
}