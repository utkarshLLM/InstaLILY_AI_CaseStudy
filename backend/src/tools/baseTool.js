const logger = require('../config/logger');

/**
 * Base Tool Class
 * All tools should extend this class and implement required methods
 * This is the interface/contract for all tools
 */

class BaseTool {
  /**
   * Constructor
   * @param {string} name - Tool name (e.g., 'productSearchTool')
   * @param {string} description - Tool description
   * @param {Array<string>} requiredInputs - Required input parameters
   */
  constructor(name, description, requiredInputs = []) {
    this.name = name;
    this.description = description;
    this.requiredInputs = requiredInputs;
    this.createdAt = new Date().toISOString();
  }

  /**
   * Validate tool inputs
   * Override this in subclasses for custom validation
   * @param {Object} inputs - The inputs to validate
   * @throws {Error} - If validation fails
   */
  async validate(inputs) {
    if (!inputs || typeof inputs !== 'object') {
      throw new Error('Inputs must be an object');
    }

    // Check required inputs
    for (const required of this.requiredInputs) {
      if (!(required in inputs)) {
        throw new Error(`Missing required input: ${required}`);
      }
    }
  }

  /**
   * Execute the tool
   * MUST be implemented by subclasses
   * @param {Object} inputs - Tool inputs
   * @returns {Promise<any>} - Tool output
   * @throws {Error} - Must be implemented
   */
  async execute(inputs) {
    throw new Error(`Tool '${this.name}' must implement execute() method`);
  }

  /**
   * Format tool output into standardized structure
   * Override this in subclasses for custom formatting
   * @param {any} rawOutput - Raw output from execute()
   * @returns {Promise<Object>} - Formatted output
   */
  async formatOutput(rawOutput) {
    return {
      success: true,
      data: rawOutput,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Handle tool errors
   * Override this in subclasses for custom error handling
   * @param {Error} error - The error
   * @returns {Promise<Object>} - Error response
   */
  async handleError(error) {
    logger.error(`Error in tool '${this.name}'`, {
      error: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      error: error.message,
      toolName: this.name,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Main run method - orchestrates validation -> execution -> formatting
   * Don't override this unless necessary
   * @param {Object} inputs - Tool inputs
   * @returns {Promise<Object>} - Result object
   */
  async run(inputs) {
    const startTime = Date.now();

    try {
      // Validate inputs
      await this.validate(inputs);

      // Execute tool
      const result = await this.execute(inputs);

      // Format output
      const formatted = await this.formatOutput(result);

      // Add execution metadata
      return {
        success: true,
        toolName: this.name,
        executionTime: Date.now() - startTime,
        result: formatted,
        error: null,
      };
    } catch (error) {
      // Handle error
      const errorResponse = await this.handleError(error);

      return {
        success: false,
        toolName: this.name,
        executionTime: Date.now() - startTime,
        result: null,
        error: errorResponse.error,
        errorDetails: errorResponse,
      };
    }
  }

  /**
   * Get tool metadata
   * @returns {Object}
   */
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      requiredInputs: this.requiredInputs,
      createdAt: this.createdAt,
    };
  }

  /**
   * Get tool info for display
   * @returns {string}
   */
  toString() {
    return `Tool(${this.name}): ${this.description}`;
  }
}

module.exports = BaseTool;
