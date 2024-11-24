const client = require('prom-client');
const { logger } = require('./logger');

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({
  register,
  prefix: 'ai_search_'
});

// Create metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1, 5, 15, 50, 100, 200, 500, 1000, 2000, 5000]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const cacheHitTotal = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total number of Redis cache hits'
});

const cacheMissTotal = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total number of Redis cache misses'
});

const cacheErrorTotal = new client.Counter({
  name: 'cache_errors_total',
  help: 'Total number of Redis cache errors'
});

const apiErrorTotal = new client.Counter({
  name: 'api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['error_type']
});

const redisLatencyMicroseconds = new client.Histogram({
  name: 'redis_operation_duration_ms',
  help: 'Duration of Redis operations in ms',
  labelNames: ['operation'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500]
});

// Register metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestTotal);
register.registerMetric(cacheHitTotal);
register.registerMetric(cacheMissTotal);
register.registerMetric(cacheErrorTotal);
register.registerMetric(apiErrorTotal);
register.registerMetric(redisLatencyMicroseconds);

// Middleware to collect metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  // Store the original end function
  const originalEnd = res.end;

  // Override end function
  res.end = function(...args) {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    const statusCode = res.statusCode;

    // Record metrics
    httpRequestDurationMicroseconds
      .labels(req.method, route, statusCode)
      .observe(duration);

    httpRequestTotal
      .labels(req.method, route, statusCode)
      .inc();

    // Call the original end function
    originalEnd.apply(res, args);
  };

  next();
};

// Function to record cache events
const recordCacheHit = () => cacheHitTotal.inc();
const recordCacheMiss = () => cacheMissTotal.inc();
const recordCacheError = () => cacheErrorTotal.inc();

// Function to record Redis operation latency
const recordRedisLatency = (operation, duration) => {
  redisLatencyMicroseconds.labels(operation).observe(duration);
};

// Function to record API errors
const recordApiError = (errorType) => {
  apiErrorTotal.labels(errorType).inc();
  logger.error(`API Error: ${errorType}`);
};

// Metrics endpoint
const getMetrics = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error generating metrics:', error);
    res.status(500).send('Error generating metrics');
  }
};

module.exports = {
  metricsMiddleware,
  recordCacheHit,
  recordCacheMiss,
  recordCacheError,
  recordRedisLatency,
  recordApiError,
  getMetrics
};
