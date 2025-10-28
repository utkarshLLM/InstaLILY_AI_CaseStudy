const { v4: uuidv4 } = require('uuid');

/**
 * Helper Functions
 * General utility functions used throughout the application
 */

/**
 * Generate a unique ID
 * @returns {string} - UUID v4
 */
const generateUUID = () => {
  return uuidv4();
};

/**
 * Generate a unique message ID
 * @returns {string}
 */
const generateMessageId = () => {
  return `msg_${generateUUID()}`;
};

/**
 * Generate a unique session ID
 * @returns {string}
 */
const generateSessionId = () => {
  return generateUUID();
};

/**
 * Get current timestamp
 * @returns {string} - ISO format timestamp
 */
const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Calculate processing time in milliseconds
 * @param {number} startTime - Start time from Date.now()
 * @returns {number} - Elapsed time in ms
 */
const calculateProcessingTime = (startTime) => {
  return Date.now() - startTime;
};

/**
 * Retry logic for async functions
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delayMs - Delay between retries in milliseconds
 * @returns {Promise}
 */
const retryAsync = async (fn, maxRetries = 3, delayMs = 1000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
};

/**
 * Safely parse JSON with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any}
 */
const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return fallback;
  }
};

/**
 * Safely stringify object with fallback
 * @param {any} obj - Object to stringify
 * @param {string} fallback - Fallback value if stringification fails
 * @returns {string}
 */
const safeJsonStringify = (obj, fallback = '{}') => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    return fallback;
  }
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any}
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Merge objects (shallow)
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} - Merged object
 */
const mergeObjects = (target = {}, source = {}) => {
  return { ...target, ...source };
};

/**
 * Filter undefined and null values from object
 * @param {Object} obj - Object to filter
 * @returns {Object}
 */
const removeNullishValues = (obj) => {
  return Object.entries(obj)
    .filter(([, value]) => value !== null && value !== undefined)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
};

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: "...")
 * @returns {string}
 */
const truncateString = (str, maxLength = 100, suffix = '...') => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean}
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string}
 */
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert object to query string
 * @param {Object} obj - Object to convert
 * @returns {string}
 */
const objectToQueryString = (obj) => {
  return Object.entries(obj)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise}
 */
const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = {
  generateUUID,
  generateMessageId,
  generateSessionId,
  getCurrentTimestamp,
  calculateProcessingTime,
  retryAsync,
  safeJsonParse,
  safeJsonStringify,
  deepClone,
  mergeObjects,
  removeNullishValues,
  truncateString,
  isEmpty,
  capitalizeFirstLetter,
  objectToQueryString,
  delay,
};
