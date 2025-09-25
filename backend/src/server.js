require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const Joi = require('joi');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: true }
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

// Helmet for security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Rate limiting for upload
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many upload requests from this IP, please try again later.'
});
app.use('/api/upload', uploadLimiter);

// CORS + logging
app.use(cors());
app.use(morgan('dev'));

// Body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  }
});

// ✅ Joi schema
const contentSchema = Joi.object({
  about: Joi.object({
    name: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.array().items(Joi.string()).required()
  }).required(),

  services: Joi.array().items(
    Joi.object({
      icon: Joi.string().allow(''),
      title: Joi.string().required(),
      text: Joi.string().required()
    })
  ).default([]),

  projects: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      category: Joi.string().allow(''),
      type: Joi.string().allow(''),
      image: Joi.string().allow(''),
      alt: Joi.string().allow('')
    })
  ).default([]),

  testimonials: Joi.array().items(
    Joi.object({
      avatar: Joi.string().allow(''),
      name: Joi.string().required(),
      text: Joi.string().required()
    })
  ).default([]),

  certificates: Joi.array().items(
    Joi.object({
      logo: Joi.string().allow(''),
      alt: Joi.string().allow('')
    })
  ).default([]),

  education: Joi.array().items(
    Joi.object({
      school: Joi.string().required(),
      years: Joi.string().allow(''),
      text: Joi.string().allow('')
    })
  ).default([]),

  experience: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      company: Joi.string().allow(''),
      years: Joi.string().allow(''),
      text: Joi.string().allow('')
    })
  ).default([]),

  skills: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      value: Joi.number().min(0).max(100).required()
    })
  ).default([])
});

// --- Routes ---

// Upload image
app.post('/api/upload', checkAdminToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filePath: `uploads/${req.file.filename}` });
});

// Serve content.json
app.get('/content.json', (req, res) => {
  res.sendFile(CONTENT_PATH);
});

// Update content.json
app.post('/api/update-content', checkAdminToken, async (req, res) => {
  const { error } = contentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const content = req.body;

  // Helper: extract END year safely
  const getEndYear = (years) => {
    if (!years || years.trim() === '') return new Date().getFullYear() + 1; // Treat missing as "Present"
    const parts = years.split('—').map(s => s.trim());
    if (parts.length < 2) {
      return parseInt(parts[0]) || new Date().getFullYear() + 1;
    }
    const end = parts[1];
    if (/present/i.test(end)) return new Date().getFullYear() + 1;
    return parseInt(end) || new Date().getFullYear() + 1;
  };

  // --- Sort education by END year (desc) ---
  if (content.education) {
    content.education.sort((a, b) => getEndYear(b.years) - getEndYear(a.years));
  }

  // --- Sort experience by END year (desc) ---
  if (content.experience) {
    content.experience.sort((a, b) => getEndYear(b.years) - getEndYear(a.years));
  }

  try {
    await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2));
    io.emit('content-updated', { message: 'Content has been updated. Please refresh.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// WebSocket
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => console.log('User disconnected'));
  socket.on('reconnect', () => console.log('A user reconnected'));
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong. Please try again later.' });
});

// Restart & shutdown
const restartServer = () => {
  console.log('Preparing to restart server...');
  setTimeout(() => {
    console.log('Restarting server...');
    exec('node ' + __filename, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error restarting server: ${stderr}`);
        return;
      }
      console.log('Server restarted successfully');
    });
    process.exit();
  }, 1000);
};

const shutdown = () => {
  console.log('Gracefully shutting down...');
  setTimeout(() => {
    console.log('Server closed');
    process.exit(0);
  }, 1000);
};

process.on('SIGINT', () => {
  console.log('Received SIGINT (Ctrl+C), shutting down...');
  shutdown();
  restartServer();
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  shutdown();
  restartServer();
});

// Start server
server.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});
