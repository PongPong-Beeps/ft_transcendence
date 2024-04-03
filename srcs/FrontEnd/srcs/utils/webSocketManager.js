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
    }

    addMessageHandler(handler) {
        this.messageHandlers.push(handler);
    }
    
    removeMessageHandler() {
        this.messageHandlers = [];
    }

    sendMessage(data) {
        this.ws.send(JSON.stringify(data));
    }
}