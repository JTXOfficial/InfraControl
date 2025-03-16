import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Divider,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import instanceService from '../../services/instanceService';

/**
 * Console tab component for SSH terminal access
 * @param {Object} props - Component props
 * @param {Object} props.instance - Instance data
 * @returns {JSX.Element} ConsoleTab component
 */
const ConsoleTab = ({ instance }) => {
  const [terminalReady, setTerminalReady] = useState(false);
  const [terminalConnected, setTerminalConnected] = useState(false);
  const [terminalError, setTerminalError] = useState(null);
  const [terminalStatus, setTerminalStatus] = useState('Disconnected');
  const [loading, setLoading] = useState(false);
  
  const terminalRef = useRef(null);
  const terminalContainerRef = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(null);

  // Initialize terminal when component mounts
  useEffect(() => {
    if (instance) {
      initTerminal();
    }
    
    // Cleanup terminal when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (terminalRef.current) {
        terminalRef.current.dispose();
      }
    };
  }, [instance]);

  // Initialize the terminal
  const initTerminal = () => {
    if (!terminalContainerRef.current) return;
    
    // Clear previous terminal if it exists
    if (terminalRef.current) {
      terminalRef.current.dispose();
    }
    
    // Create new terminal
    const terminal = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#f0f0f0',
        cursor: '#f0f0f0',
        selection: 'rgba(255, 255, 255, 0.3)',
        black: '#000000',
        red: '#e06c75',
        green: '#98c379',
        yellow: '#e5c07b',
        blue: '#61afef',
        magenta: '#c678dd',
        cyan: '#56b6c2',
        white: '#d0d0d0',
        brightBlack: '#808080',
        brightRed: '#e06c75',
        brightGreen: '#98c379',
        brightYellow: '#e5c07b',
        brightBlue: '#61afef',
        brightMagenta: '#c678dd',
        brightCyan: '#56b6c2',
        brightWhite: '#ffffff'
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      convertEol: true,
      scrollback: 1000,
      cols: 80,
      rows: 24,
      cursorStyle: 'block',
      allowTransparency: false
    });
    
    // Create fit addon to make terminal responsive
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    fitAddonRef.current = fitAddon;
    
    // Open terminal in the container
    terminal.open(terminalContainerRef.current);
    fitAddon.fit();
    
    // Store terminal reference
    terminalRef.current = terminal;
    setTerminalReady(true);
    
    // Handle window resize
    const handleResize = () => {
      if (terminalRef.current && fitAddonRef.current) {
        fitAddonRef.current.fit();
        
        // If connected, send new dimensions to server
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          const dimensions = {
            cols: terminalRef.current.cols,
            rows: terminalRef.current.rows
          };
          console.log('Sending terminal resize:', dimensions);
          socketRef.current.send(JSON.stringify({
            type: 'resize',
            cols: dimensions.cols,
            rows: dimensions.rows
          }));
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Make terminal container clickable to focus
    terminalContainerRef.current.addEventListener('click', () => {
      if (terminalRef.current) {
        terminalRef.current.focus();
      }
    });
    
    // Write welcome message
    terminal.writeln('Welcome to InfraControl Console');
    terminal.writeln('Click "Connect" to establish an SSH connection to your instance.');
    terminal.writeln('Once connected, you can type commands and see their output here.');
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (terminalContainerRef.current) {
        terminalContainerRef.current.removeEventListener('click', () => {});
      }
    };
  };

  // Connect to the instance via WebSocket
  const connectToInstance = () => {
    if (!terminalRef.current) return;
    
    // Get the host and port from the window location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // Create WebSocket connection
    const wsUrl = `${protocol}//${host}/api/instances/${instance.id}/terminal`;
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    
    const socket = new WebSocket(wsUrl);
    socket.binaryType = 'arraybuffer';
    socketRef.current = socket;
    
    setTerminalStatus('Connecting...');
    terminalRef.current.writeln('\r\nEstablishing WebSocket connection...');
    
    // Handle WebSocket events
    socket.onopen = () => {
      console.log('WebSocket connection opened');
      setTerminalStatus('Connected');
      terminalRef.current.writeln('\r\nWebSocket connection established');
      setTerminalConnected(true);
      
      // Focus the terminal so user can start typing immediately
      terminalRef.current.focus();
    };
    
    socket.onmessage = (event) => {
      if (!terminalRef.current) return;
      
      try {
        if (typeof event.data === 'string') {
          console.log('Received string data:', event.data.substring(0, 50) + (event.data.length > 50 ? '...' : ''));
          terminalRef.current.write(event.data);
        } else if (event.data instanceof ArrayBuffer) {
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(event.data);
          console.log('Received binary data:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
          terminalRef.current.write(text);
        } else {
          console.error('Received unknown data type:', typeof event.data);
        }
      } catch (error) {
        console.error('Error processing terminal data:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setTerminalStatus('Connection error');
      if (terminalRef.current) {
        terminalRef.current.writeln('\r\nConnection error. Please try again.');
      }
      setTerminalError('Failed to connect to the terminal server');
      setTerminalConnected(false);
    };
    
    socket.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setTerminalStatus('Disconnected');
      if (terminalRef.current) {
        terminalRef.current.writeln(`\r\nConnection closed${event.reason ? ': ' + event.reason : ''}`);
      }
      setTerminalConnected(false);
    };
    
    // Send data from terminal to WebSocket
    terminalRef.current.onData((data) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log('Sending data to server:', data.replace(/\r|\n/g, '\\n'));
        socket.send(data);
      }
    });
  };

  // Connect to instance via SSH directly
  const connectViaSSH = async () => {
    try {
      setTerminalError(null);
      setLoading(true);
      
      if (!terminalRef.current) return;
      const terminal = terminalRef.current;
      
      terminal.clear();
      terminal.writeln('Connecting via SSH...');
      
      // Call backend API to establish SSH connection
      const response = await instanceService.connectSSH(instance.id);
      
      if (response.status === 'success') {
        const sshDetails = response.data.sshConnection;
        
        terminal.writeln(`SSH connection details retrieved successfully`);
        terminal.writeln(`Host: ${sshDetails.host}`);
        terminal.writeln(`Port: ${sshDetails.port}`);
        terminal.writeln(`Username: ${sshDetails.username}`);
        terminal.writeln(`Auth Method: ${sshDetails.authMethod}`);
        terminal.writeln('');
        terminal.writeln('Connecting to WebSocket terminal...');
        
        // Now connect to the WebSocket terminal
        connectToInstance();
        
        setTerminalConnected(true);
      } else {
        throw new Error(response.message || 'Failed to establish SSH connection');
      }
    } catch (error) {
      console.error('SSH connection error:', error);
      if (terminalRef.current) {
        terminalRef.current.writeln(`\r\nError: ${error.message}`);
      }
      setTerminalError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle terminal clear
  const handleClearTerminal = () => {
    if (terminalRef.current) {
      terminalRef.current.clear();
    }
  };

  // Handle terminal disconnect
  const handleDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setTerminalConnected(false);
    setTerminalStatus('Disconnected');
    if (terminalRef.current) {
      terminalRef.current.writeln('\r\nDisconnected from terminal.');
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Console
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={connectViaSSH}
              disabled={!terminalReady || terminalConnected || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <TerminalIcon />}
              sx={{ mr: 1 }}
            >
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleDisconnect}
              disabled={!terminalConnected}
              sx={{ mr: 1 }}
            >
              Disconnect
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearTerminal}
            >
              Clear
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {terminalError && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error" variant="body2">
              Error: {terminalError}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2">
            Status: <Chip 
              size="small" 
              label={terminalStatus} 
              color={
                terminalStatus === 'Connected' ? 'success' : 
                terminalStatus === 'Connecting...' ? 'warning' : 
                terminalStatus === 'Connection error' ? 'error' : 
                'default'
              } 
            />
          </Typography>
        </Box>
        
        <Box 
          ref={terminalContainerRef}
          sx={{ 
            height: 400, 
            bgcolor: '#1e1e1e', 
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid #333',
            '&:hover': {
              borderColor: '#61afef'
            }
          }}
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Connection Details:
          </Typography>
          <Typography variant="body2">
            Host: {instance?.ip || 'N/A'} 
            {instance?.config?.vmSshPort && ` (Port: ${instance.config.vmSshPort})`}
          </Typography>
          <Typography variant="body2">
            Username: {instance?.config?.sshUser || 'root'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConsoleTab; 