'use client'
import { useRef, useEffect } from "react";
import { createWebsocketClient } from "./websocket-client";
import { WebSocketSubject } from "rxjs/webSocket";
import { filter, throttleTime, bufferTime, map } from "rxjs/operators";
import { useAtom } from "jotai";
import { WebSocketMessage, WebSocketMessageType } from "./websocket-types";
import { OrderBookAtom } from "./websocket-atoms";

export const useWebsocketConnection = () => {
    const webSocketClientRef = useRef<WebSocketSubject<WebSocketMessage> | null>(null);
    const [, setOrderBook] = useAtom(OrderBookAtom);
    // const [messageRate, setMessageRate] = useState<number>(0);

    useEffect(() => {
        if (!webSocketClientRef.current) {
            webSocketClientRef.current = createWebsocketClient();

            const messageCounter = webSocketClientRef.current.pipe(
                filter((message: WebSocketMessage) => message.type === WebSocketMessageType.ORDER_BOOK_UPDATE),
                bufferTime(1000),
                map(messages => messages.length)
            );

            const orderBookObservable = webSocketClientRef.current.pipe(
                filter((message: WebSocketMessage) => message.type === WebSocketMessageType.ORDER_BOOK_UPDATE),
                throttleTime(150)
            );

            const counterSubscription = messageCounter.subscribe({
                next: (count) => {
                    console.log(`messages received in last second: ${count}`);
                }
            });

            // Subscribe to order book updates
            const orderBookSubscription = orderBookObservable.subscribe({
                next: (message) => {
                    setOrderBook(message.data);
                }
            });

            return () => {
                counterSubscription.unsubscribe();
                orderBookSubscription.unsubscribe();
                webSocketClientRef.current?.complete();
                webSocketClientRef.current = null;
            };
        }
    }, []);

}

export const useOrderBook = () => {
    const [orderBook] = useAtom(OrderBookAtom);
    return orderBook;
}