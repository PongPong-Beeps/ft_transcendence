import {navigate} from "../utils/navigate.js";

/**
 * @param {HTMLElement} $container
 */
export default function Login($container) {
    const render = () => {
        $container.querySelector('#page').innerHTML = `
            <div>Login</div>
            <button id="next">next</button>
<!--            <div style="position: fixed; top: 0; left: 0; height: 100vh; width: 100vw;"></div>-->
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('#next').addEventListener('click', () => {
           navigate('lobby');
        });
    }

    render()
    setupEventListener()
}