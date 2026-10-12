require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const db = require('./config/db');
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/api/health', async (_req, res) => {
  try { await db.query('SELECT 1'); res.json({ status: 'ok', service: 'Lil-Mosey Car Dealers API', database: 'connected' }); }
  catch { res.status(503).json({ status: 'error', service: 'Lil-Mosey Car Dealers API', database: 'unavailable' }); }
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/enquiries', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Image must be 5 MB or smaller.' });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'A record with this value already exists.' });
  res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message });
});
const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`Lil-Mosey Car Dealers API listening on http://localhost:${port}`));
