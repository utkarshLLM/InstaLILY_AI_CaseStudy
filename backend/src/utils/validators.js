const Joi = require('joi');
const CONSTANTS = require('../config/constants');

/**
 * Input Validators
 * Schemas and functions for validating user input
 */

/**
 * Chat message validation schema
 */
const chatMessageSchema = Joi.object({
  message: Joi.string()
    .required()
    .min(CONSTANTS.MESSAGE.MIN_LENGTH)
    .max(CONSTANTS.MESSAGE.MAX_LENGTH)
    .trim()
    .messages({
      'string.empty': 'Message is required and cannot be empty',
      'string.min': `Message must be at least ${CONSTANTS.MESSAGE.MIN_LENGTH} character long`,
      'string.max': `Message must be at most ${CONSTANTS.MESSAGE.MAX_LENGTH} characters long`,
      'any.required': 'Message field is required',
    }),
  sessionId: Joi.string()
    .optional()
    .uuid({ version: ['uuidv4'] })
    .messages({
      'string.guid': 'Invalid session ID format',
    }),
});

/**
 * Session ID validation schema
 */
const sessionIdSchema = Joi.object({
  sessionId: Joi.string()
    .optional()
    .uuid({ version: ['uuidv4'] })
    .messages({
      'string.guid': 'Invalid session ID format',
    }),
});

/**
 * Validate chat message
 * @param {Object} data - The data to validate
 * @returns {Object} - { valid: boolean, error: string | null, value: Object }
 */
const validateChatMessage = (data) => {
  const { error, value } = chatMessageSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message).join('; ');
    return {
      valid: false,
      error: messages,
      value: null,
    };
  }

  return {
    valid: true,
    error: null,
    value,
  };
};

/**
 * Validate session ID
 * @param {string} sessionId - The session ID to validate
 * @returns {Object} - { valid: boolean, error: string | null }
 */
const validateSessionId = (sessionId) => {
  if (!sessionId) {
    return { valid: true, error: null }; // Optional field
  }

  const { error } = sessionIdSchema.validate({ sessionId });

  if (error) {
    return {
      valid: false,
      error: error.details[0].message,
    };
  }

  return { valid: true, error: null };
};

/**
 * Check if message contains only valid characters
 * Prevents control characters and null bytes
 * @param {string} message - The message to check
 * @returns {boolean}
 */
const isMessageSafeFromControlCharacters = (message) => {
  // Check for null bytes and control characters
  const controlCharPattern = /[\x00-\x08\x0B-\x0C\x0E-\x1F]/g;
  return !controlCharPattern.test(message);
};

/**
 * Check if message length is valid
 * @param {string} message - The message to check
 * @returns {boolean}
 */
const isMessageLengthValid = (message) => {
  const length = message.trim().length;
  return length >= CONSTANTS.MESSAGE.MIN_LENGTH && length <= CONSTANTS.MESSAGE.MAX_LENGTH;
};

/**
 * Check if message is a string
 * @param {any} message - The message to check
 * @returns {boolean}
 */
const isMessageString = (message) => {
  return typeof message === 'string';
};

module.exports = {
  chatMessageSchema,
  sessionIdSchema,
  validateChatMessage,
  validateSessionId,
  isMessageSafeFromControlCharacters,
  isMessageLengthValid,
  isMessageString,
};
