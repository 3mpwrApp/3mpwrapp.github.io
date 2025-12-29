/**
 * Onboarding Analytics Tracking Service
 *
 * Privacy-first onboarding funnel tracking to measure conversion improvements.
 * Target: Improve conversion from 40% → 70%+
 */

import { trackEvent } from './analyticsClient';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (err) {
  console.error('[OnboardingTracking] AsyncStorage not available:', err);
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };
}

// Storage keys
const STORAGE_KEY_PREFIX = 'empowr.onboarding.';
const KEY_APP_FIRST_OPENED = `${STORAGE_KEY_PREFIX}app_first_opened`;
const KEY_FIRST_VALUE_ACTION = `${STORAGE_KEY_PREFIX}first_value_action`;
const KEY_LEGAL_BANNER_SHOWN = `${STORAGE_KEY_PREFIX}legal_banner_shown`;
const KEY_LEGAL_TERMS_ACCEPTED = `${STORAGE_KEY_PREFIX}legal_terms_accepted`;
const KEY_LEGAL_BANNER_DISMISSED = `${STORAGE_KEY_PREFIX}legal_banner_dismissed`;
const KEY_CONVERSION_COMPLETED = `${STORAGE_KEY_PREFIX}conversion_completed`;
const KEY_SESSION_ID = `${STORAGE_KEY_PREFIX}session_id`;

// Generate anonymous session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Get or create session ID
async function getSessionId(): Promise<string> {
  try {
    let sessionId = await AsyncStorage.getItem(KEY_SESSION_ID);
    if (!sessionId) {
      sessionId = generateSessionId();
      await AsyncStorage.setItem(KEY_SESSION_ID, sessionId);
    }
    return sessionId;
  } catch {
    return generateSessionId();
  }
}

/**
 * Track app first opened
 */
export async function trackAppFirstOpened(): Promise<void> {
  try {
    const already = await AsyncStorage.getItem(KEY_APP_FIRST_OPENED);
    if (already) return;

    const sessionId = await getSessionId();
    const timestamp = new Date().toISOString();

    await AsyncStorage.setItem(KEY_APP_FIRST_OPENED, JSON.stringify({ timestamp, sessionId }));

    trackEvent('onboarding.app.first_opened', {
      sessionId,
      timestamp,
    });
  } catch (error) {
    console.error('[OnboardingTracking] Failed to track app first opened:', error);
  }
}

/**
 * Track first value action (evidence or letter saved)
 */
export async function trackFirstValueAction(actionType: 'evidence' | 'letter'): Promise<void> {
  try {
    const already = await AsyncStorage.getItem(KEY_FIRST_VALUE_ACTION);
    if (already) return;

    const sessionId = await getSessionId();
    const timestamp = new Date().toISOString();
    const appFirstOpened = await AsyncStorage.getItem(KEY_APP_FIRST_OPENED);
    const timeToValue = appFirstOpened
      ? Date.now() - new Date(JSON.parse(appFirstOpened).timestamp).getTime()
      : null;

    await AsyncStorage.setItem(KEY_FIRST_VALUE_ACTION, JSON.stringify({
      timestamp,
      sessionId,
      actionType,
      timeToValue
    }));

    trackEvent('onboarding.first_value_action', {
      sessionId,
      timestamp,
      actionType,
      timeToValueMs: timeToValue,
    });

    await checkAndTrackConversion();
  } catch (error) {
    console.error('[OnboardingTracking] Failed to track first value action:', error);
  }
}

/**
 * Track legal banner shown
 */
export async function trackLegalBannerShown(): Promise<void> {
  try {
    const already = await AsyncStorage.getItem(KEY_LEGAL_BANNER_SHOWN);
    if (already) return;

    const sessionId = await getSessionId();
    const timestamp = new Date().toISOString();
    const firstValueAction = await AsyncStorage.getItem(KEY_FIRST_VALUE_ACTION);
    const timeSinceValue = firstValueAction
      ? Date.now() - new Date(JSON.parse(firstValueAction).timestamp).getTime()
      : null;

    await AsyncStorage.setItem(KEY_LEGAL_BANNER_SHOWN, JSON.stringify({
      timestamp,
      sessionId,
      timeSinceValue
    }));

    trackEvent('onboarding.legal_banner.shown', {
      sessionId,
      timestamp,
      timeSinceValueMs: timeSinceValue,
    });
  } catch (error) {
    console.error('[OnboardingTracking] Failed to track legal banner shown:', error);
  }
}

/**
 * Track legal terms accepted
 */
