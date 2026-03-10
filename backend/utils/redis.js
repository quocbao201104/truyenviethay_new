const Redis = require('ioredis');
const logger = require('./logger');

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  logger.error('REDIS_URL is not defined in .env');
  process.exit(1);
}

const createRedisClient = (options = {}) => {
  return new Redis(REDIS_URL, {
    maxRetriesPerRequest: options.maxRetriesPerRequest !== undefined ? options.maxRetriesPerRequest : 1,
    commandTimeout: options.commandTimeout || 10000, // Default 10s for cloud latency
    enableOfflineQueue: options.enableOfflineQueue !== undefined ? options.enableOfflineQueue : true,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    ...options
  });
};

const redis = createRedisClient();

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

module.exports = redis;
module.exports.createRedisClient = createRedisClient;
