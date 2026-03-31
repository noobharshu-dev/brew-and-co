const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('mongo-sanitize');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL  // set this in .env after deployment e.g. https://yourapp.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ── BODY PARSING ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Block abnormally large payloads

// ── MONGO SANITIZATION ────────────────────────────────────────────────────────
// Strips $ and . from user input — prevents NoSQL injection attacks
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.params) req.params = mongoSanitize(req.params);
  if (req.query) req.query = mongoSanitize(req.query);
  next();
});

// ── XSS SANITIZATION ─────────────────────────────────────────────────────────
// Strip HTML tags from all string fields in req.body
const stripTags = (obj) => {
  if (typeof obj === 'string') {
    return obj.replace(/<[^>]*>/g, '').trim();
  }
  if (Array.isArray(obj)) return obj.map(stripTags);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, stripTags(v)]));
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) req.body = stripTags(req.body);
  next();
});

// ── RATE LIMITING ─────────────────────────────────────────────────────────────

// General API limit — 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for payment endpoints — 20 per 15 minutes per IP
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many payment attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for reservations — 10 per hour per IP
const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many reservation attempts. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use('/api/menu', generalLimiter, menuRoutes);
app.use('/api/orders', paymentLimiter, orderRoutes);
app.use('/api/reservations', reservationLimiter, reservationRoutes);

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── ERROR HANDLER — must be last ──────────────────────────────────────────────
app.use(errorHandler);

// ── START ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});