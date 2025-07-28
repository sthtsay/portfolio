require('dotenv').config();
const express = require('express');
const fs = require('fs').promises; // Using promises for file writing
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const Joi = require('joi');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
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

// Apply Helmet for basic security
app.use(helmet({ crossOriginResourcePolicy: false }));

// Rate limiting to avoid abuse on upload endpoint
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many upload requests from this IP, please try again later.'
});
app.use('/api/upload', uploadLimiter);

// Enable CORS for all origins
app.use(cors());

// Logging requests
app.use(morgan('dev')); // Logs request info to the console

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

// File upload validation: max 5MB and only image files
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size of 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  }
});

// Content validation schema using Joi
const contentSchema = Joi.object({
  about: Joi.string().required(),
  services: Joi.array().items(Joi.string()).required(),
});

// Apply checkAdminToken middleware to every endpoint that requires admin access

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
app.post('/api/update-content', checkAdminToken, async (req, res) => {
  const { error } = contentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const content = req.body;

  try {
    // Write the new content to content.json
    await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2));
    
    // Emit WebSocket event to notify clients
    io.emit('content-updated', { message: 'Content has been updated. Please refresh.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// WebSocket connections handling
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('reconnect', () => {
    console.log('A user reconnected');
  });
});

// Error handler for multer file upload
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).json({ error: 'Something went wrong. Please try again later.' });
});

// Graceful shutdown
const shutdown = () => {
  console.log('Gracefully shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown); // For Ctrl + C
process.on('SIGTERM', shutdown); // For termination signal

// Start the server
server.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});
