const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const agentRoutes = require('./routes/agentRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const qrRoutes = require('./routes/qrRoutes');
const { getPool } = require('./config/database');
const fs = require('fs');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'",
        "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://unpkg.com",
        "https://www.google.com", "https://www.gstatic.com"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net", "data:"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "http://localhost:5000", "http://localhost:3000",
        "http://127.0.0.1:5500", "http://localhost:5500"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));
// Parse CORS origins from environment variable (supports comma-separated list)
const corsOrigins = process.env.CORS_ORIGIN
  ? [...process.env.CORS_ORIGIN.split(',').map(o => o.trim()), 'null']
  : true;

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve properties.html with live total count injected (avoids 0 before JS loads)
app.get('/properties.html', async (req, res) => {
  try {
    const [rows] = await getPool().execute(
      "SELECT COUNT(*) AS total FROM properties WHERE status = 'available'"
    );
    const total = rows[0]?.total || 0;
    let html = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'properties.html'), 'utf8');
    html = html.replace('id="total-count">0', `id="total-count">${total}`);
    res.type('html').send(html);
  } catch (error) {
    console.error('properties.html injection failed:', error.message);
    res.sendFile(path.join(__dirname, '..', 'frontend', 'properties.html'));
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/properties`, propertyRoutes);
app.use(`/api/${apiVersion}/bookings`, bookingRoutes);
app.use(`/api/${apiVersion}/payments`, paymentRoutes);
app.use(`/api/${apiVersion}/reviews`, reviewRoutes);
app.use(`/api/${apiVersion}/messages`, messageRoutes);
app.use(`/api/${apiVersion}/notifications`, notificationRoutes);
app.use(`/api/${apiVersion}/admin`, adminRoutes);
app.use(`/api/${apiVersion}/contact`, contactRoutes);
app.use(`/api/${apiVersion}/agents`, agentRoutes);
app.use(`/api/${apiVersion}/maintenance`, maintenanceRoutes);
app.use(`/api/${apiVersion}/dashboard`, dashboardRoutes);
app.use(`/api/${apiVersion}/tenants`, tenantRoutes);
app.use(`/api/${apiVersion}/qr`, qrRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Lil Mosey Estate 6G Edition API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
