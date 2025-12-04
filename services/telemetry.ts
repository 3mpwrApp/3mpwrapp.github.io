import * as Sentry from '@sentry/react-native';
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
    
    // Skip in Expo Go - native modules not available
    // @ts-ignore - Constants is available in React Native/Expo
    const Constants = require('expo-constants').default;
    if (Constants?.appOwnership === 'expo') {
      if (__DEV__) logger.warn('Sentry init skipped: not supported in Expo Go (use development build)');
      return;
    }
    
    // Initialize Sentry with @sentry/react-native
    Sentry.init({ 
      dsn,
      debug: __DEV__,
      environment: __DEV__ ? 'development' : 'production',
      tracesSampleRate: __DEV__ ? 1.0 : 0.1,
      enableAutoSessionTracking: true,
      integrations: [
        Sentry.feedbackIntegration({
          // User feedback widget configuration
          colorScheme: 'system',
          isNameRequired: false,
          isEmailRequired: false,
          enableScreenshot: true,
          showBranding: false,
          formTitle: 'Send Feedback',
          submitButtonLabel: 'Send Feedback',
          cancelButtonLabel: 'Cancel',
          addScreenshotButtonLabel: 'Add Screenshot',
          removeScreenshotButtonLabel: 'Remove Screenshot',
          nameLabel: 'Name',
          namePlaceholder: 'Your name (optional)',
          emailLabel: 'Email',
          emailPlaceholder: 'your.email@example.com (optional)',
          messageLabel: 'What went wrong?',
          messagePlaceholder: 'Describe the issue or share your feedback...',
          successMessageText: 'Thank you for your feedback!',
        }),
      ],
    });
    initialized = true;
    if (__DEV__) logger.log('Sentry initialized successfully');
  } catch (e) {
    // If native module isn't available in this build/dev client, safely skip
    const error = e as Error;
    if (__DEV__) logger.error('Sentry init error:', error?.message, error?.stack);
  }
}

/**
 * Show the Sentry User Feedback widget
 * Opens an in-app form for users to submit feedback
 */
export function showFeedbackWidget(): void {
  if (!initialized) {
    if (__DEV__) logger.warn('Cannot show feedback widget: Sentry not initialized');
    return;
  }
  try {
    Sentry.showFeedbackWidget();
  } catch (e) {
    if (__DEV__) logger.error('Failed to show feedback widget:', e);
  }
}

/**
 * Show the floating feedback button
 * Button opens the feedback widget when pressed
 */
export function showFeedbackButton(): void {
  if (!initialized) {
    if (__DEV__) logger.warn('Cannot show feedback button: Sentry not initialized');
    return;
  }
  try {
    Sentry.showFeedbackButton();
  } catch (e) {
    if (__DEV__) logger.error('Failed to show feedback button:', e);
  }
}

/**
 * Hide the floating feedback button
 */
export function hideFeedbackButton(): void {
  if (!initialized) return;
  try {
    Sentry.hideFeedbackButton();
  } catch (e) {
    if (__DEV__) logger.error('Failed to hide feedback button:', e);
  }
}

/**
 * Check if Sentry is initialized
 */
export function isSentryInitialized(): boolean {
  return initialized;
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
