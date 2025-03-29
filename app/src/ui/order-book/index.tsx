"use client";
import { useOrderBook } from "@/api/websockets/websocket-hooks";
import styles from "./OrderBook.module.css";
import { memo } from "react";

const ROWS_COUNT = 10; // for performance and to avoid layout flickering, assume the bids and asks are grouped in 10 rows

const OrderBookHeader = memo(() => {
  return (
    <div className={styles.orderBookHeader}>
      <div className={styles.orderBookHeaderItem}>Price</div>
      <div className={styles.orderBookHeaderItem}>Size</div>
      <div className={styles.orderBookHeaderItem}>Total</div>
    </div>
  );
});

OrderBookHeader.displayName = "OrderBookHeader";

const OrderBookRow = memo(({ price, size, total, type }: { price?: string; size?: string; total?: string; type: "ask" | "bid" }) => {
  const colorClass = type === "ask" ? "text-red-500" : "text-green-500";
  const hoverClass = type === "ask" ? "hover:bg-red-500/10" : "hover:bg-green-500/10";

  return (
    <div className={`${styles.orderBookRow} ${hoverClass}`}>
      <div className={`${styles.orderBookRowItem} ${colorClass}`}>{price || "-"}</div>
      <div className={styles.orderBookRowItem}>{size || "-"}</div>
      <div className={styles.orderBookRowItem}>{total || "-"}</div>
    </div>
  );
});

OrderBookRow.displayName = "OrderBookRow";

const OrderBookRows = memo(
  ({ data, type }: { data?: Array<{ price: string; size: string; total: number }> | undefined; type: "ask" | "bid" }) => {
    const rows = Array(ROWS_COUNT).fill(null);
    return (
      <>
        {rows.map((_, index) => (
          <OrderBookRow
            key={index}
            price={data?.[index]?.price}
            size={data?.[index]?.size}
            total={data?.[index]?.total?.toString()}
            type={type}
          />
        ))}
      </>
    );
  }
);

OrderBookRows.displayName = "OrderBookRows";

export const OrderBook = () => {
  const orderBook = useOrderBook();
  const asks = orderBook?.asks ?? [];
  const bids = orderBook?.bids ?? [];

  return (
    <div className={styles.container}>
      <div className={styles.orderBook}>
        <OrderBookHeader />
        <OrderBookRows data={asks} type="ask" />
        <OrderBookRows data={bids} type="bid" />
      </div>
    </div>
  );
};
