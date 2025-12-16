/**
 * UpdateSplashScreen Component
 * 
 * Shows on app start when EAS update is being downloaded.
 * Displays progress bar and prevents interaction until update is ready.
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import { useReduceMotionEnabled } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';
import { logger } from '../utils/logger';
import { createShadow } from '../utils/shadow';

// Lazy-load expo-updates
let Updates: any = null;
let Constants: any = null;
try {
  Updates = require('expo-updates');
  Constants = require('expo-constants');
  logger.log('[UpdateSplashScreen] Loaded modules - Updates:', !!Updates, 'Constants:', !!Constants);
} catch (err) {
  // expo-updates not available (e.g., in Expo Go)
  logger.warn('[UpdateSplashScreen] Failed to load expo-updates:', err);
}

const isExpoGo = Constants?.default?.appOwnership === 'expo' || Constants?.appOwnership === 'expo';
const shouldSkipUpdates = __DEV__ || isExpoGo || !Updates || Updates?.isEnabled === false;

logger.log('[UpdateSplashScreen] Environment check:', {
  isDev: __DEV__,
  isExpoGo,
  hasUpdates: !!Updates,
  updatesEnabled: Updates?.isEnabled,
  shouldSkip: shouldSkipUpdates
});

export default function UpdateSplashScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();

  const [isChecking, setIsChecking] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showSplash, setShowSplash] = useState(false);
  
  // Prevent multiple simultaneous update checks
  const checkingRef = React.useRef(false);

  useEffect(() => {
    // Skip update check if updates should be skipped
    if (shouldSkipUpdates) {
      logger.log('[UpdateSplashScreen] Skipping update check');
      setIsChecking(false);
      return;
    }
    logger.log('[UpdateSplashScreen] Starting update check...');
    checkAndDownloadUpdate();
  }, []);

  // Re-check for updates when app comes to foreground
  useEffect(() => {
    // Skip if updates should be skipped
    if (shouldSkipUpdates) {
      return;
    }
    
    // Use AppState directly (no need to import since it's used by parent)
    const { AppState } = require('react-native');
    
    const subscription = AppState.addEventListener('change', (nextAppState: string) => {
      if (nextAppState === 'active') {
        logger.log('[UpdateSplashScreen] App became active, checking for updates...');
        checkAndDownloadUpdate();
      }
    });

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  const checkAndDownloadUpdate = async () => {
    // Prevent multiple simultaneous checks
    if (checkingRef.current) {
      logger.log('[UpdateSplashScreen] Update check already in progress, skipping...');
      return;
    }

    // Add timeout to prevent hanging indefinitely
    const timeoutId = setTimeout(() => {
      if (checkingRef.current) {
        logger.warn('[UpdateSplashScreen] Update check timed out after 60s, continuing with current version');
        setShowSplash(false);
        setIsChecking(false);
        setIsDownloading(false);
        checkingRef.current = false;
      }
    }, 60000); // 60 second timeout

    try {
      checkingRef.current = true;
      setIsChecking(true);

      // Check for available update
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        logger.log('[UpdateSplashScreen] Update available, starting download...');
        setShowSplash(true);
        setIsDownloading(true);
        setDownloadProgress(0);

        // Download the update with progress tracking
        await Updates.fetchUpdateAsync({
          // @ts-ignore - progress callback exists but not in types
          progressCallback: (progress: { receivedBytes: number; totalBytes: number }) => {
            const percentage = (progress.receivedBytes / progress.totalBytes) * 100;
            setDownloadProgress(Math.round(percentage));
            logger.log(`[UpdateSplashScreen] Download progress: ${percentage.toFixed(1)}%`);
          },
        });

        logger.log('[UpdateSplashScreen] Download complete, preparing to apply update...');
        
        // Show 100% progress
        setDownloadProgress(100);
        
        // Longer delay to ensure update is fully written and ready
        await new Promise(resolve => setTimeout(resolve, 1500));

        logger.log('[UpdateSplashScreen] Applying update and reloading app...');
        
        // Clear timeout before reload
        clearTimeout(timeoutId);
        
        // Reload the app to apply update with error handling
        try {
          await Updates.reloadAsync();
        } catch (reloadError) {
          logger.error('[UpdateSplashScreen] Failed to reload after update:', reloadError);
          // If reload fails, hide splash and continue with current version
          setShowSplash(false);
          setIsChecking(false);
          setIsDownloading(false);
          checkingRef.current = false;
        }
      } else {
        logger.log('[UpdateSplashScreen] No update available');
        clearTimeout(timeoutId);
        setShowSplash(false);
        setIsChecking(false);
        checkingRef.current = false;
      }
    } catch (error) {
      logger.error('[UpdateSplashScreen] Update check/download failed:', error);
      clearTimeout(timeoutId);
      // Hide splash and continue with current version
      setShowSplash(false);
      setIsChecking(false);
      setIsDownloading(false);
      checkingRef.current = false;
    }
  };

  // Don't render anything if updates are skipped or no update is showing
  if (shouldSkipUpdates || !showSplash) {
    return null;
  }

  return (
    <Modal
      visible={showSplash}
      transparent={true}
      // WCAG 2.3.3: Respects user's reduce motion preference
      animationType={reduceMotion ? 'none' : 'fade'}
      statusBarTranslucent={true}
    >
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <View
          style={[
            styles.content,
            {
              backgroundColor: palette.surface,
              shadowColor: palette.text,
            },
          ]}
        >
          {/* App Logo/Title */}
          <Text style={[styles.title, { color: palette.text }]}>
            3mpwr App
          </Text>

          {/* Status Text */}
          <Text style={[styles.status, { color: palette.text }]}>
            {isChecking && !isDownloading
              ? t('updates.splash.checking', 'Checking for updates...')
              : t('updates.splash.downloading', 'Downloading update...')}
          </Text>

          {/* Progress Bar */}
          {isDownloading && (
            <View style={styles.progressSection}>
              <View style={[styles.progressBarBackground, { backgroundColor: palette.muted }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${downloadProgress}%`,
                      backgroundColor: palette.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: palette.muted }]}>
                {downloadProgress}%
              </Text>
            </View>
          )}

          {/* Spinner */}
          {isChecking && !isDownloading && (
            <ActivityIndicator size="large" color={palette.primary} style={styles.spinner} />
          )}

          {/* Completion Message */}
          {downloadProgress === 100 && (
            <Text style={[styles.completionText, { color: palette.primary }]}>
              {t('updates.splash.complete', 'Update downloaded! Restarting...')}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '80%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    ...createShadow({
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressSection: {
    width: '100%',
    marginVertical: 16,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    // Animated width handled via Animated.Value
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  spinner: {
    marginTop: 16,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});
