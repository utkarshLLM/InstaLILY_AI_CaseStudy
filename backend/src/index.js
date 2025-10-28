const express = require('express');
const helmet = require('helmet');
const environmentConfig = require('./config/environment');
const logger = require('./config/logger');
const { corsMiddleware, corsErrorHandler } = require('./middleware/corsHandler');
const { morganMiddleware, customRequestLogger } = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const chatRoutes = require('./routes/chat.routes');
const sessionService = require('./services/sessionService');

/**
 * Express Server Initialization
 * Main entry point for the backend application
 */

// Create Express app
const app = express();

// ===== SECURITY MIDDLEWARE =====
app.use(helmet()); // Set various HTTP headers for security

// ===== CORS MIDDLEWARE =====
app.use(corsMiddleware);
app.use(corsErrorHandler);

// ===== REQUEST LOGGING =====
app.use(morganMiddleware);

// ===== BODY PARSING MIDDLEWARE =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ===== CUSTOM MIDDLEWARE =====
app.use(customRequestLogger);

// ===== ROUTES =====
// Chat API routes
app.use('/api', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
    environment: environmentConfig.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ===== ERROR HANDLING =====
// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ===== SERVER STARTUP =====
const PORT = environmentConfig.port;
const server = app.listen(PORT, () => {
  logger.info(`✅ Backend server started`, {
    port: PORT,
    environment: environmentConfig.nodeEnv,
    frontendUrl: environmentConfig.frontendUrl,
  });
  logger.info(`📡 Chat endpoint available at http://localhost:${PORT}/api/chat`);
});

// ===== GRACEFUL SHUTDOWN =====
const gracefulShutdown = async () => {
  logger.info('🛑 Shutting down gracefully...');

  // Close server
  server.close(() => {
    logger.info('✅ Server closed');
  });

  // Clean up resources
  try {
    // Clear expired sessions
    await sessionService.clearExpiredSessions(0); // Clear all
    logger.info('✅ Sessions cleaned up');
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
  }

  // Exit process
  setTimeout(() => {
    logger.error('⚠️  Forced shutdown after 10 seconds');
    process.exit(1);
  }, 10000);
};

// Handle signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('⚠️  Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('⚠️  Unhandled Rejection', {
    reason: reason.message || String(reason),
    promise: String(promise),
  });
});

module.exports = app;
