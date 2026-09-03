import pg from 'pg';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { Client: ElasticClient } from '@elastic/elasticsearch';
import logger from '../utils/logger.js';

const { Pool } = pg;

// PostgreSQL Configuration
export const postgresPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'nebula_db',
});

postgresPool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

// MongoDB Configuration
export async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nebula_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

// Redis Configuration
export const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err.message);
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

// Elasticsearch Configuration
export const elasticsearchClient = new ElasticClient({
  node: `http://${process.env.ELASTICSEARCH_HOST || 'localhost'}:${
    process.env.ELASTICSEARCH_PORT || 9200
  }`,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'password',
  },
});

// Test Elasticsearch connection
export async function testElasticsearchConnection() {
  try {
    const response = await elasticsearchClient.info();
    logger.info('Elasticsearch connected:', response.version.number);
  } catch (error) {
    logger.warn('Elasticsearch connection failed:', error.message);
  }
}

// Disconnect all clients
export async function disconnectAll() {
  try {
    await postgresPool.end();
    await mongoose.disconnect();
    await redisClient.quit();
    await elasticsearchClient.close();
    logger.info('All database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
}
