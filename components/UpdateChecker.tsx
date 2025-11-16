/**
 * UpdateChecker Component
 * 
 * Provides manual OTA update checking with visual feedback.
 * Shows update status, download progress, and prompts to restart.
 */

import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';
import { logger } from '../utils/logger';

import A11yPressable from './A11yPressable';
import { DyslexiaText } from './DyslexiaText';

// Lazy-load expo-updates and expo-constants to handle cases where they're not available
let Updates: any = null;
let Constants: any = null;
try {
  Updates = require('expo-updates');
  Constants = require('expo-constants');
} catch {
  // expo-updates not available (e.g., in Expo Go)
  if (__DEV__) {
    logger.warn('[UpdateChecker] expo-updates not available');
  }
}

// Check if running in Expo Go
const isExpoGo = Constants?.default?.appOwnership === 'expo' || Constants?.appOwnership === 'expo';

export default function UpdateChecker() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = React.useMemo(() => createStyles(palette), [palette]);

  const [checking, setChecking] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [downloadProgress, setDownloadProgress] = React.useState(0);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [lastChecked, setLastChecked] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Check if updates are available (not in Expo Go and updates module loaded)
  const isUpdateAvailable = !isExpoGo && Updates?.isEnabled !== false;

  const checkForUpdates = async () => {
    if (!Updates || !isUpdateAvailable) {
      Alert.alert(
        t('updates.notAvailable', 'Updates Not Available'),
        t('updates.notAvailableDesc', 'OTA updates are not available in this build. Use a development build or production APK for update support.')
      );
      return;
    }

    try {
      setChecking(true);
      setError(null);

      // Check for available update
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdateAvailable(true);
        setDownloading(true);
        setDownloadProgress(0);

        // Download the update with progress tracking
        const downloadResumable = Updates.fetchUpdateAsync({
          // @ts-ignore - progress callback exists but not in types
          progressCallback: (progress: { receivedBytes: number; totalBytes: number }) => {
            const percentage = (progress.receivedBytes / progress.totalBytes) * 100;
            setDownloadProgress(Math.round(percentage));
            logger.log(`[UpdateChecker] Download progress: ${percentage.toFixed(1)}%`);
          },
        });

        await downloadResumable;

        setDownloading(false);
        setDownloadProgress(100);
        setLastChecked(new Date().toISOString());

        // Prompt to restart
        Alert.alert(
          t('updates.available', 'Update Available'),
          t('updates.availableDesc', 'A new version is ready. Restart the app to apply updates.'),
          [
            { text: t('common.later', 'Later'), style: 'cancel' },
            {
              text: t('updates.restartNow', 'Restart Now'),
              onPress: async () => {
                try {
                  // Give user feedback before reload
                  logger.log('[UpdateChecker] User requested restart to apply update');
                  // Small delay to ensure alert is dismissed
                  await new Promise(resolve => setTimeout(resolve, 300));
                  await Updates.reloadAsync();
                } catch (e) {
                  logger.error('[UpdateChecker] Failed to reload:', e);
                  Alert.alert(
                    t('updates.restartFailed', 'Restart Failed'),
                    t('updates.restartFailedDesc', 'Please close and reopen the app manually.')
                  );
                }
              },
            },
          ]
        );
      } else {
        setLastChecked(new Date().toISOString());
        Alert.alert(
          t('updates.upToDate', 'Up to Date'),
          t('updates.upToDateDesc', "You're running the latest version!")
        );
      }
    } catch (e: any) {
      logger.error('[UpdateChecker] Check failed:', e);
      setError(e.message || 'Unknown error');
      Alert.alert(
        t('updates.checkFailed', 'Update Check Failed'),
        t('updates.checkFailedDesc', 'Could not check for updates. Please try again later.')
      );
    } finally {
      setChecking(false);
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const formatLastChecked = (iso: string | null) => {
    if (!iso) return null;
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return t('updates.justNow', 'Just now');
    if (diffMins < 60) return t('updates.minsAgo', '{{count}} mins ago', { count: diffMins });
    if (diffHours < 24) return t('updates.hoursAgo', '{{count}} hours ago', { count: diffHours });
    return date.toLocaleDateString();
  };

  // Don't render if updates not supported
  if (!Updates || !isUpdateAvailable) {
    return null;
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <DyslexiaText style={s.title}>
          {t('updates.title', 'App Updates')}
        </DyslexiaText>
        {lastChecked && (
          <DyslexiaText style={s.lastChecked}>
            {t('updates.lastChecked', 'Last checked: {{time}}', { time: formatLastChecked(lastChecked) || '' })}
          </DyslexiaText>
        )}
      </View>

      <A11yPressable
        onPress={checkForUpdates}
        disabled={checking || downloading}
        style={[s.button, (checking || downloading) && s.buttonDisabled]}
        accessibilityRole="button"
        accessibilityLabel={
          checking
            ? t('updates.checking', 'Checking for updates...')
            : downloading
            ? t('updates.downloading', 'Downloading update... {{progress}}%', { progress: downloadProgress })
            : t('updates.checkButton', 'Check for Updates')
        }
        accessibilityHint={t('updates.checkHint', 'Checks if a new version is available and downloads it')}
      >
        <View style={s.buttonContent}>
          {(checking || downloading) && (
            <ActivityIndicator size="small" color={palette.onPrimary} style={s.spinner} />
          )}
          <DyslexiaText style={s.buttonText}>
            {checking
              ? t('updates.checking', 'Checking for updates...')
              : downloading
              ? t('updates.downloading', 'Downloading update... {{progress}}%', { progress: downloadProgress })
              : t('updates.checkButton', 'Check for Updates')}
          </DyslexiaText>
        </View>
      </A11yPressable>

      {downloading && downloadProgress > 0 && (
        <View style={s.progressContainer}>
          <View style={s.progressBarBackground}>
            <View style={[s.progressBarFill, { width: `${downloadProgress}%` }]} />
          </View>
          <DyslexiaText style={s.progressText}>
            {t('updates.downloadProgress', '{{progress}}% complete', { progress: downloadProgress })}
          </DyslexiaText>
        </View>
      )}

      {error && (
        <View style={s.errorContainer}>
          <DyslexiaText style={s.errorText}>
            {t('updates.error', 'Error: {{message}}', { message: error })}
          </DyslexiaText>
        </View>
      )}

      {updateAvailable && !downloading && (
        <View style={s.infoContainer}>
          <DyslexiaText style={s.infoText}>
            {t('updates.readyToRestart', 'Update ready! Restart to apply.')}
          </DyslexiaText>
        </View>
      )}
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof useAppPalette>) =>
  StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: palette.surface,
      borderRadius: 8,
      marginVertical: 8,
    },
    header: {
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    lastChecked: {
      fontSize: 12,
      color: palette.muted,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: palette.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    spinner: {
      marginRight: 8,
    },
    progressContainer: {
      marginTop: 12,
      gap: 4,
    },
    progressBarBackground: {
      width: '100%',
      height: 8,
      backgroundColor: palette.muted,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: palette.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      color: palette.text,
      textAlign: 'center',
    },
    errorContainer: {
      marginTop: 8,
      padding: 8,
      backgroundColor: palette.error + '20',
      borderRadius: 4,
    },
    errorText: {
      color: palette.error,
      fontSize: 12,
    },
    infoContainer: {
      marginTop: 8,
      padding: 8,
      backgroundColor: palette.primary + '20',
      borderRadius: 4,
    },
    infoText: {
      color: palette.primary,
      fontSize: 12,
    },
  });
