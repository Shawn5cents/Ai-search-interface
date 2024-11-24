const Redis = require('redis');
const { logger } = require('./logger');
const { recordCacheHit, recordCacheMiss, recordCacheError, recordRedisLatency } = require('./metrics');

let redisClient;

const initializeRedis = async () => {
  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (error) => {
      logger.error('Redis Client Error:', error);
      recordCacheError();
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Redis initialization failed:', error);
    recordCacheError();
    throw error;
  }
};

const cacheMiddleware = async (req, res, next) => {
  if (!redisClient?.isReady) {
    logger.warn('Redis client not ready, skipping cache');
    return next();
  }

  const { query } = req.body;
  const cacheKey = `search:${query}`;

  try {
    // Check Redis cache
    const getStart = Date.now();
    const cachedResult = await redisClient.get(cacheKey);
    recordRedisLatency('get', Date.now() - getStart);
    
    if (cachedResult) {
      logger.info(`Cache hit for query: ${query}`);
      recordCacheHit();
      return res.json(JSON.parse(cachedResult));
    }

    recordCacheMiss();

    // Cache miss - store the original json function
    const originalJson = res.json;
    res.json = function(data) {
      // Cache the response for 1 hour
      const setStart = Date.now();
      redisClient.setEx(cacheKey, 3600, JSON.stringify(data))
        .then(() => {
          recordRedisLatency('set', Date.now() - setStart);
        })
        .catch(err => {
          logger.error('Redis cache set error:', err);
          recordCacheError();
        });
      
      // Send the response
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    logger.error('Cache middleware error:', error);
    recordCacheError();
    next();
  }
};

module.exports = {
  initializeRedis,
  cacheMiddleware
};
