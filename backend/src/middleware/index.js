import logger from '../utils/logger.js';

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(
      `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

// Authentication middleware (basic implementation)
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'No authorization token provided' },
    });
  }

  // In production, verify JWT token
  req.userId = 'user-from-token'; // Mock user ID
  next();
};

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
          })),
        },
      });
    }

    req.body = value;
    next();
  };
};

// Rate limiting middleware (simple implementation)
const requestCounts = new Map();

export const rateLimit = (maxRequests = 100, windowMs = 900000) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }

    const requests = requestCounts.get(key).filter((time) => time > windowStart);
    requests.push(now);
    requestCounts.set(key, requests);

    if (requests.length > maxRequests) {
      return res.status(429).json({
        success: false,
        error: { message: 'Too many requests, please try again later' },
      });
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - requests.length);
    next();
  };
};

// CORS configuration
export const corsConfig = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
