/**
 * User-Friendly Error Handling System
 * Provides contextual error messages with actionable guidance
 * Replaces generic "Something went wrong" alerts
 */

import { Alert, Linking, Platform } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';

import { trackEvent } from '../services/analyticsClient';

import { logger } from './logger';

export type ErrorContext = 
  | 'network'
  | 'auth'
  | 'storage'
  | 'permission'
  | 'firestore'
  | 'validation'
  | 'upload'
  | 'unknown';

interface ErrorConfig {
  title: string;
  message: string;
  action?: string;
  actionHandler?: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  severity: 'info' | 'warning' | 'error';
}

export const ERROR_CONTEXTS: Record<ErrorContext, ErrorConfig> = {
  network: {
    title: 'Connection Issue',
    message: 'Check your internet connection and try again. Some features may work offline.',
    action: 'Retry',
    icon: 'cloud-offline',
    severity: 'warning',
  },
  auth: {
    title: 'Sign In Required',
    message: 'Your session has expired. Please sign in again to continue.',
    action: 'Sign In',
    icon: 'lock-closed',
    severity: 'warning',
  },
  storage: {
    title: 'Storage Issue',
    message: 'Unable to save data. Check available storage space or try clearing app cache.',
    action: 'Settings',
    actionHandler: () => {
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
      } else {
        Linking.openSettings();
      }
    },
    icon: 'warning',
    severity: 'error',
  },
  permission: {
    title: 'Permission Needed',
    message: 'This feature requires additional permissions. Grant permission in your device Settings.',
    action: 'Open Settings',
    actionHandler: () => {
      Linking.openSettings();
    },
    icon: 'shield-checkmark',
    severity: 'info',
  },
  firestore: {
    title: 'Sync Issue',
    message: 'Unable to sync with cloud. Your data is saved locally and will sync when connection improves.',
    action: 'OK',
    icon: 'cloud-offline',
    severity: 'warning',
  },
  validation: {
    title: 'Invalid Input',
    message: 'Please check your input and try again. All required fields must be filled.',
    icon: 'alert-circle',
    severity: 'info',
  },
  upload: {
    title: 'Upload Failed',
    message: 'Unable to upload file. Check file size (max 10MB) and internet connection.',
    action: 'Retry',
    icon: 'cloud-upload',
    severity: 'error',
  },
  unknown: {
    title: 'Unexpected Error',
    message: 'Something went wrong. If this persists, please contact support.',
    action: 'Report',
    icon: 'bug',
    severity: 'error',
  },
};

interface ShowErrorOptions {
  context: ErrorContext;
  error?: Error;
  customMessage?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Show a user-friendly error alert with contextual information
 */
export function showContextualError({
  context,
  error,
  customMessage,
  onRetry,
  onDismiss,
}: ShowErrorOptions): void {
  const config = ERROR_CONTEXTS[context];
  const message = customMessage || config.message;
  
  // Log to analytics (without PII)
  trackEvent('error_displayed', {
    context,
    errorType: error?.name || 'unknown',
    severity: config.severity,
  });
  
  // Log to console in dev mode
  if (__DEV__ && error) {
    logger.error(`[${context}]`, error);
  }
  
  // Determine action handler
  const actionHandler = config.actionHandler || onRetry;
  
  if (actionHandler) {
    // Show alert with action button
    Alert.alert(
      config.title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onDismiss,
        },
        {
          text: config.action || 'OK',
          onPress: actionHandler,
        },
      ],
      { cancelable: true }
    );
  } else {
    // Show simple alert
    Alert.alert(
      config.title,
      message,
      [
        {
          text: 'OK',
          onPress: onDismiss,
        },
      ],
      { cancelable: true }
    );
  }
}

/**
 * Infer error context from error object
 */
export function inferErrorContext(error: Error): ErrorContext {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return 'network';
  }
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
    return 'auth';
  }
  if (message.includes('storage') || message.includes('quota') || message.includes('disk')) {
    return 'storage';
  }
  if (message.includes('permission') || message.includes('denied')) {
    return 'permission';
  }
  if (message.includes('firestore') || message.includes('firebase')) {
    return 'firestore';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  if (message.includes('upload') || message.includes('file')) {
    return 'upload';
  }
  
  return 'unknown';
}

/**
 * Smart error handler that auto-detects context
 */
export function handleError(error: Error, onRetry?: () => void, onDismiss?: () => void): void {
  const context = inferErrorContext(error);
  showContextualError({ context, error, onRetry, onDismiss });
}

/**
 * Show network error with retry
 */
export function showNetworkError(onRetry: () => void): void {
  showContextualError({
    context: 'network',
    onRetry,
  });
}

/**
 * Show auth error with sign-in action
 */
export function showAuthError(onSignIn: () => void): void {
  showContextualError({
    context: 'auth',
    onRetry: onSignIn,
  });
}

/**
 * Show validation error with custom message
 */
export function showValidationError(message: string): void {
  showContextualError({
    context: 'validation',
    customMessage: message,
  });
}

/**
 * Show upload error with retry
 */
export function showUploadError(onRetry: () => void): void {
  showContextualError({
    context: 'upload',
    onRetry,
  });
}
