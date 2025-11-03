/**
 * Centralized error logging utility
 * Replaces direct console.error calls with a consistent logging pattern
 * Can be extended to integrate with external logging services (Sentry, etc.)
 */

/* eslint-disable no-console */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface ErrorLogContext {
  component?: string;
  action?: string;
  data?: unknown;
}

class ErrorLogger {
  private isDevelopment = __DEV__;

  /**
   * Log an error with context
   */
  error(message: string, error?: Error | unknown, context?: ErrorLogContext): void {
    if (this.isDevelopment) {
      const prefix = context?.component ? `[${context.component}]` : '';
      console.error(`${prefix} ${message}`, error || '');
      if (context?.data) {
        console.error('Context:', context.data);
      }
    }
    // In production, this would send to external logging service
    // if (Sentry) { Sentry.captureException(error, { contexts: { custom: context } }); }
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: ErrorLogContext): void {
    if (this.isDevelopment) {
      const prefix = context?.component ? `[${context.component}]` : '';
      console.warn(`${prefix} ${message}`);
    }
  }

  /**
   * Log info (development only)
   */
  info(message: string, context?: ErrorLogContext): void {
    if (this.isDevelopment) {
      const prefix = context?.component ? `[${context.component}]` : '';
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.log(message, data || '');
    }
  }
}

export const errorLogger = new ErrorLogger();

// Convenience exports for common patterns
export const logError = (component: string, action: string, error: unknown) => {
  errorLogger.error(`${action} failed`, error, { component, action });
};

export const logWarning = (component: string, message: string) => {
  errorLogger.warn(message, { component });
};
