import { Platform } from 'react-native';

let initialized = false;

export async function initSentry(dsn?: string) {
  if (initialized) return;
  if (!dsn) return;
  try {
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
