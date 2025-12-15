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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;

/* =======================
   Paths (Docker-safe)
======================= */
const DATA_DIR = path.join(__dirname, '..');
const CONTENT_PATH = path.join(DATA_DIR, 'content.json');
const CONTACTS_PATH = path.join(DATA_DIR, 'contacts.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
if (!ADMIN_TOKEN) {
  console.error('ADMIN_TOKEN missing');
  process.exit(1);
}

/* =======================
   Email
======================= */
const emailTransporter =
  process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })
    : null;

/* =======================
   Middleware
======================= */
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

const checkAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  if (token !== ADMIN_TOKEN) return res.status(403).json({ error: 'Forbidden' });
  next();
};

/* =======================
   Rate Limit
======================= */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});

/* =======================
   Multer
======================= */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOADS_DIR),
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Invalid file type'));
  }
});

/* =======================
   Schemas
======================= */
const contactSchema = Joi.object({
  fullname: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(10).required()
});

/* =======================
   Helpers
======================= */
const loadJson = async (file, fallback = []) => {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
};

const saveJson = async (file, data) => {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
};

/* =======================
   Routes
======================= */

// Contact
app.post('/api/contact', async (req, res) => {
  const { error } = contactSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const contact = {
    id: Date.now().toString(),
    ...req.body,
    timestamp: new Date().toISOString(),
    read: false
  };

  const contacts = await loadJson(CONTACTS_PATH);
  contacts.unshift(contact);
  await saveJson(CONTACTS_PATH, contacts);

  if (emailTransporter) {
    emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact: ${contact.fullname}`,
      html: `<p>${contact.message}</p>`
    }).catch(console.error);
  }

  io.emit('new-contact', contact);
  res.json({ success: true });
});

// Admin contacts
app.get('/api/contacts', checkAdminToken, async (_, res) => {
  res.json(await loadJson(CONTACTS_PATH));
});

app.patch('/api/contacts/:id/read', checkAdminToken, async (req, res) => {
  const contacts = await loadJson(CONTACTS_PATH);
  const c = contacts.find(x => x.id === req.params.id);
  if (!c) return res.sendStatus(404);
  c.read = true;
  await saveJson(CONTACTS_PATH, contacts);
  res.json({ success: true });
});

app.delete('/api/contacts/:id', checkAdminToken, async (req, res) => {
  const contacts = await loadJson(CONTACTS_PATH);
  await saveJson(
    CONTACTS_PATH,
    contacts.filter(c => c.id !== req.params.id)
  );
  res.json({ success: true });
});

// Upload
app.post(
  '/api/upload',
  uploadLimiter,
  checkAdminToken,
  upload.single('image'),
  (req, res) => {
    res.json({ filePath: `/uploads/${req.file.filename}` });
  }
);

// Content
app.get('/content.json', (_, res) => res.sendFile(CONTENT_PATH));

app.post('/api/update-content', checkAdminToken, async (req, res) => {
  await saveJson(CONTENT_PATH, req.body);
  io.emit('content-updated', { timestamp: Date.now() });
  res.json({ success: true });
});

/* =======================
   WebSocket
======================= */
io.on('connection', () => console.log('Socket connected'));

/* =======================
   Shutdown (Docker-safe)
======================= */
const shutdown = () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/* =======================
   Start
======================= */
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
