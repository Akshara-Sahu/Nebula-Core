import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import apiRoutes from './routes/api.js';
import {
  errorHandler,
  requestLogger,
  rateLimit,
  corsConfig,
} from './middleware/index.js';
import { connectMongoDB, testElasticsearchConnection } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { initializePostgresDB } from './models/postgresModels.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());
app.use(cors(corsConfig));

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimit(100, 900000)); // 100 requests per 15 minutes

// API routes
app.use('/api', apiRoutes);

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Nebula Backend API',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database connections
async function initializeDatabases() {
  try {
    // Initialize PostgreSQL
    if (process.env.PG_HOST) {
      logger.info('Initializing PostgreSQL...');
      await initializePostgresDB();
    }

    // Connect MongoDB
    if (process.env.MONGODB_URI) {
      logger.info('Connecting to MongoDB...');
      await connectMongoDB();
    }

    // Connect Redis
    if (process.env.REDIS_HOST && process.env.ENABLE_REDIS_CACHE !== 'false') {
      logger.info('Connecting to Redis...');
      await connectRedis();
    }

    // Test Elasticsearch
    if (process.env.ELASTICSEARCH_HOST && process.env.ENABLE_ELASTICSEARCH !== 'false') {
      logger.info('Testing Elasticsearch connection...');
      await testElasticsearchConnection();
    }

    logger.info('All databases initialized successfully');
  } catch (error) {
    logger.error('Database initialization error:', error.message);
    // Continue even if some databases fail
  }
}

// Start server
async function startServer() {
  try {
    // Initialize databases
    await initializeDatabases();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║    Nebula Backend API Server Started              ║
║                                                    ║
║    Port: ${PORT}
║    Environment: ${NODE_ENV}
║    API URL: http://localhost:${PORT}/api         ║
║                                                    ║
║    Routes:                                         ║
║    • POST /api/analyze     - Code Analysis        ║
║    • POST /api/visualize   - Generate Diagrams    ║
║    • POST /api/explain     - AI Explanations      ║
║    • POST /api/save        - Save Progress        ║
║    • GET  /api/history     - Analysis History     ║
║    • GET  /api/health      - Health Check         ║
║                                                    ║
╚════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();

export default app;
