const logger = require('../config/logger');
const CONSTANTS = require('../config/constants');
const environmentConfig = require('../config/environment');

/**
 * Global Error Handler Middleware
 * Catches and formats all errors with consistent response structure
 */

/**
 * Custom Error class for structured error handling
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = CONSTANTS.ERROR_CODE.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Global error handler middleware
 * Should be added as the last middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not our AppError, convert it
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const errorCode = error.code || CONSTANTS.ERROR_CODE.INTERNAL_SERVER_ERROR;
    error = new AppError(error.message || 'Internal Server Error', statusCode, errorCode);
  }

  // Log error
  const logData = {
    errorCode: error.errorCode,
    statusCode: error.statusCode,
    message: error.message,
    path: req.path,
    method: req.method,
  };

  if (environmentConfig.isDevelopment) {
    logData.stack = error.stack;
  }

  logger.error('Request error', logData);

  // Prepare response
  const response = {
    success: false,
    error: {
      code: error.errorCode,
      message: error.message,
    },
    metadata: {
      timestamp: error.timestamp,
      path: req.path,
    },
  };

  // Don't expose stack trace in production
  if (environmentConfig.isDevelopment && error.stack) {
    response.error.stack = error.stack;
  }

  // Send response
  res.status(error.statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.path} not found`, CONSTANTS.HTTP_STATUS.NOT_FOUND, 'ROUTE_NOT_FOUND');
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError,
};
