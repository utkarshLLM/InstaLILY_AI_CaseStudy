const logger = require('../config/logger');
const { sanitizeMessage, extractEntities } = require('../utils/sanitizers');
const { isMessageString, isMessageLengthValid, isMessageSafeFromControlCharacters } = require('../utils/validators');
const CONSTANTS = require('../config/constants');

/**
 * Message Service
 * Handles message validation, sanitization, and preprocessing
 */

/**
 * Preprocess a message
 * Includes validation, sanitization, tokenization, and entity extraction
 * @param {string} message - The message to preprocess
 * @returns {Promise<Object>} - Preprocessed message data
 */
const preprocessMessage = async (message) => {
  try {
    // ===== VALIDATION =====
    // Check type
    if (!isMessageString(message)) {
      throw new Error('Message must be a string');
    }

    // Check length
    if (!isMessageLengthValid(message)) {
      throw new Error(
        `Message must be between ${CONSTANTS.MESSAGE.MIN_LENGTH} and ${CONSTANTS.MESSAGE.MAX_LENGTH} characters`
      );
    }

    // Check for control characters
    if (!isMessageSafeFromControlCharacters(message)) {
      throw new Error('Message contains invalid characters');
    }

    // ===== SANITIZATION =====
    const sanitized = sanitizeMessage(message);

    // ===== TOKENIZATION =====
    // Split into tokens for analysis
    const tokens = tokenizeMessage(sanitized.cleaned);

    // ===== ENTITY EXTRACTION =====
    // Extract part numbers, model numbers, etc.
    const entities = extractEntities(sanitized.cleaned);

    const result = {
      original: sanitized.original,
      cleaned: sanitized.cleaned,
      sanitized: sanitized.sanitized,
      lowercase: sanitized.lowercase,
      tokens,
      entities,
      metadata: {
        length: sanitized.original.length,
        tokenCount: tokens.length,
        hasNumbers: /\d/.test(sanitized.cleaned),
        hasSpecialChars: /[^\w\s]/.test(sanitized.cleaned),
      },
    };

    logger.debug('Message preprocessed successfully', {
      originalLength: message.length,
      tokenCount: tokens.length,
      entityCount: (entities.partNumbers || []).length + (entities.modelNumbers || []).length,
    });

    return result;
  } catch (error) {
    logger.error('Error preprocessing message', {
      error: error.message,
      message: message.substring(0, 50),
    });
    throw error;
  }
};

/**
 * Tokenize a message into words
 * @param {string} message - The message to tokenize
 * @returns {Array<string>} - Array of tokens
 */
const tokenizeMessage = (message) => {
  // Split on whitespace and common punctuation
  const tokens = message
    .split(/[\s\-_.,!?;:()\[\]{}]+/)
    .filter((token) => token.length > 0)
    .map((token) => token.toLowerCase());

  return tokens;
};

/**
 * Extract keywords from tokens
 * @param {Array<string>} tokens - Tokens to analyze
 * @returns {Object} - Keywords by category
 */
const extractKeywords = (tokens) => {
  const inScopeKeywords = [];
  const outOfScopeKeywords = [];

  tokens.forEach((token) => {
    if (CONSTANTS.IN_SCOPE_KEYWORDS.includes(token)) {
      inScopeKeywords.push(token);
    }
    if (CONSTANTS.OUT_OF_SCOPE_KEYWORDS.includes(token)) {
      outOfScopeKeywords.push(token);
    }
  });

  return {
    inScope: inScopeKeywords,
    outOfScope: outOfScopeKeywords,
  };
};

/**
 * Validate message content
 * @param {string} message - The message to validate
 * @returns {Object} - { valid: boolean, errors: Array<string> }
 */
const validateMessageContent = (message) => {
  const errors = [];

  if (!isMessageString(message)) {
    errors.push('Message must be a string');
  }

  if (!isMessageLengthValid(message)) {
    errors.push(
      `Message must be between ${CONSTANTS.MESSAGE.MIN_LENGTH} and ${CONSTANTS.MESSAGE.MAX_LENGTH} characters`
    );
  }

  if (!isMessageSafeFromControlCharacters(message)) {
    errors.push('Message contains invalid control characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  preprocessMessage,
  tokenizeMessage,
  extractKeywords,
  validateMessageContent,
};
