require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');

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
const PORT = process.env.PORT || 3000;
const CONTENT_PATH = path.join(__dirname, '..', 'content.json');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('FATAL ERROR: ADMIN_TOKEN is not defined. Please create a .env file with ADMIN_TOKEN.');
  process.exit(1);
}

// Middleware to check for admin token
const checkAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (token == null) return res.status(401).json({ error: 'No token provided' });
  if (token !== ADMIN_TOKEN) return res.status(403).json({ error: 'Unauthorized' });
  next();
};

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
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Endpoint for image upload (protected)
app.post('/api/upload', checkAdminToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filePath: `uploads/${req.file.filename}` });
});

// Endpoint to get content.json (public)
app.get('/content.json', (req, res) => {
  res.sendFile(CONTENT_PATH);
});

// Endpoint to update content.json (protected)
app.post('/api/update-content', checkAdminToken, (req, res) => {
  const content = req.body;
  // Basic validation
  if (!content || typeof content !== 'object' || !content.about || !content.services) {
    return res.status(400).json({ error: 'Invalid content structure' });
  }
  fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2), err => {
    if (err) return res.status(500).json({ error: 'Failed to write file' });
    io.emit('content-updated');
    res.json({ success: true });
  });
});

io.on('connection', (socket) => {
  // Optionally log or handle connections
});

server.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});
