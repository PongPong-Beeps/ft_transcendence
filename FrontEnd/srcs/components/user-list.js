/**
 * @param {HTMLElement} $container
 */
export default function UserList($container) {
    const render = () => {
        $container.querySelector('#menu').innerHTML = `
            <div>UserList</div>
        `;
    }

    render()
}