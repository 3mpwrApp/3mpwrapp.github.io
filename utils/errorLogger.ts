/**
 * Centralized error logging utility
 * Integrates with Sentry for automatic crash labeling and categorization
 */

/* eslint-disable no-console */

import * as sentryLabeling from "../services/sentryLabeling";

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
    // Send to Sentry with automatic labeling
    if (error instanceof Error) {
      const sentryContext: Record<string, unknown> = {
        component: context?.component,
        action: context?.action,
        message,
        ...(typeof context?.data === 'object' && context.data !== null ? context.data as Record<string, unknown> : {}),
      };
      sentryLabeling.captureException(error, {
        extra: sentryContext,
      });
    } else if (error) {
      const sentryContext: Record<string, unknown> = {
        component: context?.component,
        action: context?.action,
        ...(typeof context?.data === 'object' && context.data !== null ? context.data as Record<string, unknown> : {}),
      };
      sentryLabeling.captureMessage(`${message}: ${String(error)}`, "error", {
        extra: sentryContext,
      });
    }
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
