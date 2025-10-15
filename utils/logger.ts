/**
 * Centralized logging utility
 * Replaces direct console.log/warn/error calls with production-safe logging
 * 
 * Usage:
 *   import { logger } from '../utils/logger';
 *   logger.log('Debug info'); // Only in development
 *   logger.warn('Warning'); // Only in development
 *   logger.error('Error'); // Always logged (production too)
 */

// TypeScript doesn't know about __DEV__ by default (it's injected by Metro/Expo)
declare const __DEV__: boolean;

interface LoggerOptions {
  enableInProduction?: boolean;
  sendToSentry?: boolean;
}

class Logger {
  private isDevelopment: boolean;
  
  constructor() {
    this.isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
  }

  /**
   * Log informational messages (development only)
   */
  log(...args: any[]): void {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Log warnings (development only)
   */
  warn(...args: any[]): void {
    if (this.isDevelopment) {
      console.warn(...args);
    }
  }

  /**
   * Log errors (always logged, can be sent to error tracking)
   * Use this for errors that should be tracked in production
   */
  error(...args: any[]): void {
    console.error(...args);
    
    // TODO: Send to Sentry or other error tracking service in production
    // if (!this.isDevelopment && process.env.EXPO_PUBLIC_SENTRY_DSN) {
    //   Sentry.captureException(args[0]);
    // }
  }

  /**
   * Debug logging (very verbose, development only)
   */
  debug(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * Log with custom options
   */
  logWithOptions(message: string, options: LoggerOptions = {}, ...args: any[]): void {
    const shouldLog = this.isDevelopment || options.enableInProduction;
    
    if (shouldLog) {
      console.log(message, ...args);
    }
    
    if (options.sendToSentry && !this.isDevelopment) {
      // TODO: Implement Sentry integration
      // Sentry.captureMessage(message);
    }
  }

  /**
   * Group logs together (development only)
   */
  group(label: string): void {
    if (this.isDevelopment && console.group) {
      console.group(label);
    }
  }

  /**
   * End log group (development only)
   */
  groupEnd(): void {
    if (this.isDevelopment && console.groupEnd) {
      console.groupEnd();
    }
  }

  /**
   * Log a table (development only)
   */
  table(data: any): void {
    if (this.isDevelopment && console.table) {
      console.table(data);
    }
  }

  /**
   * Time measurement start (development only)
   */
  time(label: string): void {
    if (this.isDevelopment && console.time) {
      console.time(label);
    }
  }

  /**
   * Time measurement end (development only)
   */
  timeEnd(label: string): void {
    if (this.isDevelopment && console.timeEnd) {
      console.timeEnd(label);
    }
  }

  /**
   * Assert a condition (development only)
   */
  assert(condition: boolean, message: string): void {
    if (this.isDevelopment && console.assert) {
      console.assert(condition, message);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;
