const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const { validateChatMessage } = require('../utils/validators');
const { sanitizeMessage } = require('../utils/sanitizers');
const { 
  generateMessageId, 
  calculateProcessingTime, 
  getCurrentTimestamp 
} = require('../utils/helpers');
const { 
  formatChatResponse, 
  formatErrorResponse,
  formatOutOfScopeResponse,
  formatTextResponse 
} = require('../utils/responseFormatter');
const { AppError } = require('../middleware/errorHandler');
const CONSTANTS = require('../config/constants');
const messageService = require('../services/messageService');
const sessionService = require('../services/sessionService');
const scopeDetectionService = require('../services/scopeDetectionService');
const intentClassificationService = require('../services/intentClassificationService');
const agentOrchestrator = require('../services/agentOrchestrator');

/**
 * Chat Controller
 * Handles chat message requests and coordinates the message processing pipeline
 */

/**
 * Handle incoming chat message
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Express.NextFunction} next
 */
const handleChatMessage = async (req, res, next) => {
  const startTime = Date.now();
  let sessionId;
  let messageId;

  try {
    logger.debug('Incoming chat request', {
      method: req.method,
      path: req.path,
      body: req.body,
    });

    // ===== STEP 1: VALIDATE INPUT =====
    const validation = validateChatMessage(req.body);
    if (!validation.valid) {
      logger.warn('Chat message validation failed', { error: validation.error });
      const error = new AppError(
        validation.error,
        CONSTANTS.HTTP_STATUS.BAD_REQUEST,
        CONSTANTS.ERROR_CODE.VALIDATION_ERROR
      );
      return next(error);
    }

    const { message, sessionId: providedSessionId } = validation.value;

    // ===== STEP 2: SESSION MANAGEMENT =====
    sessionId = providedSessionId || uuidv4();
    let session = await sessionService.getSession(sessionId);

    if (!session) {
      session = await sessionService.createSession(sessionId);
      logger.info('New session created', { sessionId });
    } else {
      logger.debug('Existing session retrieved', { sessionId });
    }

    // ===== STEP 3: MESSAGE PREPROCESSING =====
    messageId = generateMessageId();
    
    const preprocessResult = await messageService.preprocessMessage(message);
    logger.debug('Message preprocessed', {
      messageId,
      originalLength: message.length,
      cleanedLength: preprocessResult.cleaned.length,
    });

    // ===== STEP 4: SCOPE DETECTION =====
    const scopeResult = await scopeDetectionService.detectScope(preprocessResult.cleaned);
    logger.debug('Scope detection completed', {
      messageId,
      inScope: scopeResult.inScope,
      confidence: scopeResult.confidence,
    });

    // If out of scope, return friendly message
    if (!scopeResult.inScope) {
      const response = formatChatResponse({
        sessionId,
        messageId,
        responseType: CONSTANTS.RESPONSE_TYPE.OUT_OF_SCOPE,
        content: "I'm specifically designed to help with Refrigerator and Dishwasher parts from PartSelect. Your question seems to be outside my area of expertise. How can I help you with refrigerator or dishwasher parts instead?",
        data: {
          suggestion: 'Try asking about parts, installation, compatibility, troubleshooting, or orders.',
        },
        metadata: {
          processingTime: calculateProcessingTime(startTime),
          intent: 'out_of_scope',
          inScope: false,
          toolsUsed: [],
          confidence: scopeResult.confidence,
        },
      });

      // Add to conversation history
      await sessionService.addMessageToHistory(sessionId, {
        role: 'user',
        message,
        messageId,
      });

      await sessionService.addMessageToHistory(sessionId, {
        role: 'assistant',
        message: response.response.content,
        messageId,
      });

      return res.status(CONSTANTS.HTTP_STATUS.OK).json(response);
    }

    // ===== STEP 5: INTENT CLASSIFICATION =====
    const intentResult = await intentClassificationService.classifyIntent(preprocessResult.cleaned);
    logger.debug('Intent classification completed', {
      messageId,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
    });

    // ===== STEP 6: AGENT ORCHESTRATION =====
    // Pass all information to agent orchestrator
    const orchestratorInput = {
      originalMessage: message,
      preprocessedMessage: preprocessResult,
      scope: scopeResult,
      intent: intentResult,
      session,
      messageId,
      sessionId,
    };

    const orchestratorResult = await agentOrchestrator.processMessage(orchestratorInput);
    logger.debug('Agent orchestration completed', {
      messageId,
      resultType: orchestratorResult.type,
    });

    // ===== STEP 7: FORMAT RESPONSE =====
    const response = formatChatResponse({
      sessionId,
      messageId,
      responseType: orchestratorResult.type,
      content: orchestratorResult.content,
      data: orchestratorResult.data || null,
      metadata: {
        processingTime: calculateProcessingTime(startTime),
        intent: intentResult.intent,
        inScope: true,
        toolsUsed: orchestratorResult.toolsUsed || [],
        confidence: intentResult.confidence,
      },
    });

    // ===== STEP 8: UPDATE CONVERSATION HISTORY =====
    await sessionService.addMessageToHistory(sessionId, {
      role: 'user',
      message,
      messageId,
      metadata: {
        intent: intentResult.intent,
        scope: scopeResult,
      },
    });

    await sessionService.addMessageToHistory(sessionId, {
      role: 'assistant',
      message: response.response.content,
      messageId,
      metadata: {
        type: response.response.type,
        toolsUsed: orchestratorResult.toolsUsed || [],
      },
    });

    logger.info('Chat message processed successfully', {
      messageId,
      sessionId,
      processingTime: calculateProcessingTime(startTime),
    });

    // ===== STEP 9: SEND RESPONSE =====
    res.status(CONSTANTS.HTTP_STATUS.OK).json(response);
  } catch (error) {
    logger.error('Error in handleChatMessage', {
      error: error.message,
      stack: error.stack,
      messageId,
      sessionId,
    });

    // If it's an AppError, pass to error handler
    if (error instanceof AppError) {
      return next(error);
    }

    // Convert unexpected error to AppError
    const appError = new AppError(
      'An unexpected error occurred processing your message',
      CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
      CONSTANTS.ERROR_CODE.INTERNAL_SERVER_ERROR
    );
    next(appError);
  }
};

module.exports = {
  handleChatMessage,
};
