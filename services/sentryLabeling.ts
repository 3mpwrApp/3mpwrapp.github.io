/**
 * Sentry Crash Labeling Service
 * 
 * Minimal crash reporting with automatic labeling for better triage.
 * Only active when EXPO_PUBLIC_SENTRY_DSN is configured in .env
 */

import * as Sentry from '@sentry/react-native';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Track if Sentry is initialized
let sentryInitialized = false;

/**
 * Initialize Sentry with proper labeling
 */
export async function initSentry(dsn: string): Promise<boolean> {
  // Skip if already initialized
  if (sentryInitialized) return true;

  try {

    // Initialize with @sentry/react-native
    Sentry.init({
      dsn,
      debug: __DEV__,
      environment: __DEV__ ? 'development' : 'production',
      
      // Automatic labeling via tags
      initialScope: {
        tags: {
          platform: Platform.OS,
          version: Platform.Version?.toString() || 'unknown',
          device: Device.modelName || Device.osName || 'unknown',
          environment: __DEV__ ? 'development' : 'production',
        },
      },

      // Filter out noise
      beforeSend(event, hint) {
        // Skip development errors unless explicitly enabled
        if (__DEV__ && !process.env.SENTRY_DEBUG) {
          return null;
        }

        // Add automatic labels based on error content
        const error = hint?.originalException;
        const errorMessage = error?.toString() || event.message || '';

        // Auto-label by feature area
        const labels: string[] = [];
        
        if (/wellness|exercise|meditation|breathing|self-care/i.test(errorMessage)) {
          labels.push('feature:wellness');
        }
        if (/evidence|document|upload|file|photo/i.test(errorMessage)) {
          labels.push('feature:evidence');
        }
        if (/advocacy|appeal|lawyer|rights|case/i.test(errorMessage)) {
          labels.push('feature:advocacy');
        }
        if (/campaign|community|chat|event/i.test(errorMessage)) {
          labels.push('feature:community');
        }
        if (/notification|push|alert/i.test(errorMessage)) {
          labels.push('feature:notifications');
        }
        if (/auth|login|signup|firebase/i.test(errorMessage)) {
          labels.push('feature:auth');
        }
        if (/i18n|translation|locale/i.test(errorMessage)) {
          labels.push('feature:i18n');
        }
        if (/analytics|tracking|telemetry/i.test(errorMessage)) {
          labels.push('feature:analytics');
        }

        // Auto-label by error type
        if (/network|fetch|timeout|connection/i.test(errorMessage)) {
          labels.push('type:network');
        }
        if (/permission|denied|unauthorized/i.test(errorMessage)) {
          labels.push('type:permission');
        }
        if (/storage|asyncstorage|disk/i.test(errorMessage)) {
          labels.push('type:storage');
        }
        if (/render|component|react/i.test(errorMessage)) {
          labels.push('type:render');
        }
        if (/undefined|null|cannot read/i.test(errorMessage)) {
          labels.push('type:null-reference');
        }

        // Auto-label by severity
        if (/crash|fatal|critical/i.test(errorMessage)) {
          labels.push('severity:critical');
          event.level = 'fatal' as any;
        } else if (/error|exception|failed/i.test(errorMessage)) {
          labels.push('severity:error');
          event.level = 'error';
        } else if (/warning|warn/i.test(errorMessage)) {
          labels.push('severity:warning');
          event.level = 'warning';
        }

        // Add accessibility labels
        if (/accessibility|a11y|wcag|screen reader/i.test(errorMessage)) {
          labels.push('accessibility');
        }

        // Add privacy labels
        if (/privacy|gdpr|data|pii/i.test(errorMessage)) {
          labels.push('privacy');
        }

        // Apply labels as tags
        if (labels.length > 0) {
          event.tags = {
            ...event.tags,
            ...Object.fromEntries(labels.map((label, idx) => [`label_${idx}`, label])),
          };
        }

        // Add user context (no PII)
        event.user = {
          id: event.user?.id || 'anonymous',
          // Never send email, name, or other PII
        };

        // Add device context
        event.contexts = {
          ...event.contexts,
          device: {
            model: Device.modelName || undefined,
            manufacturer: Device.manufacturer || undefined,
            os: Device.osName,
            osVersion: Device.osVersion,
          },
        };

        return event;
      },

      // Sample rate for performance monitoring
      tracesSampleRate: __DEV__ ? 1.0 : 0.1, // 10% in production

      // Integrations
      enableAutoSessionTracking: true,
    });

    sentryInitialized = true;
    return true;
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
    return false;
  }
}

/**
 * Capture an exception with automatic labeling
 */
export function captureException(
  error: Error,
  context?: {
    feature?: string;
    severity?: 'critical' | 'error' | 'warning' | 'info';
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
): void {
  if (!sentryInitialized) {
    // Sentry not initialized, log to console instead
    if (__DEV__) {
      console.error('[Sentry] Exception (not sent):', error, context);
    }
    return;
  }

  try {
    Sentry.withScope((scope) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => scope.setTag(key, value));
      }
      if (context?.feature) scope.setTag('feature', context.feature);
      if (context?.severity) scope.setLevel(context.severity as Sentry.SeverityLevel);
      if (context?.extra) scope.setExtras(context.extra);
      Sentry.captureException(error);
    });
  } catch (err) {
    console.error('[Sentry] Failed to capture exception:', err);
  }
}

/**
 * Capture a message with automatic labeling
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: {
    feature?: string;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
): void {
  if (!sentryInitialized) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[Sentry] Message (not sent) [${level}]:`, message, context);
    }
    return;
  }

  try {
    Sentry.withScope((scope) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => scope.setTag(key, value));
      }
      if (context?.feature) scope.setTag('feature', context.feature);
      if (context?.extra) scope.setExtras(context.extra);
      scope.setLevel(level as Sentry.SeverityLevel);
      Sentry.captureMessage(message);
    });
  } catch (err) {
    console.error('[Sentry] Failed to capture message:', err);
  }
}

/**
 * Add breadcrumb for debugging context
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
): void {
  if (!sentryInitialized) return;

  try {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  } catch (err) {
    console.error('[Sentry] Failed to add breadcrumb:', err);
  }
}

/**
 * Set user context (no PII!)
 */
export function setUser(userId: string, isBetaTester?: boolean): void {
  if (!sentryInitialized) return;

  try {
    Sentry.setUser({
      id: userId,
      // Never send email, name, or other PII
    });
    if (isBetaTester) {
      Sentry.setTag('betaTester', 'true');
    }
  } catch (err) {
    console.error('[Sentry] Failed to set user:', err);
  }
}

/**
 * Clear user context
 */
export function clearUser(): void {
  if (!sentryInitialized) return;

  try {
    Sentry.setUser(null);
  } catch (err) {
    console.error('[Sentry] Failed to clear user:', err);
  }
}

/**
 * Check if Sentry is initialized
 */
export function isSentryEnabled(): boolean {
  return sentryInitialized;
}
