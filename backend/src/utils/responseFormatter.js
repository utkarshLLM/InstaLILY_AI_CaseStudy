const CONSTANTS = require('../config/constants');

/**
 * Response Formatter Utilities
 * Formats all responses into consistent structure for frontend
 */

/**
 * Format successful chat response
 * @param {Object} params - Response parameters
 * @returns {Object} - Formatted response
 */
const formatChatResponse = ({
  sessionId,
  messageId,
  responseType = CONSTANTS.RESPONSE_TYPE.TEXT,
  content,
  data = null,
  metadata = {},
}) => {
  return {
    success: true,
    sessionId,
    messageId,
    response: {
      type: responseType,
      content,
      data,
    },
    metadata: {
      sessionId,
      messageId,
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };
};

/**
 * Format text response
 * @param {string} content - The text content
 * @param {Object} metadata - Additional metadata
 * @returns {Object}
 */
const formatTextResponse = (content, metadata = {}) => {
  return {
    type: CONSTANTS.RESPONSE_TYPE.TEXT,
    content,
    data: null,
    metadata,
  };
};

/**
 * Format product results response
 * @param {string} content - The main message
 * @param {Array} products - Array of product objects
 * @param {Object} metadata - Additional metadata
 * @returns {Object}
 */
const formatProductResultsResponse = (content, products = [], metadata = {}) => {
  return {
    type: CONSTANTS.RESPONSE_TYPE.PRODUCT_RESULTS,
    content,
    data: {
      products: products.map((product) => ({
        id: product.id || null,
        name: product.name || 'Unknown Product',
        price: product.price || 0,
        description: product.description || '',
        imageUrl: product.imageUrl || null,
        compatibility: product.compatibility || [],
        inStock: product.inStock !== undefined ? product.inStock : true,
      })),
      count: products.length,
    },
    metadata,
  };
};

/**
 * Format installation guide response
 * @param {string} content - The main message
 * @param {Array} steps - Array of installation steps
 * @param {Object} metadata - Additional metadata
 * @returns {Object}
 */
const formatInstallationGuideResponse = (content, steps = [], metadata = {}) => {
  return {
    type: CONSTANTS.RESPONSE_TYPE.INSTALLATION_GUIDE,
    content,
    data: {
      steps: steps.map((step, index) => ({
        step: step.step || index + 1,
        instruction: step.instruction || '',
        tips: step.tips || [],
        warnings: step.warnings || [],
        tools: step.tools || [],
      })),
      estimatedTime: metadata.estimatedTime || null,
      difficulty: metadata.difficulty || 'medium',
    },
    metadata,
  };
};

/**
 * Format troubleshooting response
 * @param {string} content - The main message
 * @param {Array} causes - Possible causes
 * @param {Array} solutions - Suggested solutions
 * @param {Object} metadata - Additional metadata
 * @returns {Object}
 */
const formatTroubleshootingResponse = (
  content,
  causes = [],
  solutions = [],
  metadata = {}
) => {
  return {
    type: CONSTANTS.RESPONSE_TYPE.TROUBLESHOOTING,
    content,
    data: {
      possibleCauses: causes.map((cause) => ({
        cause: cause.cause || '',
        probability: cause.probability || 'medium',
        description: cause.description || '',
        fix: cause.fix || '',
      })),
      suggestedSolutions: solutions.map((solution) => ({
        title: solution.title || '',
        steps: solution.steps || [],
        estimatedTime: solution.estimatedTime || null,
        recommendedParts: solution.recommendedParts || [],
      })),
    },
    metadata,
  };
};

/**
 * Format out-of-scope response
 * @param {string} content - The deflection message
 * @param {string} suggestion - What agent can help with
 * @param {Object} metadata - Additional metadata
 * @returns {Object}
 */
const formatOutOfScopeResponse = (
  content = "I'm specifically designed to help with Refrigerator and Dishwasher parts from PartSelect.",
  suggestion = 'How can I help you with your refrigerator or dishwasher parts?',
  metadata = {}
) => {
  return {
    type: CONSTANTS.RESPONSE_TYPE.OUT_OF_SCOPE,
    content,
    data: {
      suggestion,
    },
    metadata,
  };
};

/**
 * Format error response
 * @param {string} errorMessage - The error message
 * @param {string} errorCode - The error code
 * @param {Object} metadata - Additional metadata
 * @returns {Object}
 */
const formatErrorResponse = (
  errorMessage = 'An error occurred processing your request',
  errorCode = CONSTANTS.ERROR_CODE.INTERNAL_SERVER_ERROR,
  metadata = {}
) => {
  return {
    type: CONSTANTS.RESPONSE_TYPE.ERROR,
    content: errorMessage,
    data: {
      errorCode,
    },
    metadata,
  };
};

/**
 * Add metadata to any response
 * @param {Object} response - The response object
 * @param {Object} additionalMetadata - Metadata to add
 * @returns {Object} - Response with updated metadata
 */
const addMetadata = (response, additionalMetadata = {}) => {
  return {
    ...response,
    metadata: {
      ...response.metadata,
      ...additionalMetadata,
    },
  };
};

/**
 * Validate response structure
 * @param {Object} response - The response to validate
 * @returns {boolean}
 */
const isValidResponseStructure = (response) => {
  const requiredFields = ['type', 'content'];
  return (
    response &&
    typeof response === 'object' &&
    requiredFields.every((field) => field in response) &&
    Object.values(CONSTANTS.RESPONSE_TYPE).includes(response.type)
  );
};

module.exports = {
  formatChatResponse,
  formatTextResponse,
  formatProductResultsResponse,
  formatInstallationGuideResponse,
  formatTroubleshootingResponse,
  formatOutOfScopeResponse,
  formatErrorResponse,
  addMetadata,
  isValidResponseStructure,
};
