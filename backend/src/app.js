const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { setupTerminalWebSocket } = require('./routes/instance.routes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/instances', require('./routes/instance.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/zones', require('./routes/zone.routes'));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
  noServer: true 
});

// Setup WebSocket terminal handler
setupTerminalWebSocket(wss);

// Handle upgrade requests
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  
  console.log(`WebSocket upgrade request for: ${pathname}`);
  
  // Check if this is a terminal connection
  if (pathname.startsWith('/api/instances/') && pathname.includes('/terminal')) {
    console.log('Handling terminal WebSocket connection');
    wss.handleUpgrade(request, socket, head, (ws) => {
      console.log('WebSocket connection established');
      wss.emit('connection', ws, request);
    });
  } else {
    console.log(`Rejecting WebSocket connection for unsupported path: ${pathname}`);
    socket.destroy();
  }
});

// Export the server
module.exports = { app, server }; 