export async function trackLegalTermsAccepted(): Promise<void> {
  try {
    const already = await AsyncStorage.getItem(KEY_LEGAL_TERMS_ACCEPTED);
    if (already) return;

    const sessionId = await getSessionId();
    const timestamp = new Date().toISOString();
    const bannerShown = await AsyncStorage.getItem(KEY_LEGAL_BANNER_SHOWN);
    const timeToAccept = bannerShown
      ? Date.now() - new Date(JSON.parse(bannerShown).timestamp).getTime()
      : null;

    await AsyncStorage.setItem(KEY_LEGAL_TERMS_ACCEPTED, JSON.stringify({
      timestamp,
      sessionId,
      timeToAccept
    }));

    trackEvent('onboarding.legal_terms.accepted', {
      sessionId,
      timestamp,
      timeToAcceptMs: timeToAccept,
    });

    await checkAndTrackConversion();
  } catch (error) {
    console.error('[OnboardingTracking] Failed to track legal terms accepted:', error);
  }
}

/**
 * Track legal banner dismissed
 */
export async function trackLegalBannerDismissed(): Promise<void> {
  try {
    const sessionId = await getSessionId();
    const timestamp = new Date().toISOString();
    const bannerShown = await AsyncStorage.getItem(KEY_LEGAL_BANNER_SHOWN);
    const timeToDismiss = bannerShown
      ? Date.now() - new Date(JSON.parse(bannerShown).timestamp).getTime()
      : null;

    await AsyncStorage.setItem(KEY_LEGAL_BANNER_DISMISSED, JSON.stringify({
      timestamp,
      sessionId,
      timeToDismiss
    }));

    trackEvent('onboarding.legal_banner.dismissed', {
      sessionId,
      timestamp,
      timeToDismissMs: timeToDismiss,
    });
  } catch (error) {
    console.error('[OnboardingTracking] Failed to track legal banner dismissed:', error);
  }
}

/**
 * Check if conversion completed (value action + legal accepted)
 */
async function checkAndTrackConversion(): Promise<void> {
  try {
    const alreadyConverted = await AsyncStorage.getItem(KEY_CONVERSION_COMPLETED);
    if (alreadyConverted) return;

    const firstValueAction = await AsyncStorage.getItem(KEY_FIRST_VALUE_ACTION);
    const legalTermsAccepted = await AsyncStorage.getItem(KEY_LEGAL_TERMS_ACCEPTED);

    if (firstValueAction && legalTermsAccepted) {
      const sessionId = await getSessionId();
      const timestamp = new Date().toISOString();
      const appFirstOpened = await AsyncStorage.getItem(KEY_APP_FIRST_OPENED);
      const totalTime = appFirstOpened
        ? Date.now() - new Date(JSON.parse(appFirstOpened).timestamp).getTime()
        : null;

      await AsyncStorage.setItem(KEY_CONVERSION_COMPLETED, JSON.stringify({
        timestamp,
        sessionId,
        totalTime,
      }));

      trackEvent('onboarding.conversion.completed', {
        sessionId,
        timestamp,
        totalTimeMs: totalTime,
        valueActionType: JSON.parse(firstValueAction).actionType,
      });
    }
  } catch (error) {
    console.error('[OnboardingTracking] Failed to check conversion:', error);
  }
}

/**
 * Get onboarding status (for debugging)
 */
export async function getOnboardingStatus(): Promise<{
  appFirstOpened: boolean;
  firstValueAction: boolean;
  legalBannerShown: boolean;
  legalTermsAccepted: boolean;
  conversionCompleted: boolean;
}> {
  try {
    const [
      appFirstOpened,
      firstValueAction,
      legalBannerShown,
      legalTermsAccepted,
      conversionCompleted,
    ] = await Promise.all([
      AsyncStorage.getItem(KEY_APP_FIRST_OPENED),
      AsyncStorage.getItem(KEY_FIRST_VALUE_ACTION),
      AsyncStorage.getItem(KEY_LEGAL_BANNER_SHOWN),
      AsyncStorage.getItem(KEY_LEGAL_TERMS_ACCEPTED),
      AsyncStorage.getItem(KEY_CONVERSION_COMPLETED),
    ]);

    return {
      appFirstOpened: !!appFirstOpened,
      firstValueAction: !!firstValueAction,
      legalBannerShown: !!legalBannerShown,
      legalTermsAccepted: !!legalTermsAccepted,
      conversionCompleted: !!conversionCompleted,
    };
  } catch {
    return {
      appFirstOpened: false,
      firstValueAction: false,
      legalBannerShown: false,
      legalTermsAccepted: false,
      conversionCompleted: false,
    };
  }
}
