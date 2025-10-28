/**
 * Input Sanitizers
 * Functions to sanitize and clean user input
 */

/**
 * HTML entity encoding for XSS prevention
 * @param {string} str - The string to encode
 * @returns {string} - HTML-encoded string
 */
const encodeHtmlEntities = (str) => {
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
};

/**
 * Remove leading and trailing whitespace
 * @param {string} str - The string to trim
 * @returns {string}
 */
const trimWhitespace = (str) => {
  return str.trim();
};

/**
 * Remove extra whitespace between words
 * @param {string} str - The string to normalize
 * @returns {string}
 */
const normalizeWhitespace = (str) => {
  return str.replace(/\s+/g, ' ').trim();
};

/**
 * Convert to lowercase for processing (while keeping original)
 * @param {string} str - The string to convert
 * @returns {string}
 */
const toLowercase = (str) => {
  return str.toLowerCase();
};

/**
 * Remove special characters while keeping alphanumeric and common punctuation
 * @param {string} str - The string to clean
 * @returns {string}
 */
const removeSpecialCharacters = (str) => {
  // Keeps alphanumeric, spaces, hyphens, underscores, periods, and common punctuation
  return str.replace(/[^a-zA-Z0-9\s\-_.!?,()]/g, '');
};

/**
 * Remove null bytes and control characters
 * @param {string} str - The string to clean
 * @returns {string}
 */
const removeControlCharacters = (str) => {
  return str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
};

/**
 * Sanitize message for storage and processing
 * @param {string} message - The message to sanitize
 * @returns {Object} - { original: string, cleaned: string, lowercase: string }
 */
const sanitizeMessage = (message) => {
  if (typeof message !== 'string') {
    throw new Error('Message must be a string');
  }

  // Step 1: Remove control characters
  let cleaned = removeControlCharacters(message);

  // Step 2: Trim whitespace
  cleaned = trimWhitespace(cleaned);

  // Step 3: Normalize internal whitespace
  cleaned = normalizeWhitespace(cleaned);

  // Step 4: Encode HTML entities for XSS prevention
  const htmlEncoded = encodeHtmlEntities(cleaned);

  // Step 5: Create lowercase version for intent matching
  const lowercase = toLowercase(cleaned);

  return {
    original: message, // Original message as received
    cleaned: cleaned, // Cleaned but not lowercase
    sanitized: htmlEncoded, // HTML-encoded for safe storage
    lowercase: lowercase, // For intent matching
  };
};

/**
 * Validate and sanitize session ID
 * @param {string} sessionId - The session ID to sanitize
 * @returns {string | null} - Sanitized session ID or null if invalid
 */
const sanitizeSessionId = (sessionId) => {
  if (!sessionId) return null;

  // Session IDs should only contain alphanumeric characters, hyphens, and underscores
  const sanitized = String(sessionId).replace(/[^a-zA-Z0-9\-_]/g, '');

  // Limit length to 50 characters
  return sanitized.substring(0, 50) || null;
};

/**
 * Extract part number from message (e.g., PS11752778)
 * @param {string} message - The message to search
 * @returns {string | null} - Part number if found
 */
const extractPartNumber = (message) => {
  const partNumberPattern = /PS\d{6,}/gi;
  const match = message.match(partNumberPattern);
  return match ? match[0].toUpperCase() : null;
};

/**
 * Extract model number from message (e.g., WDT780SAEM1)
 * @param {string} message - The message to search
 * @returns {string | null} - Model number if found
 */
const extractModelNumber = (message) => {
  // Pattern for common appliance model numbers
  const modelPattern = /([A-Z]{1,3}\d{3,4}[A-Z]{0,2}\d+[A-Z]?\d*)/g;
  const matches = message.match(modelPattern);
  
  if (!matches) return null;

  // Filter out part numbers and return first valid model
  return matches.find((match) => !match.startsWith('PS')) || null;
};

/**
 * Extract all entities from message (part numbers, model numbers)
 * @param {string} message - The message to search
 * @returns {Object} - { partNumbers: [], modelNumbers: [] }
 */
const extractEntities = (message) => {
  const partNumbers = [];
  const modelNumbers = [];

  // Extract part numbers
  const partMatches = message.match(/PS\d{6,}/gi);
  if (partMatches) {
    partNumbers.push(...partMatches.map((p) => p.toUpperCase()));
  }

  // Extract model numbers
  const modelMatches = message.match(/([A-Z]{1,3}\d{3,4}[A-Z]{0,2}\d+[A-Z]?\d*)/g);
  if (modelMatches) {
    modelNumbers.push(...modelMatches.filter((m) => !m.startsWith('PS')));
  }

  return {
    partNumbers: [...new Set(partNumbers)], // Remove duplicates
    modelNumbers: [...new Set(modelNumbers)],
  };
};

module.exports = {
  encodeHtmlEntities,
  trimWhitespace,
  normalizeWhitespace,
  toLowercase,
  removeSpecialCharacters,
  removeControlCharacters,
  sanitizeMessage,
  sanitizeSessionId,
  extractPartNumber,
  extractModelNumber,
  extractEntities,
};
