/**
 * Upload Queue Status Component
 * 
 * Shows pending/failed uploads and allows manual retry
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { autoProcessOnReconnect, clearSucceeded, getQueueStats, processQueue } from '../services/offlineQueue';
import { s } from '../theme/spacing';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';
import { GapView } from './GapView';

type UploadQueueStatusProps = {
  uploadFn: (payload: any) => Promise<void>;
  onRefresh?: () => void;
};

export default function UploadQueueStatus({ uploadFn, onRefresh }: UploadQueueStatusProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const [stats, setStats] = useState({ total: 0, pending: 0, retrying: 0, failed: 0, succeeded: 0 });
  const [processing, setProcessing] = useState(false);

  const loadStats = async () => {
    const newStats = await getQueueStats();
    setStats(newStats);
  };

  useEffect(() => {
    loadStats();
    // Auto-process on mount (checks if online)
    autoProcessOnReconnect(uploadFn).then(() => {
      loadStats();
      onRefresh?.();
    });
    // WCAG 2.2.1: Background polling for data sync, not a user-interaction timeout
    // Poll every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRetryAll = async () => {
    if (stats.pending === 0 && stats.failed === 0) return;
    
    setProcessing(true);
    try {
      const result = await processQueue(uploadFn);
      Alert.alert(
        'Sync Complete',
        `✅ Succeeded: ${result.succeeded}\n❌ Failed: ${result.failed}\n⏳ Pending: ${result.pending}`,
        [{ text: 'OK' }]
      );
      await loadStats();
      onRefresh?.();
    } catch (err: any) {
      Alert.alert('Sync Failed', err?.message || 'Could not process queue');
    } finally {
      setProcessing(false);
    }
  };

  const handleClearSucceeded = async () => {
    await clearSucceeded();
    await loadStats();
  };

  // Don't show if queue is empty
  if (stats.total === 0) return null;

  const hasIssues = stats.pending > 0 || stats.retrying > 0 || stats.failed > 0;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: hasIssues ? palette.warning : palette.success,
        borderRadius: 8,
        padding: s('md'),
        backgroundColor: hasIssues ? palette.warning + '10' : palette.success + '10',
        marginVertical: s('sm'),
      }}
    >
      <GapView gap={s('sm')}>
        {/* Status Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {processing ? (
              <ActivityIndicator size="small" color={palette.text} />
            ) : (
              <MaterialCommunityIcons
                name={hasIssues ? 'cloud-upload-outline' : 'cloud-check-outline'}
                size={20}
                color={hasIssues ? palette.warning : palette.success}
              />
            )}
            <Text
              style={{ color: palette.text, fontWeight: '600', fontSize: 15 }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {hasIssues ? t('queue.status.syncing', 'Upload Queue') : t('queue.status.synced', 'All Synced')}
            </Text>
          </View>
          
          {stats.succeeded > 0 && (
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={handleClearSucceeded}>
              <Text style={{ color: palette.primary, fontSize: 13, textDecorationLine: 'underline' }}>
                Clear ({stats.succeeded})
              </Text>
            </A11yPressable>
          )}
        </View>

        {/* Stats */}
        {hasIssues && (
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            {stats.pending > 0 && (
              <Text style={{ color: palette.text, fontSize: 13 }}>
                ⏳ {stats.pending} pending
              </Text>
            )}
            {stats.retrying > 0 && (
              <Text style={{ color: palette.text, fontSize: 13 }}>
                🔄 {stats.retrying} retrying
              </Text>
            )}
            {stats.failed > 0 && (
              <Text style={{ color: palette.destructive, fontSize: 13 }}>
                ❌ {stats.failed} failed
              </Text>
            )}
          </View>
        )}

        {/* Actions */}
        {hasIssues && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <A11yPressable
              style={{
                flex: 1,
                backgroundColor: palette.primary,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                alignItems: 'center',
              }}
              onPress={handleRetryAll}
              disabled={processing}
            >
              <Text
                style={{ color: palette.onPrimary, fontWeight: '600', fontSize: 14 }}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {processing ? t('queue.actions.syncing', 'Syncing...') : t('queue.actions.retry', 'Retry All')}
              </Text>
            </A11yPressable>
          </View>
        )}

        {/* Offline Notice */}
        <Text
          style={{ color: palette.textSecondary, fontSize: 12, lineHeight: 18 }}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t('queue.notice', 'Items will auto-sync when online. Manual retry available anytime.')}
        </Text>
      </GapView>
    </View>
  );
}
