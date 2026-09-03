import { createClient } from 'redis';
import logger from '../utils/logger.js';

// Create Redis client instance
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis max retries exceeded');
        return new Error('Redis max retries exceeded');
      }
      return Math.min(retries * 50, 500);
    },
  },
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
});

redisClient.on('error', (err) => logger.error('Redis error:', err.message));
redisClient.on('connect', () => logger.info('Redis connected'));
redisClient.on('ready', () => logger.info('Redis ready'));

// Connect to Redis
export async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed:', error.message);
    throw error;
  }
}

// Cache helpers
export const cache = {
  // Get value from cache
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.warn(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  },

  // Set value in cache
  async set(key, value, ttl = 3600) {
    try {
      const options = ttl ? { EX: ttl } : {};
      await redisClient.set(key, JSON.stringify(value), options);
    } catch (error) {
      logger.warn(`Cache set error for key ${key}:`, error.message);
    }
  },

  // Delete value from cache
  async delete(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.warn(`Cache delete error for key ${key}:`, error.message);
    }
  },

  // Clear pattern from cache
  async deletePattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.warn(`Cache delete pattern error for ${pattern}:`, error.message);
    }
  },

  // Get or set with fallback
  async getOrSet(key, fn, ttl = 3600) {
    try {
      const cached = await this.get(key);
      if (cached) return cached;

      const value = await fn();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      logger.warn(`Cache getOrSet error for key ${key}:`, error.message);
      return null;
    }
  },
};

export default redisClient;
