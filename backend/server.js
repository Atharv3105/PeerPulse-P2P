const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const queueService = require('./services/queueService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static directory for uploaded/mock documents
app.use('/data', express.static(path.join(__dirname, '../data')));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'peerpulse-backend',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/acie', require('./routes/acie'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/recovery', require('./routes/recovery'));
app.use('/api/risk', require('./routes/risk'));
app.use('/api/public', require('./routes/public'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/simulation', require('./routes/simulation'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Fast seed endpoint for demo resets
app.post('/api/seed', async (req, res) => {
  try {
    const { exec } = require('child_process');
    exec('node scripts/seedEnterprise.js', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: error.message, stderr });
      }
      res.json({ message: 'Database successfully re-seeded with Enterprise dataset', output: stdout });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server & Connect DB
connectDB().then(() => {
  queueService.init();
  app.listen(PORT, () => {
    console.log(`[PeerPulse Backend] API Gateway running on http://localhost:${PORT}`);
  });
});

module.exports = app;
