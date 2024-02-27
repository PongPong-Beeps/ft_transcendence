/**
 * @param  { string } path
 */
export const importCss = (path) => {
    // 문서 내의 모든 link 태그를 찾음
    const links = document.getElementsByTagName('link');
    let isCSSLinked = false;

    // 각 link 태그를 순회하며 해당 CSS 파일이 이미 링크되어 있는지 확인
    for (let i = 0; i < links.length; i++) {
        if (links[i].getAttribute('href') === path) {
            isCSSLinked = true;
            break;
        }
    }

    // CSS 파일이 링크되어 있지 않은 경우, 새로운 link 태그를 생성하여 문서의 head에 추가
    if (!isCSSLinked) {
        const head = document.getElementsByTagName('head')[0];
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = path;
        head.appendChild(link);
    }
};
