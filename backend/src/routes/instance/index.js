const express = require('express');
const router = express.Router();
const instanceController = require('../../controllers/instance/instanceController');
const { setupTerminalWebSocket } = require('../../websocket/instanceTerminal');

// Instance routes
router.get('/', instanceController.getAllInstances);
router.get('/:id', instanceController.getInstanceById);
router.post('/', instanceController.createInstance);
router.put('/:id', instanceController.updateInstance);
router.delete('/:id', instanceController.deleteInstance);

// Instance state management routes
router.post('/:id/start', instanceController.startInstance);
router.post('/:id/stop', instanceController.stopInstance);
router.post('/:id/force-stop', instanceController.forceStopInstance);
router.post('/:id/restart', instanceController.restartInstance);

// Instance monitoring routes
router.get('/:id/status', instanceController.checkInstanceStatus);
router.get('/:id/system-usage', instanceController.fetchSystemUsage);

// SSH related routes
router.post('/:id/ssh-connect', instanceController.sshConnect);
router.post('/test-connection', instanceController.testConnection);

// VM management routes
router.post('/cleanup-orphaned', instanceController.cleanupOrphanedVMs);

// Export the router and WebSocket setup function
module.exports = {
  router,
  setupTerminalWebSocket
};