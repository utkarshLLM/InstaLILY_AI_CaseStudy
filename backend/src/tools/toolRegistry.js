const logger = require('../config/logger');

/**
 * Tool Registry
 * Manages discovery and registration of available tools
 * Currently a placeholder for Phase 1
 * Will be populated with real tools in Phase 3
 */

class ToolRegistry {
  constructor() {
    this.tools = new Map(); // toolName -> tool instance
    logger.info('ToolRegistry initialized');
  }

  /**
   * Register a tool
   * @param {Object} tool - Tool instance implementing BaseTool interface
   */
  register(tool) {
    if (!tool || !tool.name) {
      throw new Error('Tool must have a name property');
    }

    this.tools.set(tool.name, tool);
    logger.info(`Tool registered: ${tool.name}`);
  }

  /**
   * Get a tool by name
   * @param {string} toolName - Name of the tool
   * @returns {Object|null} - Tool instance or null if not found
   */
  get(toolName) {
    return this.tools.get(toolName) || null;
  }

  /**
   * Check if tool exists
   * @param {string} toolName - Name of the tool
   * @returns {boolean}
   */
  exists(toolName) {
    return this.tools.has(toolName);
  }

  /**
   * Get all registered tools
   * @returns {Array<Object>} - Array of tool instances
   */
  listAll() {
    return Array.from(this.tools.values());
  }

  /**
   * Get all tool names
   * @returns {Array<string>}
   */
  getToolNames() {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tool with error handling
   * @param {string} toolName - Name of the tool
   * @returns {Object} - Tool instance
   * @throws {Error} - If tool not found
   */
  getTool(toolName) {
    const tool = this.get(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found in registry`);
    }
    return tool;
  }

  /**
   * Unregister a tool
   * @param {string} toolName - Name of the tool to remove
   */
  unregister(toolName) {
    if (this.tools.has(toolName)) {
      this.tools.delete(toolName);
      logger.info(`Tool unregistered: ${toolName}`);
    }
  }

  /**
   * Clear all tools
   */
  clear() {
    this.tools.clear();
    logger.info('Tool registry cleared');
  }
}

// Export singleton instance
const toolRegistry = new ToolRegistry();

module.exports = toolRegistry;
