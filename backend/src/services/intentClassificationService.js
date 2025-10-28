const logger = require('../config/logger');
const { extractEntities } = require('../utils/sanitizers');
const CONSTANTS = require('../config/constants');

/**
 * Intent Classification Service
 * Classifies user intent into specific categories
 * Uses rule-based keyword matching
 */

/**
 * Classify intent of a message
 * @param {string} message - The cleaned, lowercase message
 * @returns {Promise<Object>} - Intent classification result
 */
const classifyIntent = async (message) => {
  try {
    const tokens = message.split(/\s+/);
    const entities = extractEntities(message);

    // Score each intent category
    const intentScores = {
      [CONSTANTS.INTENT.PRODUCT_SEARCH]: scoreIntent(tokens, CONSTANTS.INTENT_KEYWORDS.product_search),
      [CONSTANTS.INTENT.COMPATIBILITY_CHECK]: scoreIntent(tokens, CONSTANTS.INTENT_KEYWORDS.compatibility_check),
      [CONSTANTS.INTENT.INSTALLATION_GUIDE]: scoreIntent(tokens, CONSTANTS.INTENT_KEYWORDS.installation_guide),
      [CONSTANTS.INTENT.TROUBLESHOOTING]: scoreIntent(tokens, CONSTANTS.INTENT_KEYWORDS.troubleshooting),
      [CONSTANTS.INTENT.ORDER_SUPPORT]: scoreIntent(tokens, CONSTANTS.INTENT_KEYWORDS.order_support),
    };

    // Find highest scoring intent
    const topIntent = Object.entries(intentScores).reduce((prev, current) =>
      prev[1] > current[1] ? prev : current
    );

    const intent = topIntent[0];
    const score = topIntent[1];
    const confidence = Math.min(score / 100, 0.99);

    // Find matching keywords
    const matchingKeywords = findMatchingKeywords(tokens, CONSTANTS.INTENT_KEYWORDS[intent]);

    const context = {
      partNumber: entities.partNumbers?.[0] || null,
      modelNumber: entities.modelNumbers?.[0] || null,
      applianceType: detectApplianceType(message),
    };

    logger.debug('Intent classified', {
      intent,
      confidence,
      score,
      matchingKeywords: matchingKeywords.length,
    });

    return {
      intent,
      confidence,
      keywords: matchingKeywords,
      context,
      scores: intentScores,
    };
  } catch (error) {
    logger.error('Error classifying intent', { error: error.message });
    // Default to general inquiry on error
    return {
      intent: CONSTANTS.INTENT.GENERAL_INQUIRY,
      confidence: 0.3,
      keywords: [],
      context: {},
      scores: {},
    };
  }
};

/**
 * Score a message against intent keywords
 * @param {Array<string>} tokens - Message tokens
 * @param {Array<string>} intentKeywords - Keywords for this intent
 * @returns {number} - Score 0-100
 */
const scoreIntent = (tokens, intentKeywords) => {
  let score = 0;
  const matches = [];

  tokens.forEach((token) => {
    intentKeywords.forEach((keyword) => {
      // Exact match
      if (token === keyword || token === keyword.replace(/\s+/g, '')) {
        score += 15;
        matches.push(keyword);
      }
      // Partial match (keyword contains token)
      else if (keyword.includes(token) && token.length > 2) {
        score += 5;
        matches.push(keyword);
      }
    });
  });

  // Bonus for multiple matches
  if (matches.length > 1) {
    score += matches.length * 5;
  }

  return Math.min(score, 100);
};

/**
 * Find keywords in message that match intent keywords
 * @param {Array<string>} tokens - Message tokens
 * @param {Array<string>} intentKeywords - Intent keywords to match
 * @returns {Array<string>} - Matching keywords
 */
const findMatchingKeywords = (tokens, intentKeywords = []) => {
  const matches = [];

  tokens.forEach((token) => {
    intentKeywords.forEach((keyword) => {
      if ((token === keyword || keyword.includes(token)) && !matches.includes(keyword)) {
        matches.push(keyword);
      }
    });
  });

  return matches;
};

/**
 * Detect appliance type from message
 * @param {string} message - The message to analyze
 * @returns {string|null} - 'refrigerator' or 'dishwasher' or null
 */
const detectApplianceType = (message) => {
  if (/refrigerator|fridge|ice maker|freezer/i.test(message)) {
    return CONSTANTS.APPLIANCE_TYPE.REFRIGERATOR;
  }

  if (/dishwasher|wash|spray arm|filter|rinse/i.test(message)) {
    return CONSTANTS.APPLIANCE_TYPE.DISHWASHER;
  }

  return null;
};

/**
 * Suggest tools based on intent
 * @param {string} intent - The detected intent
 * @returns {Array<string>} - Suggested tool names
 */
const suggestTools = (intent) => {
  const toolMap = {
    [CONSTANTS.INTENT.PRODUCT_SEARCH]: ['productSearchTool'],
    [CONSTANTS.INTENT.COMPATIBILITY_CHECK]: ['compatibilityTool', 'productSearchTool'],
    [CONSTANTS.INTENT.INSTALLATION_GUIDE]: ['installationTool', 'productSearchTool'],
    [CONSTANTS.INTENT.TROUBLESHOOTING]: ['troubleshootingTool', 'productSearchTool'],
    [CONSTANTS.INTENT.ORDER_SUPPORT]: ['orderSupportTool'],
    [CONSTANTS.INTENT.GENERAL_INQUIRY]: ['productSearchTool'],
  };

  return toolMap[intent] || ['productSearchTool'];
};

module.exports = {
  classifyIntent,
  scoreIntent,
  findMatchingKeywords,
  detectApplianceType,
  suggestTools,
};
