mod order_book;

use futures::{SinkExt, StreamExt};
use log::*;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::RwLock;
use tokio::time::{interval, Duration};
use tokio_tungstenite::tungstenite::Message;
use std::collections::HashMap;
use order_book::{WebSocketMessage, WebSocketData};

type ClientMap = Arc<RwLock<HashMap<SocketAddr, ClientConnection>>>;

struct ClientConnection {
    sender: tokio::sync::mpsc::UnboundedSender<Message>,
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let addr = "127.0.0.1:3001";
    let clients: ClientMap = Arc::new(RwLock::new(HashMap::new()));
    
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind");
    info!("WebSocket server listening on: {}", addr);

    while let Ok((stream, addr)) = listener.accept().await {
        let clients = clients.clone();
        tokio::spawn(async move {
            handle_connection(stream, addr, clients).await;
        });
    }
}

async fn handle_connection(stream: TcpStream, addr: SocketAddr, clients: ClientMap) {
    let ws_stream = tokio_tungstenite::accept_async(stream)
        .await
        .expect("Error during WebSocket handshake");
    
    info!("New WebSocket connection: {}", addr);

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();

    clients.write().await.insert(
        addr,
        ClientConnection {
            sender: tx.clone(),
        },
    );

    // Start sending order book updates
    let tx_clone = tx.clone();
    tokio::spawn(async move {
        let mut interval = interval(Duration::from_micros(1)); // 0.01ms interval
        loop {
            interval.tick().await;
            
            let order_book = order_book::generate_order_book_data();
            let message = WebSocketMessage {
                type_: "order_book_update".to_string(),
                data: WebSocketData::OrderBook(order_book),
            };
            
            let json = serde_json::to_string(&message).unwrap();
            if tx_clone.send(Message::Text(json)).is_err() {
                break;
            }
        }
    });

    // Handle incoming messages
    let receive_task = tokio::spawn(async move {
        while let Some(msg) = ws_receiver.next().await {
            match msg {
                Ok(msg) => {
                    if msg.is_text() || msg.is_binary() {
                        info!("Received message from {}: {:?}", addr, msg);
                    }
                }
                Err(e) => {
                    error!("Error receiving message from {}: {}", addr, e);
                    break;
                }
            }
        }
    });

    // Handle outgoing messages
    let send_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if let Err(e) = ws_sender.send(msg).await {
                error!("Error sending message to {}: {}", addr, e);
                break;
            }
        }
    });

    // Wait for either task to complete
    tokio::select! {
        _ = receive_task => {}
        _ = send_task => {}
    }

    info!("Client disconnected: {}", addr);
    clients.write().await.remove(&addr);
}
