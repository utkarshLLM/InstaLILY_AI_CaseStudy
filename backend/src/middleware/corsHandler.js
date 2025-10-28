const cors = require('cors');
const environmentConfig = require('../config/environment');
const logger = require('../config/logger');

/**
 * CORS Middleware Configuration
 * Handles Cross-Origin Resource Sharing for frontend-backend communication
 */

const corsOptions = {
  origin: environmentConfig.frontendUrl,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

const corsMiddleware = cors(corsOptions);

/**
 * Custom CORS error handler
 */
const corsErrorHandler = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    logger.warn('CORS Error', {
      origin: req.get('origin'),
      method: req.method,
      path: req.path,
    });
    return res.status(403).json({
      success: false,
      error: {
        code: 'CORS_ERROR',
        message: 'Cross-origin request not allowed',
      },
    });
  }
  next(err);
};

module.exports = {
  corsMiddleware,
  corsErrorHandler,
  corsOptions,
};
