### FrontEnd (개발 환경에서 웹페이지 접속하는 방법)
1. FrontEnd 디렉토리에 들어간다.
2. 아래의 명령어를 차례로 입력한다. (npm 설치 필요)
    - `npm install vite`
    - `npm install`
    - `npm run dev`
3. cmd + click 으로 접속 !

📌 참고 : 최초 실행 이후에는 `npm run dev`만 입력하시면 됩니다 !
### Git commit message template 이 적용되지 않을 때
아래의 명령어를 입력해서 정해진 템플릿을 깃 전역 커밋 템플릿으로 사용한다.
 - `git config --global commit.template .gitmessage.txt`

### BackEnd (개발 환경에서 웹페이지 접속하는 방법)
1. Root 디렉토리에 들어간다.
2. Makefile로 실행한다. (docker 설치 및 실행 필요)
    - `make` = 서버실행
    - `control + C`, `make down` = 종료시킬 때
* 클러스터 아이맥이 아닌 개인 컴퓨터 실행시 database폴더 권한 문제로 메이크파일이 실행 안될경우
    - Makefile에 해당 문구 추가 `#sudo chmod -R 777 $(DB_VOLUME)`
3. 웹페이지 접속 `https://127.0.0.1`
4. 어드민 페이지 `http://127.0.0.1:8000/admin`
    - id = `admin`
    - pw = `1234`