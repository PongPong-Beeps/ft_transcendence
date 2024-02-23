import {navigate} from "../utils/navigate.js";

/**
 * @param {HTMLElement} $container
 */
export default function ProfileModal($container) {
    const render = () => {
        $container.querySelector('#page').innerHTML = `
            <link rel="stylesheet" href="../../assets/css/profile-modal.css">
            <div id="background">
                <div id="container">
                    <button id="ok-btn" class="green-btn">확인</button>
                </div>
            </div>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('#ok-btn').addEventListener('click', () => {
            $container.querySelector('#page').style.display = 'none'
        });
    }

    render()
    setupEventListener()
}