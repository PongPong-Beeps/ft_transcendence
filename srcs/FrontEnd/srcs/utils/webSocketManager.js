export class WebSocketManager {
    constructor(ws) {
        this.ws = ws;
        this.messageHandlers = [];
        this.ws.onmessage = (event) => {
            if (event.data !== undefined) {
                console.log("this is event data : ", event.data);
                const data = JSON.parse(event.data);
                this.messageHandlers.forEach(handler => handler(data));
            }
        };
        this.ws.onclose = () => {
            this.removeMessageHandler();
        };
    }

    addMessageHandler(handler) {
        this.messageHandlers.push(handler);
    }
    
    removeMessageHandler() {
        this.messageHandlers = [];
    }

    sendMessage(data) {
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
}