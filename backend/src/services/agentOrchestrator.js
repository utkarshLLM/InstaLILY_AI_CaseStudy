const logger = require('../config/logger');
const { formatTextResponse } = require('../utils/responseFormatter');
const CONSTANTS = require('../config/constants');

/**
 * Agent Orchestrator
 * Coordinates the message processing pipeline
 * Routes to appropriate tools based on intent
 * This is a Phase 1 implementation with mock responses
 * Will be enhanced with real tool integration in later phases
 */

/**
 * Process a message through the agent pipeline
 * @param {Object} input - Orchestrator input
 * @returns {Promise<Object>} - Orchestrated response
 */
const processMessage = async (input) => {
  const {
    originalMessage,
    preprocessedMessage,
    scope,
    intent,
    session,
    messageId,
    sessionId,
  } = input;

  try {
    logger.debug('Agent orchestrator processing', {
      messageId,
      intent: intent.intent,
      context: intent.context,
    });

    // ===== ROUTE TO APPROPRIATE HANDLER BASED ON INTENT =====
    let response;

    switch (intent.intent) {
      case CONSTANTS.INTENT.PRODUCT_SEARCH:
        response = await handleProductSearch(preprocessedMessage, intent, messageId);
        break;

      case CONSTANTS.INTENT.COMPATIBILITY_CHECK:
        response = await handleCompatibilityCheck(preprocessedMessage, intent, messageId);
        break;

      case CONSTANTS.INTENT.INSTALLATION_GUIDE:
        response = await handleInstallationGuide(preprocessedMessage, intent, messageId);
        break;

      case CONSTANTS.INTENT.TROUBLESHOOTING:
        response = await handleTroubleshooting(preprocessedMessage, intent, messageId);
        break;

      case CONSTANTS.INTENT.ORDER_SUPPORT:
        response = await handleOrderSupport(preprocessedMessage, intent, messageId);
        break;

      case CONSTANTS.INTENT.GENERAL_INQUIRY:
      default:
        response = await handleGeneralInquiry(preprocessedMessage, intent, messageId);
        break;
    }

    return response;
  } catch (error) {
    logger.error('Error in agent orchestration', {
      error: error.message,
      messageId,
      intent: intent.intent,
    });

    // Fallback response on error
    return {
      type: CONSTANTS.RESPONSE_TYPE.TEXT,
      content: 'I encountered an error processing your request. Please try again.',
      toolsUsed: [],
    };
  }
};

/**
 * Handle product search intent
 * @param {Object} preprocessedMessage - Preprocessed message data
 * @param {Object} intent - Intent classification result
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} - Response
 */
const handleProductSearch = async (preprocessedMessage, intent, messageId) => {
  logger.debug('Handling product search', { messageId });

  // Phase 1: Mock response
  // This will be replaced with real productSearchTool call in Phase 6
  const mockProducts = [
    {
      id: 'PS11752778',
      name: 'Water Inlet Valve Assembly',
      price: 45.99,
      description: 'Replacement water inlet valve for refrigerators',
      imageUrl: 'https://via.placeholder.com/200',
      compatibility: ['WDT780SAEM1', 'WDE3100DW01'],
      inStock: true,
    },
    {
      id: 'PS12345678',
      name: 'Refrigerator Water Filter',
      price: 28.50,
      description: 'Standard water filter for most refrigerator models',
      imageUrl: 'https://via.placeholder.com/200',
      compatibility: ['Various models'],
      inStock: true,
    },
  ];

  const content = `I found some products that might help. Here are the results for your search:`;

  return {
    type: CONSTANTS.RESPONSE_TYPE.PRODUCT_RESULTS,
    content,
    data: {
      products: mockProducts,
      count: mockProducts.length,
    },
    toolsUsed: ['productSearchTool (mock)'],
  };
};

/**
 * Handle compatibility check intent
 * @param {Object} preprocessedMessage - Preprocessed message data
 * @param {Object} intent - Intent classification result
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} - Response
 */
const handleCompatibilityCheck = async (preprocessedMessage, intent, messageId) => {
  logger.debug('Handling compatibility check', {
    messageId,
    modelNumber: intent.context.modelNumber,
    partNumber: intent.context.partNumber,
  });

  // Phase 1: Mock response
  // Will be replaced with real compatibilityTool call
  const modelNumber = intent.context.modelNumber || 'WDT780SAEM1';
  const partNumber = intent.context.partNumber || 'PS11752778';

  const content = `Great question! I can help you check compatibility.

Part ${partNumber} is compatible with your ${modelNumber} model.

This is a common replacement part for this model and should work perfectly. The installation should take about 15-20 minutes.

Would you like:
1. Installation instructions for this part?
2. Information about the part price and availability?
3. Alternative compatible parts?`;

  return {
    type: CONSTANTS.RESPONSE_TYPE.TEXT,
    content,
    data: null,
    toolsUsed: ['compatibilityTool (mock)'],
  };
};

/**
 * Handle installation guide intent
 * @param {Object} preprocessedMessage - Preprocessed message data
 * @param {Object} intent - Intent classification result
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} - Response
 */
