const express = require('express');
const router = express.Router();

// Placeholder for instance controller (will be implemented later)
const instanceController = {
  getAllInstances: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      data: {
        instances: [
          { 
            id: '1', 
            name: 'Instance 1', 
            type: 'EC2', 
            status: 'running',
            provider: 'AWS',
            region: 'us-east-1',
            createdAt: new Date().toISOString()
          },
          { 
            id: '2', 
            name: 'Instance 2', 
            type: 'VM', 
            status: 'stopped',
            provider: 'GCP',
            region: 'us-central1',
            createdAt: new Date().toISOString()
          }
        ]
      }
    });
  },
  getInstanceById: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      data: {
        instance: { 
          id: req.params.id, 
          name: 'Instance 1', 
          type: 'EC2', 
          status: 'running',
          provider: 'AWS',
          region: 'us-east-1',
          createdAt: new Date().toISOString(),
          metrics: {
            cpu: 45,
            memory: 62,
            disk: 30
          }
        }
      }
    });
  },
  createInstance: (req, res) => {
    res.status(201).json({ 
      status: 'success',
      message: 'Instance created successfully',
      data: {
        instance: {
          id: '3',
          name: req.body.name,
          type: req.body.type,
          status: 'provisioning',
          provider: req.body.provider,
          region: req.body.region,
          createdAt: new Date().toISOString()
        }
      }
    });
  },
  updateInstance: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      message: 'Instance updated successfully',
      data: {
        instance: {
          id: req.params.id,
          name: req.body.name,
          type: req.body.type,
          status: req.body.status,
          provider: req.body.provider,
          region: req.body.region,
          updatedAt: new Date().toISOString()
        }
      }
    });
  },
  deleteInstance: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      message: 'Instance deleted successfully'
    });
  },
  startInstance: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      message: 'Instance started successfully',
      data: {
        instance: {
          id: req.params.id,
          status: 'running',
          updatedAt: new Date().toISOString()
        }
      }
    });
  },
  stopInstance: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      message: 'Instance stopped successfully',
      data: {
        instance: {
          id: req.params.id,
          status: 'stopped',
          updatedAt: new Date().toISOString()
        }
      }
    });
  },
  restartInstance: (req, res) => {
    res.status(200).json({ 
      status: 'success',
      message: 'Instance restarted successfully',
      data: {
        instance: {
          id: req.params.id,
          status: 'running',
          updatedAt: new Date().toISOString()
        }
      }
    });
  }
};

// Instance routes
router.get('/', instanceController.getAllInstances);
router.get('/:id', instanceController.getInstanceById);
router.post('/', instanceController.createInstance);
router.put('/:id', instanceController.updateInstance);
router.delete('/:id', instanceController.deleteInstance);
router.post('/:id/start', instanceController.startInstance);
router.post('/:id/stop', instanceController.stopInstance);
router.post('/:id/restart', instanceController.restartInstance);

module.exports = router; 