const http = require('http');
const config = require('./config');
const app = require('./app');
const socket = require('./socket');
const helpers = require('./utils/helpers');
const fileService = require('./services/fileService');

// Initialize services
fileService.ensureDirectories();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
socket.initializeSocket(server);

// Setup cleanup task
setInterval(() => {
  helpers.cleanupOldFiles(config.UPLOADS_DIR);
  fileService.cleanupOldBackups();
}, 24 * 60 * 60 * 1000); // Run every 24 hours

// Graceful shutdown
const gracefulShutdown = (signal) => {
  server.close(() => {
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server
server.listen(config.PORT, () => {
  console.log(`Portfolio Backend Server running on port ${config.PORT} (${config.NODE_ENV})`);
});