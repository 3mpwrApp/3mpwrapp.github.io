/**
 * Firebase Crashlytics Integration
 * 
 * Provides crash reporting and non-fatal error tracking.
 * Works alongside Sentry for comprehensive error monitoring.
 */

import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Initialize Crashlytics
 */
export async function initCrashlytics(): Promise<void> {
  try {
    // Enable Crashlytics collection
    await crashlytics().setCrashlyticsCollectionEnabled(true);
    
    if (__DEV__) {
      console.log('[Crashlytics] Initialized successfully');
    }
  } catch (error) {
    console.error('[Crashlytics] Failed to initialize:', error);
  }
}

/**
 * Log non-fatal error
 */
export function logError(error: Error, context?: Record<string, unknown>): void {
  try {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        crashlytics().setAttribute(key, String(value));
      });
    }
    
    crashlytics().recordError(error);
  } catch (err) {
    console.error('[Crashlytics] Failed to log error:', err);
  }
}

/**
 * Log custom message
 */
export function log(message: string): void {
  try {
    crashlytics().log(message);
  } catch (err) {
    console.error('[Crashlytics] Failed to log message:', err);
  }
}

/**
 * Set user identifier (no PII!)
 */
export function setUserId(userId: string): void {
  try {
    crashlytics().setUserId(userId);
  } catch (err) {
    console.error('[Crashlytics] Failed to set user ID:', err);
  }
}

/**
 * Set custom attribute
 */
export function setAttribute(key: string, value: string): void {
  try {
    crashlytics().setAttribute(key, value);
  } catch (err) {
    console.error('[Crashlytics] Failed to set attribute:', err);
  }
}

/**
 * Test crash (development only)
 */
export function testCrash(): void {
  if (__DEV__) {
    crashlytics().crash();
  }
}
