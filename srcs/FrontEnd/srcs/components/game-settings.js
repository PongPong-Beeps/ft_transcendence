import {navigate} from "../utils/navigate.js";

/**
 * @param {HTMLElement} $container
 */
export default function GameSettings($container) {
    const render = () => {
        $container.querySelector('#main').innerHTML = `
            <div>GameSettings</div>
            <button id="next-btn">next</button>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('#next-btn').addEventListener('click', () => {
            navigate('tournament-room')
        });
    }

    render()
    setupEventListener()
}