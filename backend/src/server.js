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
const nodemailer = require('nodemailer');
const { exec } = require('child_process');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: true }
});

const PORT = process.env.PORT || 3000;
const CONTENT_PATH = path.join(__dirname, '..', 'content.json');
const CONTACTS_PATH = path.join(__dirname, '..', 'contacts.json');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('FATAL ERROR: ADMIN_TOKEN is not defined. Please create a .env file with ADMIN_TOKEN.');
  process.exit(1);
}

// Email configuration
const createEmailTransporter = () => {
  if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE, // 'gmail', 'outlook', etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return null;
};

const emailTransporter = createEmailTransporter();

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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
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
  ).default([]),

  siteSettings: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    keywords: Joi.string().allow(''),
    author: Joi.string().required(),
    siteUrl: Joi.string().uri().allow(''),
    avatar: Joi.string().allow(''),
    favicon: Joi.string().allow('')
  }).default({}),

  contactInfo: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().allow(''),
    location: Joi.string().allow('')
  }).default({}),

  socialMedia: Joi.array().items(
    Joi.object({
      platform: Joi.string().required(),
      url: Joi.string().uri().required(),
      icon: Joi.string().required()
    })
  ).default([])
});

// Contact form validation schema
const contactSchema = Joi.object({
  fullname: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(10).max(2000).required()
});

// --- Helper Functions ---

// Load contacts from file
const loadContacts = async () => {
  try {
    const data = await fs.readFile(CONTACTS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return []; // Return empty array if file doesn't exist
  }
};

// Save contacts to file
const saveContacts = async (contacts) => {
  await fs.writeFile(CONTACTS_PATH, JSON.stringify(contacts, null, 2));
};

// Send email notification
const sendEmailNotification = async (contactData) => {
  if (!emailTransporter) return false;
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${contactData.fullname}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactData.fullname}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Message:</strong></p>
        <p>${contactData.message.replace(/\n/g, '<br>')}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      `
    };
    
    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// --- Routes ---

// Contact form submission
app.post('/api/contact', async (req, res) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const contactData = {
    id: Date.now().toString(),
    fullname: req.body.fullname.trim(),
    email: req.body.email.trim().toLowerCase(),
    message: req.body.message.trim(),
    timestamp: new Date().toISOString(),
    read: false
  };

  try {
    // Save to contacts file
    const contacts = await loadContacts();
    contacts.unshift(contactData); // Add to beginning (most recent first)
    await saveContacts(contacts);

    // Send email notification (optional)
    const emailSent = await sendEmailNotification(contactData);

    // Emit socket event for real-time updates
    io.emit('new-contact', {
      id: contactData.id,
      name: contactData.fullname,
      email: contactData.email,
      timestamp: contactData.timestamp
    });

    res.json({ 
      success: true, 
      message: 'Thank you for your message! I\'ll get back to you soon.',
      emailSent 
    });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: 'Failed to submit contact form. Please try again.' });
  }
});

// Get contacts (admin only)
app.get('/api/contacts', checkAdminToken, async (req, res) => {
  try {
    const contacts = await loadContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load contacts' });
  }
});

// Mark contact as read (admin only)
app.patch('/api/contacts/:id/read', checkAdminToken, async (req, res) => {
  try {
    const contacts = await loadContacts();
    const contact = contacts.find(c => c.id === req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    contact.read = true;
    await saveContacts(contacts);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact (admin only)
app.delete('/api/contacts/:id', checkAdminToken, async (req, res) => {
  try {
    const contacts = await loadContacts();
    const filteredContacts = contacts.filter(c => c.id !== req.params.id);
    await saveContacts(filteredContacts);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

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

  // Helper: extract END year and month safely for better sorting
  const getEndDate = (years) => {
    if (!years || years.trim() === '') return { year: new Date().getFullYear() + 1, month: 12 }; // Treat missing as "Present"
    
    const parts = years.split('—').map(s => s.trim());
    if (parts.length < 2) {
      const year = parseInt(parts[0]) || new Date().getFullYear() + 1;
      return { year, month: 12 };
    }
    
    const end = parts[1];
    if (/present/i.test(end)) return { year: new Date().getFullYear() + 1, month: 12 };
    
    // Handle "Month YYYY" format (e.g., "December 2023")
    const monthYearMatch = end.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/);
    if (monthYearMatch) {
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const month = monthNames.indexOf(monthYearMatch[1]) + 1;
      const year = parseInt(monthYearMatch[2]);
      return { year, month };
    }
    
    // Handle "YYYY" format
    const year = parseInt(end) || new Date().getFullYear() + 1;
    return { year, month: 12 };
  };

  // Helper: compare two dates for sorting (most recent first)
  const compareDates = (dateA, dateB) => {
    if (dateA.year !== dateB.year) {
      return dateB.year - dateA.year; // Sort by year descending
    }
    return dateB.month - dateA.month; // If same year, sort by month descending
  };

  // --- Sort education by END date (desc) ---
  if (content.education) {
    content.education.sort((a, b) => {
      const dateA = getEndDate(a.years);
      const dateB = getEndDate(b.years);
      return compareDates(dateA, dateB);
    });
  }

  // --- Sort experience by END date (desc) ---
  if (content.experience) {
    content.experience.sort((a, b) => {
      const dateA = getEndDate(a.years);
      const dateB = getEndDate(b.years);
      return compareDates(dateA, dateB);
    });
  }

  try {
    await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2));
    
    // Small delay to ensure file is fully written
    setTimeout(() => {
      console.log('Emitting content-updated event to all clients');
      io.emit('content-updated', { 
        message: 'Content has been updated. Please refresh.',
        timestamp: new Date().toISOString()
      });
    }, 100);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to write content file:', err);
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
