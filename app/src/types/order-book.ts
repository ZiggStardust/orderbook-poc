export type OrderBook = {
    asks: {
        price: string;
        size: string;
        total: number;
    }[];
    bids: {
        price: string;
        size: string;
        total: number;
    }[];
}