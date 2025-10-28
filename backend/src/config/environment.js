require('dotenv').config();

/**
 * Environment Configuration
 * Centralizes all environment variables with validation and defaults
 */

const environmentConfig = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTesting: process.env.NODE_ENV === 'testing',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Session Management
  sessionExpiryMinutes: parseInt(process.env.SESSION_EXPIRY_MINUTES || '30', 10),
  sessionSecret: process.env.SESSION_SECRET || 'default-dev-secret-change-in-production',

  // LLM Configuration (Deepseek)
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || null,
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || null,
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || null,
  },

  // API Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

/**
 * Validate required environment variables
 */
const validateEnvironment = () => {
  const warnings = [];
  const errors = [];

  // Warnings for development
  if (environmentConfig.isDevelopment) {
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'default-dev-secret-change-in-production') {
      warnings.push('⚠️  SESSION_SECRET is using default value. Set a unique value for production.');
    }
  }

  // Errors for production
  if (environmentConfig.isProduction) {
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'default-dev-secret-change-in-production') {
      errors.push('❌ SESSION_SECRET must be set in production');
    }
    if (!process.env.DATABASE_URL) {
      warnings.push('⚠️  DATABASE_URL not set. Some features will use in-memory storage.');
    }
  }

  // Log warnings
  warnings.forEach((warning) => console.warn(warning));

  // Throw on critical errors
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    throw new Error('Critical environment variables are missing');
  }
};

// Validate on load
validateEnvironment();

module.exports = environmentConfig;
