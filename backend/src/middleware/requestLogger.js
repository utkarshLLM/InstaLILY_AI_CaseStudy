const morgan = require('morgan');
const logger = require('../config/logger');
const environmentConfig = require('../config/environment');

/**
 * Request Logger Middleware
 * Logs all incoming requests with relevant metadata
 */

/**
 * Custom Morgan stream to use our logger
 */
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

/**
 * Custom Morgan format for structured logging
 */
const customFormat = ':method :url :status :response-time ms - :req[content-length] bytes';

/**
 * Create Morgan middleware
 */
const morganMiddleware = morgan(customFormat, {
  stream,
  skip: (req, res) => {
    // Skip health check endpoints in production
    if (environmentConfig.isProduction && req.path === '/health') {
      return true;
    }
    return false;
  },
});

/**
 * Custom request logger for more detailed logging
 */
const customRequestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capture response
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: JSON.stringify(data).length,
    };

    if (environmentConfig.isDevelopment) {
      logger.debug('Request completed', logData);
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  morganMiddleware,
  customRequestLogger,
};
