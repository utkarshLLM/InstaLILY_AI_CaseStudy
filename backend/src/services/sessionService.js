const logger = require('../config/logger');
const { getCurrentTimestamp } = require('../utils/helpers');
const CONSTANTS = require('../config/constants');

/**
 * Session Service
 * Manages user sessions and conversation history
 * Note: Currently uses in-memory storage. Will be replaced with database later.
 */

// In-memory session store (to be replaced with database)
const sessionStore = new Map();

/**
 * Create a new session
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>} - The created session
 */
const createSession = async (sessionId) => {
  try {
    const session = {
      sessionId,
      createdAt: getCurrentTimestamp(),
      lastActivity: getCurrentTimestamp(),
      userContext: {
        applianceModels: [],
        preferences: {},
      },
      conversationHistory: [],
      isActive: true,
    };

    sessionStore.set(sessionId, session);
    logger.info('Session created', { sessionId });

    return session;
  } catch (error) {
    logger.error('Error creating session', { error: error.message, sessionId });
    throw error;
  }
};

/**
 * Get an existing session
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object|null>} - The session or null if not found
 */
const getSession = async (sessionId) => {
  try {
    const session = sessionStore.get(sessionId);

    if (!session) {
      logger.debug('Session not found', { sessionId });
      return null;
    }

    // Update last activity
    session.lastActivity = getCurrentTimestamp();
    sessionStore.set(sessionId, session);

    logger.debug('Session retrieved', { sessionId, messageCount: session.conversationHistory.length });

    return session;
  } catch (error) {
    logger.error('Error getting session', { error: error.message, sessionId });
    throw error;
  }
};

/**
 * Add a message to conversation history
 * @param {string} sessionId - The session ID
 * @param {Object} messageData - The message to add
 * @returns {Promise<Object>} - The added message
 */
const addMessageToHistory = async (sessionId, messageData) => {
  try {
    const session = sessionStore.get(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const historyMessage = {
      messageId: messageData.messageId,
      role: messageData.role, // 'user' or 'assistant'
      message: messageData.message,
      timestamp: getCurrentTimestamp(),
      metadata: messageData.metadata || {},
    };

    session.conversationHistory.push(historyMessage);
    session.lastActivity = getCurrentTimestamp();

    sessionStore.set(sessionId, session);

    logger.debug('Message added to history', {
      sessionId,
      role: messageData.role,
      historyLength: session.conversationHistory.length,
    });

    return historyMessage;
  } catch (error) {
    logger.error('Error adding message to history', {
      error: error.message,
      sessionId,
    });
    throw error;
  }
};

/**
 * Get conversation history for a session
 * @param {string} sessionId - The session ID
 * @param {number} limit - Maximum number of messages to return (0 for all)
 * @returns {Promise<Array>} - Array of messages
 */
const getConversationHistory = async (sessionId, limit = 0) => {
  try {
    const session = sessionStore.get(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    let history = session.conversationHistory;

    if (limit > 0) {
      // Return last 'limit' messages
      history = history.slice(-limit);
    }

    logger.debug('Conversation history retrieved', {
      sessionId,
      messageCount: history.length,
    });

    return history;
  } catch (error) {
    logger.error('Error getting conversation history', {
      error: error.message,
      sessionId,
    });
    throw error;
  }
};

/**
 * Update user context in session
 * @param {string} sessionId - The session ID
 * @param {Object} contextData - Context data to update
 * @returns {Promise<Object>} - Updated session
 */
const updateUserContext = async (sessionId, contextData) => {
  try {
    const session = sessionStore.get(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.userContext = {
      ...session.userContext,
      ...contextData,
    };

    session.lastActivity = getCurrentTimestamp();
    sessionStore.set(sessionId, session);

    logger.debug('User context updated', { sessionId });

    return session;
  } catch (error) {
    logger.error('Error updating user context', {
      error: error.message,
      sessionId,
    });
    throw error;
  }
};

/**
 * End a session
 * @param {string} sessionId - The session ID
 * @returns {Promise<void>}
 */
const endSession = async (sessionId) => {
  try {
    const session = sessionStore.get(sessionId);

    if (session) {
      session.isActive = false;
      sessionStore.set(sessionId, session);
      logger.info('Session ended', { sessionId });
    }
  } catch (error) {
    logger.error('Error ending session', {
      error: error.message,
      sessionId,
    });
    throw error;
  }
};

/**
 * Clear expired sessions (for cleanup)
 * @param {number} expiryMinutes - Sessions inactive for more than this are cleared
 * @returns {Promise<number>} - Number of sessions cleared
 */
const clearExpiredSessions = async (expiryMinutes = CONSTANTS.SESSION.DEFAULT_EXPIRY_MINUTES) => {
  try {
    const now = new Date();
    const expiryMs = expiryMinutes * 60 * 1000;
    let clearedCount = 0;

    sessionStore.forEach((session, sessionId) => {
      const lastActivityTime = new Date(session.lastActivity);
      const inactivityDuration = now - lastActivityTime;

      if (inactivityDuration > expiryMs) {
        sessionStore.delete(sessionId);
        clearedCount++;
        logger.debug('Expired session cleared', { sessionId });
      }
    });

    logger.info('Session cleanup completed', { clearedCount, totalSessions: sessionStore.size });

    return clearedCount;
  } catch (error) {
    logger.error('Error clearing expired sessions', { error: error.message });
    throw error;
  }
};

/**
 * Get all active sessions (for monitoring)
 * @returns {Promise<Array>} - Array of active sessions
 */
const getAllActiveSessions = async () => {
  try {
    const activeSessions = Array.from(sessionStore.values()).filter((s) => s.isActive);
    logger.debug('Retrieved all active sessions', { count: activeSessions.length });
    return activeSessions;
  } catch (error) {
    logger.error('Error getting active sessions', { error: error.message });
    throw error;
  }
};

module.exports = {
  createSession,
  getSession,
  addMessageToHistory,
  getConversationHistory,
  updateUserContext,
  endSession,
  clearExpiredSessions,
  getAllActiveSessions,
};
