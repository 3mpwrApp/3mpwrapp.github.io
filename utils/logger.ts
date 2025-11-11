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

/* eslint-disable no-console */
// This file is the only place where direct console usage is allowed

// TypeScript doesn't know about __DEV__ by default (it's injected by Metro/Expo)
declare const __DEV__: boolean;

interface LoggerOptions {
  enableInProduction?: boolean;
  sendToSentry?: boolean;
}

// Lazy-loaded Sentry instance
let sentryModule: any = null;
let sentryLoadAttempted = false;

class Logger {
  [x: string]: any;
  private isDevelopment: boolean;
  
  constructor() {
    this.isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
    
    // Attempt to load Sentry in production
    if (!this.isDevelopment) {
      this.loadSentry();
    }
  }

  /**
   * Lazy load Sentry module (production only)
   */
  private async loadSentry(): Promise<void> {
    if (sentryLoadAttempted) return;
    sentryLoadAttempted = true;

    try {
      // Only load if DSN is configured
      if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
        sentryModule = await import('sentry-expo');
      }
    } catch {
      // Silently fail if Sentry is not available
      // This is expected in dev builds or when Sentry is not configured
    }
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
   * Log informational messages (alias for log, development only)
   */
  info(...args: any[]): void {
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
   * Log errors (always logged, sent to Sentry in production)
   * Use this for errors that should be tracked in production
   */
  error(...args: any[]): void {
    console.error(...args);
    
    // Send to Sentry in production
    if (!this.isDevelopment && sentryModule) {
      try {
        // Extract the error object or create one from the message
        const errorArg = args[0];
        
        if (errorArg instanceof Error) {
          // If it's already an Error, capture it directly
          sentryModule.Native.captureException(errorArg);
        } else if (typeof errorArg === 'string') {
          // If it's a string, capture as a message with context
          const additionalData = args.slice(1);
          sentryModule.Native.captureMessage(errorArg, {
            level: 'error',
            extra: additionalData.length > 0 ? { context: additionalData } : undefined,
          });
        } else {
          // For other types, stringify and send as message
          sentryModule.Native.captureMessage(JSON.stringify(errorArg), {
            level: 'error',
            extra: { originalType: typeof errorArg },
          });
        }
      } catch (sentryError) {
        // Silently fail - don't let Sentry errors break the app
        // In development, we might want to know about this
        if (this.isDevelopment) {
          console.warn('[Logger] Failed to send error to Sentry:', sentryError);
        }
      }
    }
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
    
    // Send to Sentry if explicitly requested
    if (options.sendToSentry && !this.isDevelopment && sentryModule) {
      try {
        sentryModule.Native.captureMessage(message, {
          level: 'info',
          extra: args.length > 0 ? { context: args } : undefined,
        });
      } catch {
        // Silently fail
      }
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

  /**
   * Capture exception with additional context (production only)
   * Use this for critical errors that need extra debugging information
   */
  captureException(error: Error, context?: Record<string, any>): void {
    // Always log to console
    console.error('[Exception]', error, context);
    
    // Send to Sentry in production
    if (!this.isDevelopment && sentryModule) {
      try {
        sentryModule.Native.captureException(error, {
          extra: context,
        });
      } catch {
        // Silently fail
      }
    }
  }

  /**
   * Set user context for error tracking
   * Useful for associating errors with specific users
   */
  setUser(user: { id: string; email?: string; username?: string } | null): void {
    if (!this.isDevelopment && sentryModule) {
      try {
        sentryModule.Native.setUser(user);
      } catch {
        // Silently fail
      }
    }
  }

  /**
   * Add breadcrumb for debugging
   * Breadcrumbs help track the user's journey before an error occurred
   */
  addBreadcrumb(message: string, category?: string, data?: Record<string, any>): void {
    if (!this.isDevelopment && sentryModule) {
      try {
        sentryModule.Native.addBreadcrumb({
          message,
          category: category || 'default',
          data,
          level: 'info',
        });
      } catch {
        // Silently fail
      }
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;
