/**
 * @param {HTMLElement} $container
 */
export default function MyProfile($container) {
    const render = () => {
        $container.querySelector('#profile').innerHTML = `
            <div id="ex">MyProfile</div>
            <button id="button">hi</button>
        `;
    }

    const setupEventListener = () => {
        $container.querySelector('#button').addEventListener('click', () => {
            $container.querySelector('#ex').innerHTML = `hihi`;
        });
    }

    alert('myprofile generated')
    render()
    setupEventListener()
}