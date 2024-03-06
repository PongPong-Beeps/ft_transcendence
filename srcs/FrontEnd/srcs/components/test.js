export default function TestButton($container) {
    const button = document.createElement('button');
    button.id = 'back-test-btn';
    button.textContent = '테스트';
    $container.appendChild(button);

    button.addEventListener('click', () => {
        alert('테스트 버튼이 클릭되었습니다!');
    });
}