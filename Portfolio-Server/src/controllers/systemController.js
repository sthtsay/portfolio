const getHealth = (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
};

const getMetrics = (req, res) => {
  // For now, return basic metrics
  // In a production app, you might collect more detailed metrics
  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: 0 // You can add actual connection tracking if needed
  });
};

module.exports = {
  getHealth,
  getMetrics
};