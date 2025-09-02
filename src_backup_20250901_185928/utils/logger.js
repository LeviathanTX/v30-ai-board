// src/utils/logger.js - Professional logging system for V30 AI Board

/**
 * Professional logging utility with environment-aware output
 * Replaces console.log statements with structured, configurable logging
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[90m', // Gray
  RESET: '\x1b[0m'
};

class Logger {
  constructor() {
    // Set log level based on environment
    this.logLevel = this.getLogLevel();
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Performance tracking
    this.timers = new Map();
  }

  getLogLevel() {
    const envLevel = process.env.REACT_APP_LOG_LEVEL;
    if (envLevel && LOG_LEVELS[envLevel.toUpperCase()] !== undefined) {
      return LOG_LEVELS[envLevel.toUpperCase()];
    }
    
    // Default levels by environment
    return process.env.NODE_ENV === 'production' 
      ? LOG_LEVELS.ERROR 
      : LOG_LEVELS.DEBUG;
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= this.logLevel;
  }

  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const prefix = this.isDevelopment 
      ? `${LOG_COLORS[level]}[${level}]${LOG_COLORS.RESET}` 
      : `[${level}]`;
    
    let output = `${prefix} ${timestamp} - ${message}`;
    
    if (Object.keys(context).length > 0) {
      output += ` | Context: ${JSON.stringify(context)}`;
    }
    
    return output;
  }

  /**
   * Log error messages - always shown in production
   */
  error(message, error = null, context = {}) {
    if (!this.shouldLog('ERROR')) return;
    
    const errorInfo = error ? {
      name: error.name,
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined
    } : {};
    
    const fullContext = { ...context, ...errorInfo };
    logger.error(this.formatMessage('ERROR', message, fullContext));
    
    // In production, could send to error reporting service
    if (this.isProduction && window.gtag) {
      window.gtag('event', 'exception', {
        description: message,
        fatal: false
      });
    }
  }

  /**
   * Log warning messages
   */
  warn(message, context = {}) {
    if (!this.shouldLog('WARN')) return;
    logger.warn(this.formatMessage('WARN', message, context));
  }

  /**
   * Log informational messages
   */
  info(message, context = {}) {
    if (!this.shouldLog('INFO')) return;
    logger.info(this.formatMessage('INFO', message, context));
  }

  /**
   * Log debug messages - development only
   */
  debug(message, context = {}) {
    if (!this.shouldLog('DEBUG')) return;
    logger.debug(this.formatMessage('DEBUG', message, context));
  }

  /**
   * Performance timing utilities
   */
  time(label) {
    if (!this.isDevelopment) return;
    this.timers.set(label, performance.now());
  }

  timeEnd(label) {
    if (!this.isDevelopment) return;
    
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.debug(`Timer [${label}] completed`, { duration: `${duration.toFixed(2)}ms` });
      this.timers.delete(label);
    }
  }

  /**
   * Group related log messages
   */
  group(label) {
    if (!this.isDevelopment) return;
    console.group(label);
  }

  groupEnd() {
    if (!this.isDevelopment) return;
    console.groupEnd();
  }

  /**
   * Log API requests and responses
   */
  api(method, url, status, duration, context = {}) {
    const message = `${method.toUpperCase()} ${url} - ${status}`;
    const apiContext = {
      method,
      url,
      status,
      duration: `${duration}ms`,
      ...context
    };
    
    if (status >= 400) {
      this.warn(message, apiContext);
    } else {
      this.debug(message, apiContext);
    }
  }

  /**
   * Log user interactions for analytics
   */
  user(action, element, context = {}) {
    if (!this.isDevelopment) return;
    
    this.debug(`User: ${action}`, {
      element,
      timestamp: Date.now(),
      ...context
    });
    
    // In production, could send to analytics
    if (this.isProduction && window.gtag) {
      window.gtag('event', action, {
        event_category: 'user_interaction',
        event_label: element,
        ...context
      });
    }
  }

  /**
   * Log AI service interactions
   */
  ai(service, operation, duration, context = {}) {
    this.info(`AI: ${service}.${operation}`, {
      service,
      operation,
      duration: `${duration}ms`,
      ...context
    });
  }

  /**
   * Log document processing
   */
  document(filename, operation, status, context = {}) {
    this.info(`Document: ${operation} ${filename}`, {
      filename,
      operation,
      status,
      ...context
    });
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;

// Convenience exports
export const log = {
  error: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  info: logger.info.bind(logger),
  debug: logger.debug.bind(logger),
  time: logger.time.bind(logger),
  timeEnd: logger.timeEnd.bind(logger),
  group: logger.group.bind(logger),
  groupEnd: logger.groupEnd.bind(logger),
  api: logger.api.bind(logger),
  user: logger.user.bind(logger),
  ai: logger.ai.bind(logger),
  document: logger.document.bind(logger)
};