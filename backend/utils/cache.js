const redis = require('./redis');
const logger = require('./logger');

/**
 * Redis-based Cache for Story Data
 * 
 * Purpose: Reduce database load for frequently accessed, slow-changing data
 * Strategy: TTL-based expiration with manual invalidation on updates
 * 
 * Default Config:
 * - TTL: 300s (5 minutes) - default expiration
 */
const DEFAULT_TTL = 300;
const CACHE_PREFIX = 'app:';

/**
 * Get data from cache or fetch and store
 * 
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in seconds
 * @param {Function} fetchFn - Async function to fetch data on cache miss
 * @returns {Promise<any>} - Cached or fetched data
 */
const getOrSet = async (key, ttl = DEFAULT_TTL, fetchFn) => {
  const fullKey = `${CACHE_PREFIX}${key}`;
  
  try {
    // Try to get from Redis
    const cached = await redis.get(fullKey);
    if (cached) {
      // logger.info(`✅ Cache HIT: ${fullKey}`);
      return JSON.parse(cached);
    }

    // Cache miss - fetch fresh data
    // logger.info(`❌ Cache MISS: ${fullKey} - Fetching fresh data...`);
    const data = await fetchFn();
    
    // Store in Redis with TTL
    if (data !== undefined && data !== null) {
      await redis.set(fullKey, JSON.stringify(data), 'EX', ttl);
      // logger.info(`💾 Cached: ${fullKey} (TTL: ${ttl}s)`);
    }
    
    return data;
  } catch (err) {
    logger.error(`Cache getOrSet error for key ${fullKey}:`, err);
    return await fetchFn(); // Fallback to fetching directly if Redis fails
  }
};

/**
 * Invalidate cache entries by pattern or key
 * 
 * @param {string} pattern - Pattern to match keys (optional)
 *                           If provided, invalidates all matching keys
 *                           If omitted, flushes keys with app prefix
 * 
 * Examples:
 *   invalidate('topView')     -> Deletes 'app:topView:5', 'app:topView:10', etc.
 *   invalidate('topView:5')   -> Deletes exact key 'app:topView:5'
 *   invalidate()              -> Clears all app keys
 */
const invalidate = async (pattern) => {
  try {
    if (pattern) {
      const fullPattern = `${CACHE_PREFIX}*${pattern}*`;
      const keys = await redis.keys(fullPattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`🗑️  Invalidated ${keys.length} keys matching: ${fullPattern}`);
      }
    } else {
      const keys = await redis.keys(`${CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      logger.info('🗑️  Flushed app cache');
    }
  } catch (err) {
    logger.error('Cache invalidate error:', err);
  }
};

/**
 * Get cache statistics
 * Useful for monitoring and debugging
 */
const getStats = async () => {
  try {
    const keys = await redis.keys(`${CACHE_PREFIX}*`);
    const info = await redis.info();
    
    return {
      appName: 'truyenviethay',
      activeKeysCount: keys.length,
      keys: keys.slice(0, 100), // Only return some keys for monitoring
      redisInfo: {
        used_memory_human: info.match(/used_memory_human:(.*)/)?.[1],
        connected_clients: info.match(/connected_clients:(.*)/)?.[1],
        uptime_in_days: info.match(/uptime_in_days:(.*)/)?.[1],
      }
    };
  } catch (err) {
    logger.error('Cache getStats error:', err);
    return { error: 'Failed to fetch stats' };
  }
};

module.exports = {
  getOrSet,
  invalidate,
  getStats,
};
