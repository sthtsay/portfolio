const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://yohannesweb.netlify.app',
      'https://portfolio-505u.onrender.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const PORT = 3000;
const CONTENT_PATH = path.join(__dirname, 'content.json');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'YohiMes2024.@&'; // Set a strong token in production

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://yohannesweb.netlify.app',
    'https://portfolio-505u.onrender.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname)); // Serve static files (index.html, admin.html, etc.)

// Endpoint to get content.json
app.get('/content.json', (req, res) => {
  res.sendFile(CONTENT_PATH);
});

// Endpoint to update content.json (admin only)
app.post('/api/update-content', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const content = req.body;
  if (!content || typeof content !== 'object') {
    return res.status(400).json({ error: 'Invalid content' });
  }
  fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2), err => {
    if (err) return res.status(500).json({ error: 'Failed to write file' });
    io.emit('content-updated'); // Notify all clients
    res.json({ success: true });
  });
});

io.on('connection', (socket) => {
  // Optionally log or handle connections
});

server.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
  console.log(`Admin token: ${ADMIN_TOKEN}`);
});
