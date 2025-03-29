import { atom } from "jotai";
import { OrderBook } from "@/types/order-book";

export const OrderBookAtom = atom<OrderBook | null>(null);