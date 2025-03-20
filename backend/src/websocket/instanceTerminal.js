const WebSocket = require('ws');
const { Client } = require('ssh2');
const { instanceService } = require('../services');
const { createSshConfig } = require('../utils/instance/instanceUtils');

const setupTerminalWebSocket = (wss) => {
  wss.on('connection', (ws, req) => {
    // Extract instance ID from URL
    const match = req.url.match(/\/api\/instances\/([^\/]+)\/terminal/);
    if (!match) {
      console.error('Invalid WebSocket URL:', req.url);
      ws.send('Error: Invalid URL format');
      ws.close(1008, 'Invalid URL');
      return;
    }
    
    const instanceId = match[1];
    console.log(`WebSocket terminal connection established for instance ${instanceId}`);
    
    // Get instance details
    instanceService.getInstanceById(instanceId)
      .then(async (instance) => {
        if (!instance) {
          console.error(`Instance ${instanceId} not found`);
          ws.send('Error: Instance not found');
          ws.close(1008, 'Instance not found');
          return;
        }
        
        try {
          // Get SSH connection details
          const sshDetails = await instanceService.getSSHConnectionDetails(instanceId);
          
          console.log(`SSH details for instance ${instanceId}:`, {
            host: sshDetails.host,
            port: sshDetails.port,
            username: sshDetails.username,
            authMethod: sshDetails.authMethod,
            vmName: sshDetails.vmName,
            status: sshDetails.status,
            isKvm: sshDetails.isKvm
          });
          
          // Connect to SSH server
          const ssh = new Client();
          
          // Send initial message to client
          ws.send(`Connecting to ${instance.name} (${sshDetails.host})...\r\n`);
          
          // Create SSH configuration
          const sshConfig = createSshConfig({
            host: sshDetails.host,
            port: sshDetails.port,
            username: sshDetails.username,
            password: instance.config?.sshPassword,
            useAgent: sshDetails.authMethod === 'key'
          });
          
          // Handle SSH connection
          ssh.on('ready', () => {
            console.log(`SSH connection ready for instance ${instanceId}`);
            ws.send('SSH connection established.\r\n');
            
            // Request a pseudo-terminal
            ssh.shell({
              term: 'xterm-color',
              cols: 80,
              rows: 24,
              width: 80,
              height: 24,
              modes: {
                ECHO: 1,
                ECHOCTL: 1
              }
            }, (err, stream) => {
              if (err) {
                console.error(`Error creating shell for instance ${instanceId}:`, err);
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(`Error creating shell: ${err.message}`);
                  ws.close();
                }
                ssh.end();
                return;
              }
              
              console.log(`Shell created for instance ${instanceId}`);
              
              // Handle KVM VMs
              if (sshDetails.isKvm && sshDetails.vmName) {
                ws.send(`Connected to KVM host. Attempting to connect to VM ${sshDetails.vmName}...\r\n`);
                
                if (sshDetails.targetVmIp) {
                  stream.write(`echo "Connecting to VM ${sshDetails.vmName} via SSH..."\r\n`);
                  stream.write(`ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${sshDetails.targetVmIp} -p ${sshDetails.targetVmSshPort || 22}\r\n`);
                } else {
                  stream.write(`echo "Connecting to VM ${sshDetails.vmName} via virsh console..."\r\n`);
                  stream.write(`virsh console ${sshDetails.vmName}\r\n`);
                  setTimeout(() => {
                    if (stream.writable) {
                      stream.write('\r\n');
                    }
                  }, 1000);
                }
              } else {
                // Standard connection setup
                stream.write('echo "Connected to $(hostname) - $(date)"\r\n');
                stream.write('PS1="\\u@\\h:\\w\\$ "\r\n');
                stream.write('echo "Type commands below:"\r\n');
              }
              
              // Forward data from SSH to WebSocket
              stream.on('data', (data) => {
                try {
                  if (ws.readyState === WebSocket.OPEN) {
                    console.log(`Sending ${data.length} bytes of data to client: ${data.toString().substring(0, 50)}...`);
                    ws.send(data);
                  }
                } catch (error) {
                  console.error(`Error sending SSH data to WebSocket for instance ${instanceId}:`, error);
                }
              });
              
              // Handle SSH stream errors
              stream.on('error', (err) => {
                console.error(`SSH stream error for instance ${instanceId}:`, err);
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(`SSH error: ${err.message}`);
                  ws.close();
                }
                ssh.end();
              });
              
              // Handle SSH stream close
              stream.on('close', () => {
                console.log(`SSH stream closed for instance ${instanceId}`);
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send('SSH connection closed');
                  ws.close();
                }
                ssh.end();
              });
              
              // Forward data from WebSocket to SSH
              ws.on('message', (message) => {
                try {
                  console.log(`Received message from client: ${message.length} bytes`);
                  
                  // Handle resize events
                  if (typeof message === 'string' || message instanceof Buffer) {
                    try {
                      const messageStr = message.toString();
                      if (messageStr.startsWith('{') && messageStr.includes('"type":"resize"')) {
                        const resizeData = JSON.parse(messageStr);
                        if (resizeData.type === 'resize' && resizeData.cols && resizeData.rows) {
                          console.log(`Resizing terminal to ${resizeData.cols}x${resizeData.rows}`);
                          stream.setWindow(resizeData.rows, resizeData.cols, 0, 0);
                          return;
                        }
                      }
                    } catch (parseError) {
                      // Not a JSON message, treat as regular data
                    }
                  }
                  
                  // Forward regular data to SSH
                  if (stream.writable) {
                    stream.write(message);
                  }
                } catch (error) {
                  console.error(`Error sending WebSocket data to SSH for instance ${instanceId}:`, error);
                }
              });
              
              // Handle WebSocket close
              ws.on('close', () => {
                console.log(`WebSocket closed for instance ${instanceId}`);
                stream.close();
                ssh.end();
              });
            });
          });
          
          // Handle SSH connection events
          ssh.on('error', (err) => {
            console.error(`SSH connection error for instance ${instanceId}:`, err);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(`Failed to connect to SSH: ${err.message}`);
              ws.close();
            }
          });
          
          ssh.on('end', () => {
            console.log(`SSH connection ended for instance ${instanceId}`);
          });
          
          ssh.on('close', (hadError) => {
            console.log(`SSH connection closed for instance ${instanceId}`, hadError ? 'with error' : 'cleanly');
          });
          
          // Connect with the SSH configuration
          try {
            ssh.connect(sshConfig);
          } catch (error) {
            console.error(`Error initiating SSH connection for instance ${instanceId}:`, error);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(`Error connecting to SSH: ${error.message}`);
              ws.close();
            }
          }
        } catch (error) {
          console.error(`Error establishing terminal connection for instance ${instanceId}:`, error);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(`Error: ${error.message}`);
            ws.close(1011, 'Internal server error');
          }
        }
      })
      .catch((error) => {
        console.error(`Error retrieving instance ${instanceId}:`, error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(`Error retrieving instance: ${error.message}`);
          ws.close(1011, 'Internal server error');
        }
      });
  });
};

module.exports = {
  setupTerminalWebSocket
};