const handleInstallationGuide = async (preprocessedMessage, intent, messageId) => {
  logger.debug('Handling installation guide', {
    messageId,
    partNumber: intent.context.partNumber,
  });

  // Phase 1: Mock response
  // Will be replaced with real installationTool call
  const partNumber = intent.context.partNumber || 'PS11752778';

  const mockSteps = [
    {
      step: 1,
      instruction: 'Turn off the power to your appliance at the breaker',
      tips: ['Wait 5 minutes after power is off before proceeding'],
      warnings: ['Ensure power is completely off for safety'],
      tools: [],
    },
    {
      step: 2,
      instruction: 'Locate the water inlet valve (usually at the bottom rear)',
      tips: ['Consult your user manual for exact location'],
      warnings: [],
      tools: ['Flashlight'],
    },
    {
      step: 3,
      instruction: 'Disconnect the inlet hoses from the old valve',
      tips: ['Have a towel ready to catch any remaining water'],
      warnings: ['Water may still be present in hoses'],
      tools: ['Wrench', 'Towel'],
    },
    {
      step: 4,
      instruction: 'Install the new valve in the same position',
      tips: ['Ensure rubber seals are properly positioned'],
      warnings: [],
      tools: ['Wrench'],
    },
    {
      step: 5,
      instruction: 'Reconnect the inlet hoses',
      tips: ['Hand-tighten first, then use wrench to secure'],
      warnings: ['Do not overtighten - this can damage the valve'],
      tools: ['Wrench'],
    },
    {
      step: 6,
      instruction: 'Turn the power back on and test for leaks',
      tips: ['Run a short test cycle to ensure proper operation'],
      warnings: [],
      tools: [],
    },
  ];

  const content = `Here are the installation instructions for part ${partNumber}:`;

  return {
    type: CONSTANTS.RESPONSE_TYPE.INSTALLATION_GUIDE,
    content,
    data: {
      steps: mockSteps,
      estimatedTime: 30,
      difficulty: 'medium',
    },
    toolsUsed: ['installationTool (mock)'],
  };
};

/**
 * Handle troubleshooting intent
 * @param {Object} preprocessedMessage - Preprocessed message data
 * @param {Object} intent - Intent classification result
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} - Response
 */
const handleTroubleshooting = async (preprocessedMessage, intent, messageId) => {
  logger.debug('Handling troubleshooting', { messageId });

  // Phase 1: Mock response
  // Will be replaced with real troubleshootingTool call

  const mockCauses = [
    {
      cause: 'Frozen water line',
      probability: 'high',
      description: 'The water inlet line is frozen due to cold temperatures',
      fix: 'Thaw the line using warm water or wait for warmer conditions',
    },
    {
      cause: 'Faulty water inlet valve',
      probability: 'medium',
      description: 'The valve may be stuck or defective',
      fix: 'Replace the water inlet valve',
    },
    {
      cause: 'Clogged filter',
      probability: 'medium',
      description: 'The water filter may be blocked',
      fix: 'Replace the water filter',
    },
    {
      cause: 'Low water pressure',
      probability: 'low',
      description: 'Your home may have low water pressure',
      fix: 'Check your home water pressure and contact a plumber if needed',
    },
  ];

  const content = `I can help you troubleshoot this issue. Here are the most likely causes based on your symptoms:`;

  return {
    type: CONSTANTS.RESPONSE_TYPE.TROUBLESHOOTING,
    content,
    data: {
      possibleCauses: mockCauses,
      suggestedSolutions: [
        {
          title: 'Quick Fix: Check for Frozen Lines',
          steps: ['Inspect the water inlet lines', 'If frozen, apply warm water', 'Test ice maker after thawing'],
          estimatedTime: 15,
          recommendedParts: [],
        },
        {
          title: 'Replacement Solution: Replace Water Inlet Valve',
          steps: ['Purchase replacement valve PS11752778', 'Follow installation guide', 'Test the ice maker'],
          estimatedTime: 30,
          recommendedParts: ['PS11752778'],
        },
      ],
    },
    toolsUsed: ['troubleshootingTool (mock)'],
  };
};

/**
 * Handle order support intent
 * @param {Object} preprocessedMessage - Preprocessed message data
 * @param {Object} intent - Intent classification result
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} - Response
 */
const handleOrderSupport = async (preprocessedMessage, intent, messageId) => {
  logger.debug('Handling order support', { messageId });

  // Phase 1: Mock response
  const content = `I can help with order-related questions! 

Unfortunately, I don't yet have access to your order history or pricing database. However, I can help you:

1. Find the right parts for your appliance
2. Get installation instructions
3. Troubleshoot issues

Once you've found the part you need, you can add it to your cart directly on PartSelect.com.

What parts are you looking for?`;

  return {
    type: CONSTANTS.RESPONSE_TYPE.TEXT,
    content,
    data: null,
    toolsUsed: ['orderSupportTool (mock)'],
  };
};

/**
 * Handle general inquiry intent
 * @param {Object} preprocessedMessage - Preprocessed message data
 * @param {Object} intent - Intent classification result
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} - Response
 */
const handleGeneralInquiry = async (preprocessedMessage, intent, messageId) => {
  logger.debug('Handling general inquiry', { messageId });

  const content = `I'm here to help with your refrigerator and dishwasher parts!

You can ask me about:
- Finding specific parts
- Checking if a part is compatible with your model
- Installation instructions
- Troubleshooting issues
- Order information

What would you like to know?`;

  return {
    type: CONSTANTS.RESPONSE_TYPE.TEXT,
    content,
    data: null,
    toolsUsed: [],
  };
};

module.exports = {
  processMessage,
  handleProductSearch,
  handleCompatibilityCheck,
  handleInstallationGuide,
  handleTroubleshooting,
  handleOrderSupport,
  handleGeneralInquiry,
};
