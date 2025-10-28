/**
 * Type Definitions for the Application
 * Using JSDoc for type hints without TypeScript
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} message - The user's message
 * @property {string} [sessionId] - Optional session ID (UUID)
 */

/**
 * @typedef {Object} Session
 * @property {string} sessionId - Unique session identifier
 * @property {string} createdAt - ISO timestamp of session creation
 * @property {string} lastActivity - ISO timestamp of last activity
 * @property {Array<ConversationMessage>} conversationHistory - Chat history
 * @property {Object} userContext - User context (model preferences, etc.)
 * @property {boolean} isActive - Whether session is active
 */

/**
 * @typedef {Object} ConversationMessage
 * @property {string} messageId - Unique message identifier
 * @property {'user' | 'assistant'} role - Who sent the message
 * @property {string} message - The message content
 * @property {string} timestamp - ISO timestamp
 * @property {Object} metadata - Message metadata
 */

/**
 * @typedef {Object} ScopeDetectionResult
 * @property {boolean} inScope - Whether message is in scope
 * @property {number} confidence - Confidence score (0-1)
 * @property {string} reason - Explanation for the result
 * @property {string} category - Category of the message (e.g., 'parts_inquiry')
 */

/**
 * @typedef {Object} IntentClassificationResult
 * @property {string} intent - The detected intent
 * @property {number} confidence - Confidence score (0-1)
 * @property {Array<string>} keywords - Keywords that matched
 * @property {Object} context - Additional context extracted from message
 */

/**
 * @typedef {Object} SanitizedMessage
 * @property {string} original - Original message as received
 * @property {string} cleaned - Cleaned message
 * @property {string} sanitized - HTML-encoded for safe storage
 * @property {string} lowercase - Lowercase version for intent matching
 * @property {Object} entities - Extracted entities (part numbers, model numbers)
 */

/**
 * @typedef {Object} ToolResult
 * @property {boolean} success - Whether tool execution was successful
 * @property {string} toolName - Name of the tool that executed
 * @property {number} executionTime - Execution time in milliseconds
 * @property {any} result - The tool's result data
 * @property {string} [error] - Error message if execution failed
 */

/**
 * @typedef {Object} ChatResponse
 * @property {boolean} success - Whether request was successful
 * @property {string} sessionId - Session identifier
 * @property {string} messageId - Message identifier
 * @property {ResponsePayload} response - The response payload
 * @property {ResponseMetadata} metadata - Response metadata
 */

/**
 * @typedef {Object} ResponsePayload
 * @property {'text' | 'product_results' | 'installation_guide' | 'troubleshooting' | 'out_of_scope' | 'error'} type - Response type
 * @property {string} content - Main message content
 * @property {any} [data] - Type-specific data (products, steps, etc.)
 */

/**
 * @typedef {Object} ResponseMetadata
 * @property {string} sessionId - Session ID
 * @property {string} messageId - Message ID
 * @property {string} timestamp - ISO timestamp
 * @property {number} processingTime - Total processing time in milliseconds
 * @property {string} intent - Detected intent
 * @property {boolean} inScope - Whether message was in scope
 * @property {Array<string>} toolsUsed - Tools that were used
 * @property {number} [confidence] - Confidence score
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {ErrorPayload} error - Error details
 * @property {ResponseMetadata} metadata - Response metadata
 */

/**
 * @typedef {Object} ErrorPayload
 * @property {string} code - Error code
 * @property {string} message - Error message
 * @property {Object} [details] - Additional error details
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Product ID (e.g., PS123456)
 * @property {string} name - Product name
 * @property {number} price - Product price
 * @property {string} description - Product description
 * @property {string} [imageUrl] - URL to product image
 * @property {Array<string>} compatibility - Compatible model numbers
 * @property {boolean} inStock - Stock availability
 */

/**
 * @typedef {Object} InstallationStep
 * @property {number} step - Step number
 * @property {string} instruction - Step instruction
 * @property {Array<string>} tips - Helpful tips
 * @property {Array<string>} warnings - Safety warnings
 * @property {Array<string>} tools - Required tools
 */

/**
 * @typedef {Object} TroubleshootingCause
 * @property {string} cause - The possible cause
 * @property {'low' | 'medium' | 'high'} probability - Probability of this being the issue
 * @property {string} description - Description of the cause
 * @property {string} fix - How to fix it
 */

module.exports = {};
