export class WebSocketManager {
    constructor(ws) {
        this.ws = ws;
        this.messageHandlers = [];
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(data));
        };
    }

    addMessageHandler(handler) {
        this.messageHandlers.push(handler);
    }

    sendMessage(data) {
        this.ws.send(JSON.stringify(data));
    }
}