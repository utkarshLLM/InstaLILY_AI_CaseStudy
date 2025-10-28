const express = require('express');
const chatController = require('../controllers/chatController');

/**
 * Chat Routes
 * Defines all chat-related endpoints
 */

const router = express.Router();

/**
 * POST /api/chat
 * Handle incoming chat messages
 */
router.post('/chat', chatController.handleChatMessage);

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
