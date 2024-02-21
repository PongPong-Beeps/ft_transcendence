/**
 * @param {HTMLElement} $container
 */
export default function Chat($container) {
    const render = () => {
        $container.querySelector("#footer").innerHTML = `
            <link rel="stylesheet" href="../../../assets/css/chat.css">
            <div id="Chat">
                <div class="container">
                    <div class="chat-box">
                        <div id="chat-messages"></div>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">To</button>
                                <div class="dropdown-menu">
                                    <a class="dropdown-item" href="#">User 1</a>
                                    <a class="dropdown-item" href="#">User 2</a>
                                    <a class="dropdown-item" href="#">User 3</a>
                                </div>
                            </div>
                            <input type="text" id="message-input" class="form-control" placeholder="채팅 입력..">
                            <div class="input-group-append">
                                <button id="send-button" class="btn btn-outline-secondary" type="button">전송</button>     
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
    };
    render();
}