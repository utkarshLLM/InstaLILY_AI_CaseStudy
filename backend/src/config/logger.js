const environmentConfig = require('./environment');

/**
 * Logger Configuration
 * Provides structured logging with different levels
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const getCurrentLogLevel = () => {
  const level = environmentConfig.logLevel.toLowerCase();
  return LOG_LEVELS[level] !== undefined ? LOG_LEVELS[level] : LOG_LEVELS.info;
};

const shouldLog = (level) => {
  return LOG_LEVELS[level] >= getCurrentLogLevel();
};

const formatTimestamp = () => {
  return new Date().toISOString();
};

const formatLogMessage = (level, message, data = null) => {
  const timestamp = formatTimestamp();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (data) {
    return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
  }
  return `${prefix} ${message}`;
};

const logger = {
  debug: (message, data) => {
    if (shouldLog('debug')) {
      console.log(formatLogMessage('debug', message, data));
    }
  },

  info: (message, data) => {
    if (shouldLog('info')) {
      console.log(formatLogMessage('info', message, data));
    }
  },

  warn: (message, data) => {
    if (shouldLog('warn')) {
      console.warn(formatLogMessage('warn', message, data));
    }
  },

  error: (message, data) => {
    if (shouldLog('error')) {
      console.error(formatLogMessage('error', message, data));
    }
  },
};

module.exports = logger;
