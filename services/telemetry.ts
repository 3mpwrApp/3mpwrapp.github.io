import * as Sentry from 'sentry-expo';
import { Platform } from 'react-native';

let initialized = false;

export function initSentry(dsn?: string) {
  if (initialized) return;
  if (!dsn) return;
  Sentry.init({ dsn });
  initialized = true;
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
