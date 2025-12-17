const { Server } = require('socket.io');
const config = require('../config');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Admin authentication via socket
    socket.on('authenticate', (token) => {
      if (token === config.ADMIN_TOKEN) {
        socket.join('admin');
        socket.emit('authenticated', { success: true });
      } else {
        socket.emit('authenticated', { success: false, error: 'Invalid token' });
      }
    });
    
    socket.on('disconnect', () => {
      // Handle disconnect silently
    });
    
    socket.on('error', (err) => {
      // Handle errors silently in production
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
  io: null // Will be set after initialization
};