/**
 * Application Constants
 * Centralized constants used throughout the application
 */

const CONSTANTS = {
  // Message Constraints
  MESSAGE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 5000,
  },

  // Intent Types
  INTENT: {
    PRODUCT_SEARCH: 'product_search',
    COMPATIBILITY_CHECK: 'compatibility_check',
    INSTALLATION_GUIDE: 'installation_guide',
    TROUBLESHOOTING: 'troubleshooting',
    ORDER_SUPPORT: 'order_support',
    GENERAL_INQUIRY: 'general_inquiry',
  },

  // Response Types
  RESPONSE_TYPE: {
    TEXT: 'text',
    PRODUCT_RESULTS: 'product_results',
    INSTALLATION_GUIDE: 'installation_guide',
    TROUBLESHOOTING: 'troubleshooting',
    OUT_OF_SCOPE: 'out_of_scope',
    ERROR: 'error',
  },

  // Error Codes
  ERROR_CODE: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MESSAGE_REQUIRED: 'MESSAGE_REQUIRED',
    MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
    MESSAGE_INVALID_FORMAT: 'MESSAGE_INVALID_FORMAT',
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
    TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
    TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',
    LLM_SERVICE_UNAVAILABLE: 'LLM_SERVICE_UNAVAILABLE',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Scope Categories
  SCOPE: {
    IN_SCOPE: 'in_scope',
    OUT_OF_SCOPE: 'out_of_scope',
  },

  // Appliance Types
  APPLIANCE_TYPE: {
    REFRIGERATOR: 'refrigerator',
    DISHWASHER: 'dishwasher',
  },

  // Session Configuration
  SESSION: {
    DEFAULT_EXPIRY_MINUTES: 30,
  },

  // In-scope Keywords
  IN_SCOPE_KEYWORDS: [
    // General parts terms
    'part',
    'parts',
    'component',
    'components',
    'replacement',
    'repair',
    'fix',
    'broken',
    'install',
    'installation',
    'setup',
    'assemble',
    'compatible',
    'compatibility',
    'work with',
    'fit',
    'problem',
    'issue',
    'not working',
    'damaged',
    'replace',

    // Appliance types
    'refrigerator',
    'refrigerators',
    'fridge',
    'fridges',
    'dishwasher',
    'dishwashers',

    // Common part types
    'water valve',
    'filter',
    'compressor',
    'thermostat',
    'fan',
    'motor',
    'seal',
    'gasket',
    'hinge',
    'handle',
    'shelf',
    'drawer',
    'ice maker',
    'dispenser',
    'heating element',
    'pump',
    'spray arm',
    'door',
    'latch',

    // Troubleshooting terms
    'leaking',
    'leak',
    'freeze',
    'frozen',
    'clogged',
    'clog',
    'noise',
    'noisy',
    'won\'t',
    'not working',
    'stopped',
    'error',
    'malfunction',

    // Action terms
    'buy',
    'purchase',
    'need',
    'have',
    'looking for',
    'find',
    'search',
    'what about',
    'how',
    'where',
    'can i',

    // Order/transaction terms
    'order',
    'price',
    'cost',
    'cart',
    'checkout',
    'buy',
  ],

  // Out-of-scope keywords
  OUT_OF_SCOPE_KEYWORDS: [
    'weather',
    'stock market',
    'recipe',
    'cooking',
    'politics',
    'sports',
    'news',
    'movie',
    'book',
    'music',
    'travel',
    'hotel',
    'flight',
    'restaurant',
    'joke',
    'laugh',
    'funny',
  ],

  // Part number patterns
  PATTERNS: {
    PART_NUMBER: /PS\d{6,}/i,
    MODEL_NUMBER: /([A-Z]{1,3}\d{3,4}[A-Z]{0,2}\d+[A-Z]?\d*)/i,
    SKU_PATTERN: /\d{6,}/,
  },

  // Intent Keywords Mapping
  INTENT_KEYWORDS: {
    product_search: ['need', 'looking for', 'find me', 'do you have', 'i want', 'show me', 'where can i get', 'what is', 'tell me about'],
    compatibility_check: ['compatible', 'compatible with', 'fit', 'work with', 'support', 'fit my', 'for my', 'match'],
    installation_guide: ['install', 'how to', 'setup', 'assemble', 'attach', 'how do i', 'help me install', 'steps'],
    troubleshooting: ['broken', 'not working', 'fix', 'repair', 'problem', 'issue', 'what\'s wrong', 'stopped', 'leaking', 'won\'t'],
    order_support: ['order', 'price', 'cost', 'buy', 'cart', 'checkout', 'where\'s my', 'tracking'],
  },
};

module.exports = CONSTANTS;
