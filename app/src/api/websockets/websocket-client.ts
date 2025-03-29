import { webSocket } from "rxjs/webSocket";
import { WebSocketMessage } from "./websocket-types";

export const createWebsocketClient = () => {
    console.log("Creating websocket client");
    const ws = webSocket<WebSocketMessage>({
        url: 'ws://localhost:3001',
        openObserver: {
            next: () => {
                console.log("WebSocket connection established");
            },
        },
        closeObserver: {
            next: () => {
                console.log("WebSocket connection closed");
            },
        },
    });

    return ws;
}