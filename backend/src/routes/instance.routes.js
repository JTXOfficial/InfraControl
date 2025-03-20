// This file is kept for backward compatibility
// It re-exports the new modular instance routes
module.exports = require('./instance').router;

// Export WebSocket setup function for compatibility
module.exports.setupTerminalWebSocket = require('./instance').setupTerminalWebSocket;