/**
 * useRefreshWithUpdates Hook
 * 
 * Combines data refreshing with OTA update checking.
 * Use this in screens that need pull-to-refresh functionality.
 */

import React from 'react';

import { logger } from '../utils/logger';

// Lazy-load expo-updates
let Updates: any = null;
try {
  Updates = require('expo-updates');
} catch {
  if (__DEV__) {
    logger.warn('[useRefreshWithUpdates] expo-updates not available');
  }
}

export interface RefreshWithUpdatesOptions {
  /** Custom data refresh function */
  onRefresh?: () => Promise<void> | void;
  /** Whether to check for updates on refresh (default: true) */
  checkForUpdates?: boolean;
  /** Whether to show update toast on success (default: false) */
  showUpdateToast?: boolean;
}

export function useRefreshWithUpdates(options: RefreshWithUpdatesOptions = {}) {
  const {
    onRefresh,
    checkForUpdates = true,
    showUpdateToast = false,
  } = options;

  const [refreshing, setRefreshing] = React.useState(false);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  const refresh = React.useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      // Run data refresh and update check in parallel
      const promises: Promise<void>[] = [];

      // Add data refresh promise if provided
      if (onRefresh) {
        promises.push(Promise.resolve(onRefresh()));
      }

      // Add update check promise if enabled
      if (checkForUpdates && Updates && Updates.isEnabled !== false) {
        promises.push(
          (async () => {
            try {
              const update = await Updates.checkForUpdateAsync();
              if (update.isAvailable) {
                if (__DEV__) {
                  logger.debug('[useRefreshWithUpdates] Update available, downloading...');
                }
                await Updates.fetchUpdateAsync();
                setUpdateAvailable(true);
                if (showUpdateToast) {
                  // Could show a toast notification here
                  logger.debug('[useRefreshWithUpdates] Update downloaded, restart to apply');
                }
              }
            } catch (e) {
              if (__DEV__) {
                logger.warn('[useRefreshWithUpdates] Update check failed:', e);
              }
            }
          })()
        );
      }

      // Wait for all promises to complete
      await Promise.all(promises);
    } catch (error) {
      if (__DEV__) {
        logger.error('[useRefreshWithUpdates] Refresh failed:', error);
      }
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, onRefresh, checkForUpdates, showUpdateToast]);

  return {
    refreshing,
    refresh,
    updateAvailable,
  };
}
