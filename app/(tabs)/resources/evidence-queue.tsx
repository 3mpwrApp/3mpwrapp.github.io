import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { clearQueue, getQueue, processQueue } from '../../../services/evidenceQueue';
import { getQueue as getOfflineQueue, retryItem } from '../../../services/offlineQueue';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

export const options = { href: null };

export default function EvidenceQueueScreen() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t('templates.evidenceLocker.queueTitle', 'Upload Queue'));
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState<any[]>([]);
  const [offlineItems, setOfflineItems] = React.useState<any[]>([]);
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setItems(await getQueue());
    setOfflineItems(await getOfflineQueue());
  }, []);

  React.useEffect(() => { 
    load();
    // Refresh every 5 seconds to show updated status
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const [showInfo, setShowInfo] = React.useState(false);
  
  const retryOfflineItem = async (id: string) => {
    return retryItem(id, async (_payload: any) => {
      // Retry upload logic
    });
  };
  
  const pendingCount = offlineItems.filter(i => i.status !== 'succeeded').length;
  const failedCount = offlineItems.filter(i => i.status === 'failed').length;
  
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }} accessibilityLabel={t('templates.evidenceLocker.queueScreenLabel', 'Evidence upload queue screen')}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('templates.evidenceLocker.queueTitle', 'Upload Queue')}
        </Text>
        {pendingCount > 0 && (
          <View style={[s.badge, { backgroundColor: failedCount > 0 ? palette.error : palette.warning }]}>
            <Text style={s.badgeText}>{pendingCount}</Text>
          </View>
        )}
      </View>
      <DisclaimerBanner type="legal" compact={true} />
      <GapView style={s.actionsRow} gap={8}>
        <A11yPressable
          onPress={() => { setShowInfo(v=>!v); announce(showInfo ? t('common.hide') : t('templates.evidenceLocker.toggleInfo','Toggle instructions')); }}
          style={s.infoBtn}
          accessibilityRole="button"
          accessibilityLabel={t('templates.evidenceLocker.toggleInfo','Toggle instructions')}
        >
          <Text style={s.infoBtnText}>{showInfo ? t('common.hide','Hide') : t('common.show','Show')}</Text>
        </A11yPressable>
        <A11yPressable
          onPress={async () => { try { setBusy(t('templates.evidenceLocker.processing','Processing')); await processQueue(()=>{}); await load(); Alert.alert(t('templates.evidenceLocker.exportReady','Export ready'), t('templates.evidenceLocker.resetAnnounce','Evidence locker cleared')); } catch { Alert.alert(t('templates.evidenceLocker.shareError','Share failed'), t('templates.evidenceLocker.shareErrorBody','Could not share evidence file.')); } finally { setBusy(null); announce(t('common.processQueue','Process Queue')); } }}
          style={s.processBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common.processQueue','Process Queue')}
        >
          <Text style={s.processBtnText}>{busy || t('common.processQueue','Process Queue')}</Text>
        </A11yPressable>
        <A11yPressable
          onPress={async () => { await clearQueue(); await load(); announce(t('templates.evidenceLocker.resetAnnounce','Evidence locker cleared')); }}
          style={s.clearBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common.deleteAll','Delete All')}
        >
          <Text style={s.clearBtnText}>{t('common.deleteAll','Delete All')}</Text>
        </A11yPressable>
      </GapView>
      {showInfo && (
        <View style={s.infoCard} accessibilityRole="summary">
          <Text style={s.infoTitle}>{t('templates.evidenceLocker.infoTitle','How to Use')}</Text>
          <Text style={s.infoLine}>{t('templates.evidenceLocker.infoLine1')}</Text>
          <Text style={s.infoLine}>{t('templates.evidenceLocker.infoLine2')}</Text>
          <Text style={s.infoLine}>{t('templates.evidenceLocker.infoLine3')}</Text>
        </View>
      )}
      <Text style={s.sub}>{t('templates.evidenceLocker.queueSubtitle','Items waiting for cloud save.')}</Text>

      {/* Offline Queue Status */}
      {offlineItems.length > 0 && (
        <>
          <Text style={[s.title, { fontSize: 18, marginTop: 16 }]}>
            🔄 Offline Queue {pendingCount > 0 && `(${pendingCount} pending)`}
          </Text>
          {offlineItems.map((item, _idx) => {
            const statusIcon = item.status === 'succeeded' ? '✅' : 
                              item.status === 'failed' ? '❌' : 
                              item.status === 'retrying' ? '🔄' : '⏳';
            const statusColor = item.status === 'succeeded' ? palette.success : 
                               item.status === 'failed' ? palette.error : 
                               item.status === 'retrying' ? palette.warning : palette.textSecondary;
            
            return (
              <View key={item.id} style={[s.card, { borderLeftWidth: 4, borderLeftColor: statusColor }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.text}>
                      {statusIcon} {item.type.toUpperCase()}
                    </Text>
                    <Text style={s.meta}>
                      Status: {item.status} • Attempts: {item.retries}/{5}
                    </Text>
                    {item.error && (
                      <Text style={[s.meta, { color: palette.error, marginTop: 4 }]}>
                        ⚠️ {item.error}
                      </Text>
                    )}
                    <Text style={[s.meta, { fontSize: 11 }]}>
                      Created: {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  {item.status === 'failed' && (
                    <A11yPressable
                      onPress={async () => {
                        try {
                          await retryOfflineItem(item.id);
                          announce('Retrying upload');
                          await load();
                        } catch {
                          Alert.alert('Retry failed', 'Could not retry upload');
                        }
                      }}
                      style={[s.infoBtn, { backgroundColor: palette.primary }]}
                      accessibilityLabel="Retry upload"
                    >
                      <Ionicons name="refresh" size={16} color={palette.onPrimary} />
                    </A11yPressable>
                  )}
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* Regular Queue */}
          {items.length === 0 && offlineItems.length === 0 ? (
        <Text style={s.sub}>{t('templates.evidenceLocker.emptyQueue','Queue is empty.')}</Text>
      ) : items.length > 0 ? (
        <>
          <Text style={[s.title, { fontSize: 18, marginTop: 16 }]}>📋 Regular Queue</Text>
          {items.map((n, _idx) => (
            <View key={_idx} style={s.card}>
              <Text style={s.text}>{n.text || '(no text)'} {n.tags?.length ? `#${n.tags.join(',#')}` : ''}</Text>
              <Text style={s.meta}>{(n.files?.length || 0)} attachment(s)</Text>
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { color: palette.text, fontSize: 22, fontWeight: '700' },
    sub: { color: palette.text, opacity: 0.9, marginVertical: 8 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8 },
    text: { color: palette.text },
    meta: { color: palette.textSecondary },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    actionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
    infoBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    infoBtnText: { color: palette.text, fontWeight: '600', fontSize: 13 },
    processBtn: { backgroundColor: palette.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6 },
    processBtnText: { color: palette.onPrimary, fontWeight: '700' },
    clearBtn: { backgroundColor: palette.surface, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    clearBtnText: { color: palette.text, fontWeight: '600' },
    infoCard: { backgroundColor: palette.card, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: palette.muted, marginTop: 12 },
    infoTitle: { fontWeight: '700', color: palette.text, marginBottom: 4 },
    infoLine: { color: palette.text, opacity: 0.85, marginBottom: 2, fontSize: 13 },
    badge: { 
      minWidth: 24, 
      height: 24, 
      borderRadius: 12, 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingHorizontal: 8 
    },
    badgeText: { 
      color: palette.onPrimary, 
      fontWeight: '700', 
      fontSize: 12 
    },
  });
}

