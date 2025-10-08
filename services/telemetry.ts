import { Platform } from 'react-native';

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
    // Lazy-load sentry-expo to avoid loading native modules when unavailable
    const Sentry = await import('sentry-expo');
    Sentry.init({ dsn });
    initialized = true;
  } catch (e) {
    // If native module isn't available in this build/dev client, safely skip
    if (__DEV__) console.warn('Sentry init skipped:', (e as Error)?.message);
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
