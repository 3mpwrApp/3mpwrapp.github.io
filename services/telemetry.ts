import { Platform } from 'react-native';

import { logger } from '../utils/logger';

import { devCostAlert } from './costGuard';
import { FLAGS } from './featureFlags';

let initialized = false;

export async function initSentry(dsn?: string) {
  if (initialized) {
    if (__DEV__) logger.debug('Sentry already initialized, skipping');
    return;
  }
  if (!dsn) {
    if (__DEV__) logger.warn('Sentry init skipped: no DSN provided');
    return;
  }
  if (!FLAGS.sentry) {
    if (__DEV__) logger.warn('Sentry init skipped: disabled by feature flag');
    return;
  }
  
  try {
    // Developer cost alert for Sentry network usage/init
    devCostAlert({ feature: 'sentry', action: 'init:sentry' });
    
    // Pre-check: Ensure tslib is available (sentry-expo dependency)
    // This prevents the "__extends is undefined" error in some environments
    try {
      // @ts-ignore - checking for global tslib
      if (typeof global.tslib === 'undefined') {
        // Polyfill minimal tslib if missing (prevents sentry-expo from crashing)
        // @ts-ignore
        global.tslib = await import('tslib');
      }
    } catch (tslibError) {
      if (__DEV__) logger.warn('Sentry init skipped: tslib unavailable', tslibError);
      return;
    }
    
    // Lazy-load sentry-expo to avoid loading native modules when unavailable
    let sentryModule;
    try {
      sentryModule = await import('sentry-expo');
    } catch (importError) {
      if (__DEV__) logger.warn('Sentry init skipped: failed to import sentry-expo', importError);
      return;
    }
    
    // Check if Sentry module loaded correctly
    if (!sentryModule || typeof sentryModule.init !== 'function') {
      if (__DEV__) logger.warn('Sentry init skipped: Sentry.init is not a function');
      return;
    }
    
    // Wrap the actual initialization in a try-catch to prevent crashes
    try {
      await sentryModule.init({ 
        dsn,
        enableInExpoDevelopment: false, // Disable in development
        debug: __DEV__, // Enable debug mode in dev
      });
      initialized = true;
      if (__DEV__) logger.log('Sentry initialized successfully');
    } catch (initError) {
      if (__DEV__) logger.error('Sentry init failed:', initError);
      // Don't set initialized = true if init failed
      return;
    }
  } catch (e) {
    // If native module isn't available in this build/dev client, safely skip
    const error = e as Error;
    if (__DEV__) logger.error('Sentry init error:', error?.message, error?.stack);
  }
}

export async function initAnalytics() {
  if (Platform.OS !== 'web') return null;
  try {
    const mod = await import('../firebase/config');
    return mod.getFirebaseAnalytics();
  } catch {
    return null;
  }
}
