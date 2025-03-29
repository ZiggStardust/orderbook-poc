import * as ws from 'ws';
import * as http from 'http';

type OrderBook = {
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

// Create an HTTP server
const server = http.createServer();
const wss = new ws.WebSocketServer({ server });

// Generate random order book data
function generateOrderBookData(): OrderBook {
    const basePrice = 29340 + Math.random() * 10;
    const asks = new Array(10);
    const bids = new Array(10);

    let askTotal = 0;
    let bidTotal = 0;

    // Pre-calculate price increments
    const priceIncrement = 0.25;

    // Generate data in a single pass
    for (let i = 0; i < 10; i++) {
        const askSize = Math.random() * 2;
        const bidSize = Math.random() * 2;

        askTotal += askSize;
        bidTotal += bidSize;

        asks[i] = {
            price: (basePrice + i * priceIncrement).toFixed(2),
            size: askSize.toFixed(2),
            total: Number(askTotal.toFixed(2))
        };

        bids[i] = {
            price: (basePrice - i * priceIncrement).toFixed(2),
            size: bidSize.toFixed(2),
            total: Number(bidTotal.toFixed(2))
        };
    }

    return { asks, bids };
}

// Generate random trade data
function generateTradeData() {
    const basePrice = 29340 + Math.random() * 10;
    const size = (Math.random() * 0.5).toFixed(2);
    const date = new Date();
    const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    const side = Math.random() > 0.5 ? 'buy' : 'sell';

    return {
        price: basePrice.toFixed(2),
        size,
        time,
        side
    };
}

wss.on('connection', (ws: ws.WebSocket) => {

    const interval = setInterval(() => {
        const updateType = 'orderBook';
        if (updateType === 'orderBook') {
            ws.send(JSON.stringify({
                type: 'orderBookUpdate',
                data: generateOrderBookData(),
            }));
            // ws.send(
            //     '{"type":"orderBookUpdate","data":{"asks":[{"price":"29343.37","size":"1.10","total":1.1},{"price":"29343.62","size":"0.10","total":1.19},{"price":"29343.87","size":"1.45","total":2.64},{"price":"29344.12","size":"0.94","total":3.58},{"price":"29344.37","size":"1.71","total":5.29},{"price":"29344.62","size":"0.53","total":5.82},{"price":"29344.87","size":"1.07","total":6.89},{"price":"29345.12","size":"1.55","total":8.44},{"price":"29345.37","size":"0.07","total":8.51},{"price":"29345.62","size":"1.70","total":10.21}],"bids":[{"price":"29343.37","size":"1.39","total":1.39},{"price":"29343.12","size":"0.41","total":1.79},{"price":"29342.87","size":"1.49","total":3.29},{"price":"29342.62","size":"0.39","total":3.68},{"price":"29342.37","size":"0.99","total":4.67},{"price":"29342.12","size":"0.81","total":5.48},{"price":"29341.87","size":"1.57","total":7.05},{"price":"29341.62","size":"0.19","total":7.24},{"price":"29341.37","size":"0.08","total":7.32},{"price":"29341.12","size":"1.73","total":9.05}]}}'
            // )
        }
        // else {
        //     ws.send(JSON.stringify({
        //         type: 'newTrade',
        //         data: generateTradeData()
        //     }));
        // }
    }, 0.05);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });
});

const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});

export = server; 