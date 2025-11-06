/**
 * UpdateSplashScreen Component
 * 
 * Shows on app start when EAS update is being downloaded.
 * Displays progress bar and prevents interaction until update is ready.
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';
import { logger } from '../utils/logger';

// Lazy-load expo-updates
let Updates: any = null;
let Constants: any = null;
try {
  Updates = require('expo-updates');
  Constants = require('expo-constants');
} catch {
  // expo-updates not available (e.g., in Expo Go)
  if (__DEV__) {
    logger.warn('[UpdateSplashScreen] expo-updates not available');
  }
}

const isExpoGo = Constants?.default?.appOwnership === 'expo' || Constants?.appOwnership === 'expo';

export default function UpdateSplashScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();

  const [isChecking, setIsChecking] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Skip if in Expo Go or updates not available
    if (isExpoGo || !Updates || Updates?.isEnabled === false) {
      setShowSplash(false);
      setIsChecking(false);
      return;
    }

    checkAndDownloadUpdate();
  }, []);

  const checkAndDownloadUpdate = async () => {
    try {
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

        logger.log('[UpdateSplashScreen] Download complete, reloading app...');
        
        // Small delay to show 100% progress
        await new Promise(resolve => setTimeout(resolve, 500));

        // Reload the app to apply update
        await Updates.reloadAsync();
      } else {
        logger.log('[UpdateSplashScreen] No update available');
        setShowSplash(false);
        setIsChecking(false);
      }
    } catch (error) {
      logger.error('[UpdateSplashScreen] Update check failed:', error);
      // Hide splash and continue with current version
      setShowSplash(false);
      setIsChecking(false);
      setIsDownloading(false);
    }
  };

  // Don't render anything if not checking or no update
  if (!showSplash) {
    return null;
  }

  return (
    <Modal
      visible={showSplash}
      transparent={true}
      animationType="fade"
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
