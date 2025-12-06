/**
 * Firebase Crashlytics Integration
 * 
 * Provides crash reporting and non-fatal error tracking.
 * Works alongside Sentry for comprehensive error monitoring.
 * 
 * NOTE: We use lazy imports to prevent native module conflicts
 * with Sentry during app startup on some ARM64 devices.
 */

import { Platform } from 'react-native';
import type CrashlyticsModule from '@react-native-firebase/crashlytics';

// Lazy-loaded crashlytics instance to prevent early native initialization
let crashlyticsInstance: ReturnType<typeof CrashlyticsModule> | null = null;

async function getCrashlytics() {
  if (crashlyticsInstance) return crashlyticsInstance;
  
  // Skip on web
  if (Platform.OS === 'web') return null;
  
  try {
    const crashlyticsModule = await import('@react-native-firebase/crashlytics');
    crashlyticsInstance = crashlyticsModule.default();
    return crashlyticsInstance;
  } catch (error) {
    console.warn('[Crashlytics] Failed to load module:', error);
    return null;
  }
}

/**
 * Initialize Crashlytics
 */
export async function initCrashlytics(): Promise<void> {
  try {
    const crashlytics = await getCrashlytics();
    if (!crashlytics) return;
    
    // Enable Crashlytics collection
    await crashlytics.setCrashlyticsCollectionEnabled(true);
    
    if (__DEV__) {
      console.warn('[Crashlytics] Initialized successfully');
    }
  } catch (error) {
    console.error('[Crashlytics] Failed to initialize:', error);
  }
}

/**
 * Log non-fatal error
 */
export async function logError(error: Error, context?: Record<string, unknown>): Promise<void> {
  try {
    const crashlytics = await getCrashlytics();
    if (!crashlytics) return;
    
    if (context) {
      for (const [key, value] of Object.entries(context)) {
        await crashlytics.setAttribute(key, String(value));
      }
    }
    
    crashlytics.recordError(error);
  } catch (err) {
    console.error('[Crashlytics] Failed to log error:', err);
  }
}

/**
 * Log custom message
 */
export async function log(message: string): Promise<void> {
  try {
    const crashlytics = await getCrashlytics();
    if (!crashlytics) return;
    
    crashlytics.log(message);
  } catch (err) {
    console.error('[Crashlytics] Failed to log message:', err);
  }
}

/**
 * Set user identifier (no PII!)
 */
export async function setUserId(userId: string): Promise<void> {
  try {
    const crashlytics = await getCrashlytics();
    if (!crashlytics) return;
    
    crashlytics.setUserId(userId);
  } catch (err) {
    console.error('[Crashlytics] Failed to set user ID:', err);
  }
}

/**
 * Set custom attribute
 */
export async function setAttribute(key: string, value: string): Promise<void> {
  try {
    const crashlytics = await getCrashlytics();
    if (!crashlytics) return;
    
    crashlytics.setAttribute(key, value);
  } catch (err) {
    console.error('[Crashlytics] Failed to set attribute:', err);
  }
}

/**
 * Test crash (development only)
 */
export async function testCrash(): Promise<void> {
  if (__DEV__) {
    const crashlytics = await getCrashlytics();
    if (crashlytics) {
      crashlytics.crash();
    }
  }
}
