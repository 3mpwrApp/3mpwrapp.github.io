import { Platform } from 'react-native';

import { logger } from '../utils/logger';

import { devCostAlert } from './costGuard';
import { FLAGS } from './featureFlags';

let initialized = false;

export async function initSentry(dsn?: string) {
  if (initialized) return;
  if (!dsn) return;
  if (!FLAGS.sentry) return; // disabled in Free Mode or DSN not set
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
    } catch (tslibErr) {
      if (__DEV__) logger.warn('Sentry init skipped: tslib unavailable');
      return;
    }
    
    // Lazy-load sentry-expo to avoid loading native modules when unavailable
    const sentryModule = await import('sentry-expo');
    
    // Check if Sentry module loaded correctly
    if (!sentryModule || typeof sentryModule.init !== 'function') {
      if (__DEV__) logger.warn('Sentry init skipped: Sentry.init is not a function (it is undefined)');
      return;
    }
    
    sentryModule.init({ dsn });
    initialized = true;
  } catch (e) {
    // If native module isn't available in this build/dev client, safely skip
    if (__DEV__) logger.warn('Sentry init skipped:', (e as Error)?.message);
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
