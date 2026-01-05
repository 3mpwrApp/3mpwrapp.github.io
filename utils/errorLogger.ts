/**
 * Centralized error logging utility
 * Integrates with Sentry and Firebase Crashlytics for comprehensive error tracking
 */

/* eslint-disable no-console */

import * as crashlytics from "../services/crashlytics";
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
   * Sends to both Sentry (production debugging) and Crashlytics (native crashes)
   */
  error(message: string, error?: Error | unknown, context?: ErrorLogContext): void {
    if (this.isDevelopment) {
      const prefix = context?.component ? `[${context.component}]` : '';
      console.error(`${prefix} ${message}`, error || '');
      if (context?.data) {
        console.error('Context:', context.data);
      }
    }

    // Log to Crashlytics (all platforms)
    if (error instanceof Error) {
      crashlytics.logError(error, {
        message,
        component: context?.component,
        action: context?.action,
        ...(typeof context?.data === 'object' && context.data !== null ? context.data as Record<string, unknown> : {}),
      }).catch((e) => {
        if (this.isDevelopment) console.warn('[ErrorLogger] Failed to log to Crashlytics:', e);
      });
    } else if (error) {
      const errorObj = new Error(`${message}: ${String(error)}`);
      crashlytics.logError(errorObj, {
        originalError: String(error),
        component: context?.component,
        action: context?.action,
        ...(typeof context?.data === 'object' && context.data !== null ? context.data as Record<string, unknown> : {}),
      }).catch((e) => {
        if (this.isDevelopment) console.warn('[ErrorLogger] Failed to log to Crashlytics:', e);
      });
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
