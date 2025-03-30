use serde::{Deserialize, Serialize};
use rand::Rng;
use chrono::{Local, Timelike};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderEntry {
    pub price: String,
    pub size: String,
    pub total: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderBook {
    pub asks: Vec<OrderEntry>,
    pub bids: Vec<OrderEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trade {
    pub price: String,
    pub size: String,
    pub time: String,
    pub side: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebSocketMessage {
    #[serde(rename = "type")]
    pub type_: String,
    pub data: WebSocketData,
} 

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum WebSocketData {
    OrderBook(OrderBook),
    Trade(Trade),
}

pub fn generate_order_book_data() -> OrderBook {
    let mut rng = rand::thread_rng();
    let base_price = 29340.0 + rng.gen::<f64>() * 10.0;
    let price_increment = 0.25;

    let mut asks = Vec::with_capacity(10);
    let mut bids = Vec::with_capacity(10);
    let mut ask_total = 0.0;
    let mut bid_total = 0.0;

    for i in 0..10 {
        let ask_size = rng.gen::<f64>() * 2.0;
        let bid_size = rng.gen::<f64>() * 2.0;

        ask_total += ask_size;
        bid_total += bid_size;

        asks.push(OrderEntry {
            price: format!("{:.2}", base_price + i as f64 * price_increment),
            size: format!("{:.2}", ask_size),
            total: (ask_total * 100.0).round() / 100.0,
        });

        bids.push(OrderEntry {
            price: format!("{:.2}", base_price - i as f64 * price_increment),
            size: format!("{:.2}", bid_size),
            total: (bid_total * 100.0).round() / 100.0,
        });
    }

    OrderBook { asks, bids }
}

pub fn generate_trade_data() -> Trade {
    let mut rng = rand::thread_rng();
    let base_price = 29340.0 + rng.gen::<f64>() * 10.0;
    let size = rng.gen::<f64>() * 0.5;
    let now = Local::now();
    
    Trade {
        price: format!("{:.2}", base_price),
        size: format!("{:.2}", size),
        time: format!("{}:{}:{}", now.hour(), now.minute(), now.second()),
        side: if rng.gen_bool(0.5) { "buy".to_string() } else { "sell".to_string() },
    }
} 