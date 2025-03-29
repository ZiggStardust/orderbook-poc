import { OrderBook } from "@/types/order-book";

export enum WebSocketMessageType {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    MESSAGE = "message",
    ASSET_PRICE = "asset_price",
    ORDER_BOOK_UPDATE = "order_book_update",
}

type WebSocketMessage = {
    type: WebSocketMessageType;
    data: OrderBook;
}

export type { WebSocketMessage };