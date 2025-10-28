const logger = require('../config/logger');
const CONSTANTS = require('../config/constants');

/**
 * Scope Detection Service
 * Determines if a message is within the PartSelect refrigerator/dishwasher parts domain
 */

/**
 * Detect if message is in scope
 * Uses keyword matching and pattern detection
 * @param {string} message - The lowercase, cleaned message
 * @returns {Promise<Object>} - Scope detection result
 */
const detectScope = async (message) => {
  try {
    const tokens = message.split(/\s+/);
    const inScopeScore = calculateInScopeScore(tokens);
    const outOfScopeScore = calculateOutOfScopeScore(tokens);
    const patternScore = detectPatterns(message);

    // Calculate confidence
    const hasPartNumber = CONSTANTS.PATTERNS.PART_NUMBER.test(message);
    const hasModelNumber = CONSTANTS.PATTERNS.MODEL_NUMBER.test(message);

    // If explicit patterns are found, it's definitely in scope
    if (hasPartNumber || hasModelNumber) {
      return {
        inScope: true,
        confidence: 1.0,
        reason: 'Explicit part or model number pattern detected',
        category: 'parts_inquiry',
        score: {
          inScope: 100,
          outOfScope: 0,
          patterns: 100,
        },
      };
    }

    // If contains strong out-of-scope indicators, it's out of scope
    if (outOfScopeScore > inScopeScore + 20) {
      return {
        inScope: false,
        confidence: Math.min(0.95, outOfScopeScore / 100),
        reason: 'Message contains out-of-scope keywords',
        category: 'out_of_scope',
        score: {
          inScope: inScopeScore,
          outOfScope: outOfScopeScore,
          patterns: patternScore,
        },
      };
    }

    // If strong in-scope indicators
    if (inScopeScore > outOfScopeScore + 10) {
      const category = categorizeInScopeMessage(tokens);
      return {
        inScope: true,
        confidence: Math.min(0.95, inScopeScore / 100),
        reason: 'Message contains relevant keywords',
        category,
        score: {
          inScope: inScopeScore,
          outOfScope: outOfScopeScore,
          patterns: patternScore,
        },
      };
    }

    // Default: if no strong signals, consider it in scope (more permissive)
    // This allows for messages that might not have obvious keywords but are related
    return {
      inScope: true,
      confidence: 0.5, // Lower confidence for ambiguous messages
      reason: 'Message appears to be parts-related',
      category: 'general_inquiry',
      score: {
        inScope: inScopeScore,
        outOfScope: outOfScopeScore,
        patterns: patternScore,
      },
    };
  } catch (error) {
    logger.error('Error in scope detection', { error: error.message, message: message.substring(0, 50) });
    // On error, default to in-scope to avoid rejecting valid queries
    return {
      inScope: true,
      confidence: 0.3,
      reason: 'Error during scope detection, defaulting to in-scope',
      category: 'general_inquiry',
    };
  }
};

/**
 * Calculate in-scope score based on keywords
 * @param {Array<string>} tokens - Message tokens
 * @returns {number} - Score 0-100
 */
const calculateInScopeScore = (tokens) => {
  let score = 0;

  tokens.forEach((token) => {
    // Check if token is in in-scope keywords
    const inScopeKeywords = CONSTANTS.IN_SCOPE_KEYWORDS || [];

    // Exact match
    if (inScopeKeywords.includes(token)) {
      score += 10;
    }

    // Partial match (contains keyword)
    if (inScopeKeywords.some((keyword) => keyword.includes(token) || token.includes(keyword))) {
      score += 3;
    }
  });

  return Math.min(score, 100);
};

/**
 * Calculate out-of-scope score based on keywords
 * @param {Array<string>} tokens - Message tokens
 * @returns {number} - Score 0-100
 */
const calculateOutOfScopeScore = (tokens) => {
  let score = 0;

  tokens.forEach((token) => {
    const outOfScopeKeywords = CONSTANTS.OUT_OF_SCOPE_KEYWORDS || [];

    // Exact match
    if (outOfScopeKeywords.includes(token)) {
      score += 15; // Higher weight for out-of-scope
    }

    // Partial match
    if (outOfScopeKeywords.some((keyword) => keyword.includes(token) || token.includes(keyword))) {
      score += 5;
    }
  });

  return Math.min(score, 100);
};

/**
 * Detect specific patterns in message
 * @param {string} message - The message to analyze
 * @returns {number} - Pattern score 0-100
 */
const detectPatterns = (message) => {
  let score = 0;

  // Part number pattern
  if (CONSTANTS.PATTERNS.PART_NUMBER.test(message)) {
    score += 40;
  }

  // Model number pattern
  if (CONSTANTS.PATTERNS.MODEL_NUMBER.test(message)) {
    score += 30;
  }

  // Appliance type pattern
  if (/refrigerator|fridge|dishwasher/i.test(message)) {
    score += 20;
  }

  return Math.min(score, 100);
};

/**
 * Categorize an in-scope message
 * @param {Array<string>} tokens - Message tokens
 * @returns {string} - Category
 */
const categorizeInScopeMessage = (tokens) => {
  const message = tokens.join(' ');

  // Installation keywords
  if (/install|setup|assemble|attach|how to/i.test(message)) {
    return 'installation_inquiry';
  }

  // Compatibility keywords
  if (/compatible|fit|work with|support|match/i.test(message)) {
    return 'compatibility_check';
  }

  // Troubleshooting keywords
  if (/broken|not working|fix|repair|problem|issue|leak|freeze|noise/i.test(message)) {
    return 'troubleshooting_inquiry';
  }

  // Order/purchase keywords
  if (/order|price|cost|buy|cart|checkout|shipping/i.test(message)) {
    return 'order_support';
  }

  // Default to general parts inquiry
  return 'parts_inquiry';
};

module.exports = {
  detectScope,
  calculateInScopeScore,
  calculateOutOfScopeScore,
  detectPatterns,
  categorizeInScopeMessage,
};
