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

      // Performance Monitoring Configuration
      tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 20% in production for better insights

      // Profiling Configuration (requires @sentry/profiling-node or native profiling)
      profilesSampleRate: __DEV__ ? 1.0 : 0.2, // 20% of traced transactions

      // Enable automatic instrumentation
      enableAutoSessionTracking: true,
      enableAutoPerformanceTracing: true,
      enableNative: true,
      enableNativeCrashHandling: true,

      // Routing instrumentation for React Navigation
      integrations: [
        Sentry.reactNavigationIntegration({
          enableTimeToInitialDisplay: true,
        }),
        // HTTP instrumentation for API calls
        Sentry.httpClientIntegration({
          failedRequestStatusCodes: [400, 599],
          failedRequestTargets: [/.*/],
        }),
      ],

      // Custom instrumentation options
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/.*\.firebaseio\.com/,
        /^https:\/\/.*\.googleapis\.com/,
        /api\//,
      ],

      // Performance monitoring options
      maxBreadcrumbs: 100,
      attachStacktrace: true,
      sendDefaultPii: false, // Never send PII
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

/**
 * Start a performance transaction
 * Use this to track custom operations like data loading, form submissions, etc.
 *
 * @example
 * const transaction = startTransaction('load_evidence', 'task');
 * try {
 *   await loadEvidence();
 *   transaction?.finish();
 * } catch (error) {
 *   transaction?.setStatus('internal_error');
 *   transaction?.finish();
 *   captureException(error);
 * }
 */
export function startTransaction(
  name: string,
  op: 'navigation' | 'task' | 'http.client' | 'db.query' | 'custom' = 'custom',
  options?: {
    description?: string;
    tags?: Record<string, string>;
    data?: Record<string, any>;
  }
): Sentry.Span | undefined {
  if (!sentryInitialized) return undefined;

  try {
    const transaction = Sentry.startTransaction({
      name,
      op,
      description: options?.description,
      tags: options?.tags,
      data: options?.data,
    });

    return transaction as Sentry.Span;
  } catch (err) {
    console.error('[Sentry] Failed to start transaction:', err);
    return undefined;
  }
}

/**
 * Start a child span within a transaction
 * Use this to measure specific operations within a larger transaction
 *
 * @example
 * const transaction = startTransaction('submit_form', 'task');
 * const uploadSpan = startSpan(transaction, 'upload_files', 'http.client');
 * await uploadFiles();
 * uploadSpan?.finish();
 * transaction?.finish();
 */
export function startSpan(
  parentTransaction: Sentry.Span | undefined,
  operation: string,
  description?: string
): Sentry.Span | undefined {
  if (!sentryInitialized || !parentTransaction) return undefined;

  try {
    return parentTransaction.startChild({
      op: operation,
      description,
    });
  } catch (err) {
    console.error('[Sentry] Failed to start span:', err);
    return undefined;
  }
}

/**
 * Measure async operation performance
 * Automatically creates and finishes a transaction
 *
 * @example
 * await measurePerformance('fetch_podcasts', async () => {
 *   return await fetchPodcasts();
 * }, { op: 'http.client', tags: { feature: 'podcasts' } });
 */
export async function measurePerformance<T>(
  name: string,
  operation: () => Promise<T>,
  options?: {
    op?: 'navigation' | 'task' | 'http.client' | 'db.query' | 'custom';
    tags?: Record<string, string>;
    description?: string;
  }
): Promise<T> {
  const transaction = startTransaction(name, options?.op || 'custom', {
    description: options?.description,
    tags: options?.tags,
  });

  try {
    const result = await operation();
    transaction?.setStatus('ok');
    transaction?.finish();
    return result;
  } catch (error) {
    transaction?.setStatus('internal_error');
    transaction?.finish();
    throw error;
  }
}

/**
 * Set performance measurement for a specific metric
 * Useful for tracking custom performance metrics like render times
 *
 * @example
 * setMeasurement('component_render_time', 150, 'millisecond');
 */
export function setMeasurement(
  name: string,
  value: number,
  unit: 'millisecond' | 'second' | 'byte' | 'none' = 'millisecond'
): void {
  if (!sentryInitialized) return;

  try {
    const activeTransaction = Sentry.getCurrentScope().getTransaction();
    if (activeTransaction) {
      activeTransaction.setMeasurement(name, value, unit);
    }
  } catch (err) {
    console.error('[Sentry] Failed to set measurement:', err);
  }
}
