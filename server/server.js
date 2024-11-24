require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { searchOpenAI } = require('./controllers/searchController');
const { logger, httpLogger } = require('./middleware/logger');
const { initializeRedis, cacheMiddleware } = require('./middleware/cache');
const { searchValidation, validate } = require('./middleware/validation');
const { metricsMiddleware, getMetrics } = require('./middleware/metrics');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Initialize Redis (but don't fail if it's not available)
initializeRedis().catch(err => {
  logger.warn('Redis not available, continuing without caching:', err.message);
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.OPENAI_API_URL]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// General middleware
app.use(compression()); // Compress responses
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies
app.use(httpLogger); // HTTP request logging
app.use(metricsMiddleware); // Prometheus metrics

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Monitoring endpoints
app.get('/metrics', getMetrics);
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// API Routes
app.post('/api/search',
  searchValidation,
  validate,
  cacheMiddleware,
  searchOpenAI
);

// Static files for PWA
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Not Found - ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`API Documentation available at http://localhost:${port}/api-docs`);
});
