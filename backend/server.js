// Register ts-node to handle TypeScript files
require('ts-node').register({
  project: './tsconfig.json'
});

// Now you can require TypeScript files
const orderBookService = require('./order-book-service.ts');

console.log('WebSocket server initialized'); 