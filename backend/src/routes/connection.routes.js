const express = require('express');
const router = express.Router();
const { Client } = require('ssh2');

// Test SSH connection to remote server
router.post('/test', async (req, res) => {
  try {
    const { ipAddress, username, password, port } = req.body;
    
    if (!ipAddress || !username) {
      return res.status(400).json({ 
        success: false, 
        message: 'IP address and username are required' 
      });
    }
    
    // Default port if not provided
    const sshPort = parseInt(port, 10) || 22;
    
    console.log(`Testing SSH connection to ${ipAddress}:${sshPort} with username ${username}`);
    
    // Create a new SSH client
    const conn = new Client();
    
    let hasResponded = false;
    
    // Helper function to ensure we only send one response
    const sendResponse = (status, data) => {
      if (!hasResponded) {
        hasResponded = true;
        res.status(status).json(data);
      }
    };
    
    // Set a timeout for the connection attempt
    const connectionTimeout = setTimeout(() => {
      if (!hasResponded) {
        conn.end();
        console.log('SSH connection timeout');
        sendResponse(408, { 
          success: false, 
          message: 'Connection timed out. Please verify the IP address is reachable.' 
        });
      }
    }, 10000); // 10 second timeout
    
    // Handle connection errors
    conn.on('error', (err) => {
      clearTimeout(connectionTimeout);
      console.error('SSH connection error:', err.message);
      sendResponse(400, { 
        success: false, 
        message: `Connection failed: ${err.message}` 
      });
    });
    
    // Handle successful connection
    conn.on('ready', () => {
      clearTimeout(connectionTimeout);
      console.log('SSH connection successful');
      
      // Execute a simple command to verify we can run commands
      conn.exec('echo "Connection successful"', (err, stream) => {
        if (err) {
          conn.end();
          console.error('SSH exec error:', err.message);
          return sendResponse(400, { 
            success: false, 
            message: `Connected but failed to execute command: ${err.message}` 
          });
        }
        
        let stdout = '';
        let stderr = '';
        
        stream.on('close', (code) => {
          conn.end();
          console.log(`SSH command exited with code ${code}, stdout: ${stdout}, stderr: ${stderr}`);
          
          if (code === 0) {
            return sendResponse(200, { 
              success: true, 
              message: 'Connection successful' 
            });
          } else {
            return sendResponse(400, { 
              success: false, 
              message: `Command exited with code ${code}: ${stderr}` 
            });
          }
        });
        
        stream.on('data', (data) => {
          stdout += data.toString();
          console.log('STDOUT: ' + data);
        });
        
        stream.stderr.on('data', (data) => {
          stderr += data.toString();
          console.error('STDERR: ' + data);
        });
      });
    });
    
    // Connect to the server
    const connectionConfig = {
      host: ipAddress,
      port: sshPort,
      username: username,
      readyTimeout: 8000, // 8 seconds to establish connection
    };
    
    // Add authentication method based on what's provided
    if (password) {
      connectionConfig.password = password;
    } else {
      // Use agent-based authentication if no password is provided
      connectionConfig.agent = process.env.SSH_AUTH_SOCK;
      
      // Fallback to default key locations if agent isn't available
      connectionConfig.tryKeyboard = false;
    }
    
    console.log(`Attempting to connect to SSH server at ${ipAddress}:${sshPort}...`);
    
    // Attempt to connect
    conn.connect(connectionConfig);
    
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error testing SSH connection'
    });
  }
});

module.exports = router; 