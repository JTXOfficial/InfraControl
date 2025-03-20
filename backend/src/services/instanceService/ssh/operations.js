/**
 * SSH Operations
 */

const { Client } = require('ssh2');

/**
 * Execute a command on a remote server via SSH
 * @param {Object} sshConfig - SSH connection configuration
 * @param {string} command - Command to execute
 * @returns {Promise<string>} Command output
 */
const executeSSHCommand = async (sshConfig, command) => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      console.log('SSH connection established');
      
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        
        let stdout = '';
        let stderr = '';
        
        stream.on('close', (code) => {
          conn.end();
          if (code === 0) {
            resolve(stdout);
          } else {
            reject(new Error(`Command exited with code ${code}: ${stderr}`));
          }
        });
        
        stream.on('data', (data) => {
          stdout += data.toString();
        });
        
        stream.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      });
    });
    
    conn.on('error', (err) => {
      console.error('SSH connection error:', err.message);
      // Provide more specific error messages for common SSH errors
      if (err.message.includes('All configured authentication methods failed')) {
        reject(new Error('SSH authentication failed. Please check your username and password or ensure SSH agent is configured.'));
      } else if (err.message.includes('connect ETIMEDOUT')) {
        reject(new Error('SSH connection timed out. Please verify the server is reachable and the port is correct.'));
      } else if (err.message.includes('connect ECONNREFUSED')) {
        reject(new Error('SSH connection refused. Please check if SSH is running on the server and the port is correct.'));
      } else if (err.message.includes('getaddrinfo')) {
        reject(new Error('Host not found. Please verify the IP address is correct.'));
      } else {
        reject(new Error(`SSH connection failed: ${err.message}`));
      }
    });
    
    // Add more verbose debugging
    console.log(`Executing SSH command on ${sshConfig.host}:${sshConfig.port} as ${sshConfig.username}`);
    console.log(`Command: ${command}`);
    
    // Setup more permissive SSH config
    const config = {
      host: sshConfig.host,
      port: sshConfig.port,
      username: sshConfig.username,
      readyTimeout: 15000,
      keepaliveInterval: 10000,
      keepaliveCountMax: 3,
      tryKeyboard: false
    };
    
    // Add password if provided, ensuring it's properly sanitized
    if (sshConfig.password && sshConfig.password !== 'undefined' && sshConfig.password !== 'null' && sshConfig.password.trim() !== '') {
      config.password = sshConfig.password;
      console.log('Using password authentication');
    } else {
      // Fall back to SSH agent if available
      console.log('No valid password provided, trying agent authentication');
      if (process.env.SSH_AUTH_SOCK) {
        config.agent = process.env.SSH_AUTH_SOCK;
        console.log('Using SSH agent authentication via SSH_AUTH_SOCK');
      } else {
        console.log('SSH_AUTH_SOCK not available, authentication will likely fail');
      }
    }
    
    conn.connect(config);
  });
};

module.exports = {
  executeSSHCommand
};