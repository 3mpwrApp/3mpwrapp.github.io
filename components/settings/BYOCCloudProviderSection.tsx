/**
 * BYOC Cloud Provider Section
 * Separated from EnhancedPrivacySection for file size optimization.
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { HIT_SLOP_12, HIT_SLOP_8 } from '../../constants/A11Y';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';
import GapView from '../GapView';

export type CloudProviderType = 'firebase' | 'webdav' | 'gdrive' | 'icloud' | 'dropbox' | 'onedrive' | 'none';

interface BYOCCloudProviderSectionProps {
  cloudProvider: CloudProviderType;
  onProviderChange: (provider: CloudProviderType) => Promise<void>;
  showProviderModal: boolean;
  setShowProviderModal: (visible: boolean) => void;
  onSelectProviderAndEnable: (provider: CloudProviderType) => Promise<void>;
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number = 1) {
  return StyleSheet.create({
    sectionSubtitle: { color: palette.textSecondary, fontSize: Math.round(14 * factor), marginBottom: 16, lineHeight: Math.round(20 * factor) },
    description: { color: palette.textSecondary, fontSize: Math.round(14 * factor), marginBottom: 12, lineHeight: Math.round(20 * factor) },
    buttonRow: { flexDirection: 'row', flexWrap: 'wrap' },
    button: { backgroundColor: palette.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: palette.muted, minHeight: 44, minWidth: 60, alignItems: 'center', justifyContent: 'center' },
    buttonActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    buttonText: { color: palette.text, fontSize: Math.round(14 * factor), fontWeight: '500' },
    buttonTextActive: { color: palette.onPrimary },
    rowLabel: { color: palette.text, opacity: 0.9, marginTop: 10, marginBottom: 6, fontSize: Math.round(14 * factor) },
    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: palette.background, borderRadius: 12, padding: 20, maxWidth: 500, width: '100%', maxHeight: '80%' },
    modalTitle: { fontSize: Math.round(20 * factor), fontWeight: '700', color: palette.text, marginBottom: 12 },
    modalDescription: { fontSize: Math.round(14 * factor), color: palette.textSecondary, marginBottom: 20, lineHeight: Math.round(20 * factor) },
    providerOption: { backgroundColor: palette.card, borderWidth: 2, borderColor: palette.muted, borderRadius: 12, padding: 16, marginBottom: 12 },
    providerOptionSelected: { borderColor: palette.primary, backgroundColor: palette.surface },
    providerTitle: { fontSize: Math.round(16 * factor), fontWeight: '600', color: palette.text, marginBottom: 8 },
    providerDesc: { fontSize: Math.round(13 * factor), color: palette.textSecondary, lineHeight: Math.round(18 * factor) },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
    modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', minHeight: 48 },
    modalButtonPrimary: { backgroundColor: palette.primary },
    modalButtonSecondary: { backgroundColor: palette.card, borderWidth: 1, borderColor: palette.muted },
    modalButtonText: { fontSize: Math.round(15 * factor), fontWeight: '600' },
    modalButtonTextPrimary: { color: palette.onPrimary },
    modalButtonTextSecondary: { color: palette.text },
  });
}

export default function BYOCCloudProviderSection({
  cloudProvider,
  onProviderChange,
  showProviderModal,
  setShowProviderModal,
  onSelectProviderAndEnable,
}: BYOCCloudProviderSectionProps) {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = React.useMemo(() => createStyles(palette, factor), [palette, factor]);

  return (
    <View style={{ marginTop: 16, marginBottom: 8 }}>
      <Text style={s.sectionSubtitle} accessibilityRole="header">🔒 Bring Your Own Cloud (BYOC)</Text>
      <Text style={[s.description, { fontWeight: '600', marginBottom: 8 }]}>
        ⚠️ IMPORTANT: You must use YOUR OWN cloud storage. 3mpwr does NOT provide cloud storage.
      </Text>
      <Text style={s.description}>
        Choose where YOUR data is stored. All options require your own accounts/servers. Your data will NEVER be stored on 3mpwr servers.
      </Text>

      {/* Row 1: Available providers */}
      <Text style={[s.rowLabel, { marginBottom: 4, fontWeight: '600' }]}>Available Now</Text>
      <GapView style={s.buttonRow} gap={8}>
        <A11yPressable
          style={[s.button, { flex: 1 }, cloudProvider === 'firebase' && s.buttonActive]}
          onPress={() => onProviderChange('firebase')}
          accessibilityRole="button"
          accessibilityState={{ selected: cloudProvider === 'firebase' }}
          accessibilityLabel="Use your own Firebase project for cloud storage - not 3mpwr Firebase"
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="flame" size={18} color={cloudProvider === 'firebase' ? palette.onPrimary : palette.text} />
          <Text style={[s.buttonText, cloudProvider === 'firebase' && s.buttonTextActive, { marginTop: 4 }]}>Firebase</Text>
          <Text style={[{ fontSize: 10, color: palette.textSecondary, textAlign: 'center', marginTop: 2 }, cloudProvider === 'firebase' && { color: palette.onPrimary }]}>YOUR Project</Text>
        </A11yPressable>

        <A11yPressable
          style={[s.button, { flex: 1 }, cloudProvider === 'gdrive' && s.buttonActive]}
          onPress={() => onProviderChange('gdrive')}
          accessibilityRole="button"
          accessibilityState={{ selected: cloudProvider === 'gdrive' }}
          accessibilityLabel="Use your own Google Drive for cloud storage"
          hitSlop={HIT_SLOP_8}
        >
          <Text style={{ fontSize: 18 }}>📁</Text>
          <Text style={[s.buttonText, cloudProvider === 'gdrive' && s.buttonTextActive, { marginTop: 4, fontSize: 11 }]}>Google Drive</Text>
          <Text style={[{ fontSize: 9, color: palette.textSecondary, textAlign: 'center', marginTop: 2 }, cloudProvider === 'gdrive' && { color: palette.onPrimary }]}>Your Account</Text>
        </A11yPressable>
      </GapView>

      {/* Row 2: More providers */}
      <GapView style={[s.buttonRow, { marginTop: 8 }]} gap={8}>
        <A11yPressable
          style={[s.button, { flex: 1 }, cloudProvider === 'webdav' && s.buttonActive]}
          onPress={() => onProviderChange('webdav')}
          accessibilityRole="button"
          accessibilityState={{ selected: cloudProvider === 'webdav' }}
          accessibilityLabel="Use your personal WebDAV storage (Nextcloud, ownCloud, etc.)"
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="cloud" size={18} color={cloudProvider === 'webdav' ? palette.onPrimary : palette.text} />
          <Text style={[s.buttonText, cloudProvider === 'webdav' && s.buttonTextActive, { marginTop: 4 }]}>WebDAV</Text>
          <Text style={[{ fontSize: 10, color: palette.textSecondary, textAlign: 'center', marginTop: 2 }, cloudProvider === 'webdav' && { color: palette.onPrimary }]}>Your Server</Text>
        </A11yPressable>

        <A11yPressable
          style={[s.button, { flex: 1 }, cloudProvider === 'none' && s.buttonActive]}
          onPress={() => onProviderChange('none')}
          accessibilityRole="button"
          accessibilityState={{ selected: cloudProvider === 'none' }}
          accessibilityLabel="No cloud storage - local only"
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="phone-portrait" size={18} color={cloudProvider === 'none' ? palette.onPrimary : palette.text} />
          <Text style={[s.buttonText, cloudProvider === 'none' && s.buttonTextActive, { marginTop: 4 }]}>Local Only</Text>
          <Text style={[{ fontSize: 10, color: palette.textSecondary, textAlign: 'center', marginTop: 2 }, cloudProvider === 'none' && { color: palette.onPrimary }]}>No Cloud</Text>
        </A11yPressable>
      </GapView>

      {/* Row 3: Coming soon providers */}
      <Text style={[s.rowLabel, { marginTop: 12, marginBottom: 4, fontWeight: '600' }]}>Coming Soon</Text>
      <GapView style={[s.buttonRow, { flexWrap: 'wrap' }]} gap={8}>
        <A11yPressable
          style={[s.button, { flex: 1, minWidth: 70, opacity: 0.7 }]}
          onPress={() => onProviderChange('icloud')}
          accessibilityRole="button"
          accessibilityLabel="iCloud - coming soon"
          hitSlop={HIT_SLOP_8}
        >
          <Text style={{ fontSize: 18 }}>☁️</Text>
          <Text style={[s.buttonText, { marginTop: 4, fontSize: 11 }]}>iCloud</Text>
          <Text style={{ fontSize: 9, color: palette.textSecondary, textAlign: 'center', marginTop: 2 }}>Soon</Text>
        </A11yPressable>

        <A11yPressable
          style={[s.button, { flex: 1, minWidth: 70, opacity: 0.7 }]}
          onPress={() => onProviderChange('dropbox')}
          accessibilityRole="button"
          accessibilityLabel="Dropbox - coming soon"
          hitSlop={HIT_SLOP_8}
        >
          <Text style={{ fontSize: 18 }}>📦</Text>
          <Text style={[s.buttonText, { marginTop: 4, fontSize: 11 }]}>Dropbox</Text>
          <Text style={{ fontSize: 9, color: palette.textSecondary, textAlign: 'center', marginTop: 2 }}>Soon</Text>
        </A11yPressable>

        <A11yPressable
          style={[s.button, { flex: 1, minWidth: 70, opacity: 0.7 }]}
          onPress={() => onProviderChange('onedrive')}
          accessibilityRole="button"
          accessibilityLabel="OneDrive - coming soon"
          hitSlop={HIT_SLOP_8}
        >
          <Text style={{ fontSize: 18 }}>💾</Text>
          <Text style={[s.buttonText, { marginTop: 4, fontSize: 11 }]}>OneDrive</Text>
          <Text style={{ fontSize: 9, color: palette.textSecondary, textAlign: 'center', marginTop: 2 }}>Soon</Text>
        </A11yPressable>
      </GapView>

      {/* Provider-specific information panels */}
      <ProviderInfoPanel provider={cloudProvider} palette={palette} styles={s} />

      {/* Cloud Provider Selection Modal */}
      <CloudProviderModal
        visible={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        cloudProvider={cloudProvider}
        setCloudProvider={(p) => onProviderChange(p)}
        onSelect={onSelectProviderAndEnable}
        palette={palette}
        styles={s}
      />
    </View>
  );
}

/** Provider info panel based on selection */
function ProviderInfoPanel({ provider, palette, styles: s }: { provider: CloudProviderType; palette: ReturnType<typeof useAppPalette>; styles: ReturnType<typeof createStyles> }) {
  if (provider === 'firebase') {
    return (
      <View style={{ marginTop: 12, padding: 12, backgroundColor: palette.card, borderRadius: 8, borderWidth: 1, borderColor: palette.warning || palette.primary }}>
        <Text style={[s.description, { marginBottom: 8, fontWeight: '700' }]}>
          <Ionicons name="warning" size={16} color={palette.warning || palette.primary} /> IMPORTANT: Use YOUR OWN Firebase Project
        </Text>
        <Text style={[s.description, { fontSize: 12, opacity: 0.9, marginBottom: 8 }]}>
          <Text style={{ fontWeight: '700' }}>You MUST create your own Firebase project.</Text> Do NOT use 3mpwr's Firebase.{'\n\n'}
          <Text style={{ fontWeight: '600' }}>Setup Required:{'\n'}</Text>
          1. Create FREE Firebase account at firebase.google.com{'\n'}
          2. Create a new Firebase project (YOUR project){'\n'}
          3. Configure firebase/config.ts with YOUR credentials{'\n'}
          4. Deploy Cloud Functions to YOUR project{'\n\n'}
          <Text style={{ fontWeight: '600' }}>Your Benefits:{'\n'}</Text>
          • 100% data ownership (your Firebase, your data){'\n'}
          • No data on 3mpwr servers{'\n'}
          • Free tier: 1GB storage, 10GB bandwidth/month{'\n'}
          • Full control over security and privacy
        </Text>
        <A11yPressable
          style={{ marginTop: 8, padding: 8, backgroundColor: palette.primary, borderRadius: 6, alignItems: 'center' }}
          onPress={() => Alert.alert(
            'Firebase Setup Guide',
            'To use Firebase, you must:\n\n1. Create your own FREE Firebase project\n2. Never use 3mpwr\'s Firebase\n3. Configure YOUR credentials in firebase/config.ts\n4. Deploy Cloud Functions to YOUR project\n\nSee firebase/functions/README.md for detailed setup instructions.\n\nYour data will ONLY be stored in YOUR Firebase project.',
            [{ text: 'Got it!' }]
          )}
          accessibilityRole="button"
          accessibilityLabel="View Firebase setup requirements"
          hitSlop={HIT_SLOP_8}
        >
          <Text style={{ color: palette.onPrimary, fontSize: 12, fontWeight: '600' }}>
            📖 View Setup Guide
          </Text>
        </A11yPressable>
      </View>
    );
  }

  if (provider === 'webdav') {
    return (
      <View style={{ marginTop: 12, padding: 12, backgroundColor: palette.card, borderRadius: 8, borderWidth: 1, borderColor: palette.muted }}>
        <Text style={[s.description, { marginBottom: 8 }]}>
          <Ionicons name="information-circle" size={16} color={palette.primary} /> Using WebDAV (Your Server)
        </Text>
        <Text style={[s.description, { fontSize: 12, opacity: 0.9, marginBottom: 0 }]}>
          • Store data on YOUR personal server{'\n'}
          • Compatible with Nextcloud, ownCloud, etc.{'\n'}
          • Complete control over data location{'\n'}
          • Configure connection details below
        </Text>
      </View>
    );
  }

  if (provider === 'gdrive') {
    return (
      <View style={{ marginTop: 12, padding: 12, backgroundColor: palette.card, borderRadius: 8, borderWidth: 1, borderColor: palette.primary }}>
        <Text style={[s.description, { marginBottom: 8 }]}>
          <Text style={{ fontSize: 18 }}>📁</Text> Using Google Drive (Your Account)
        </Text>
        <Text style={[s.description, { fontSize: 12, opacity: 0.9, marginBottom: 8 }]}>
          • Data stored in YOUR Google Drive account{'\n'}
          • Files saved to "3mpwr_App_Data" folder{'\n'}
          • App only accesses files it creates{'\n'}
          • Fully BYOC - 3mpwr cannot access your data{'\n'}
          • Free tier: 15GB shared with Gmail & Photos
        </Text>
        <A11yPressable
          style={{ marginTop: 8, padding: 8, backgroundColor: palette.surface, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: palette.error }}
          onPress={async () => {
            Alert.alert(
              'Disconnect Google Drive?',
              'This will disconnect your Google Drive. Your data in Google Drive will remain, but the app will no longer sync with it.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Disconnect',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const { disconnectGDrive } = await import('../../services/gdrive');
                      disconnectGDrive();
                      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                      await AsyncStorage.setItem('empowr.cloud.provider', 'none');
                      Alert.alert('Disconnected', 'Google Drive has been disconnected.');
                    } catch {}
                  }
                }
              ]
            );
          }}
          accessibilityRole="button"
          accessibilityLabel="Disconnect Google Drive"
          hitSlop={HIT_SLOP_8}
        >
          <Text style={{ color: palette.error, fontSize: 12, fontWeight: '600' }}>
            🔌 Disconnect Google Drive
          </Text>
        </A11yPressable>
      </View>
    );
  }

  if (provider === 'none') {
    return (
      <View style={{ marginTop: 12, padding: 12, backgroundColor: palette.card, borderRadius: 8, borderWidth: 1, borderColor: palette.warning || palette.muted }}>
        <Text style={[s.description, { marginBottom: 8 }]}>
          <Ionicons name="warning" size={16} color={palette.warning || palette.text} /> Local Storage Only
        </Text>
        <Text style={[s.description, { fontSize: 12, opacity: 0.9, marginBottom: 0 }]}>
          • All data stored on this device only{'\n'}
          • No cloud backup or sync{'\n'}
          • Data lost if device is lost/reset{'\n'}
          • Most private option (offline-first)
        </Text>
      </View>
    );
  }

  return null;
}

/** Modal for cloud provider selection */
function CloudProviderModal({
  visible,
  onClose,
  cloudProvider,
  setCloudProvider,
  onSelect,
  palette,
  styles: s,
}: {
  visible: boolean;
  onClose: () => void;
  cloudProvider: CloudProviderType;
  setCloudProvider: (p: CloudProviderType) => void;
  onSelect: (p: CloudProviderType) => void;
  palette: ReturnType<typeof useAppPalette>;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <Pressable
        style={s.modalOverlay}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
        hitSlop={HIT_SLOP_12}
      >
        <Pressable style={s.modalContent} onPress={(e) => e.stopPropagation()} accessibilityRole="none" hitSlop={HIT_SLOP_12}>
          <ScrollView>
            <Text style={s.modalTitle}>Choose Your Cloud Provider</Text>
            <Text style={s.modalDescription}>
              ⚠️ 3mpwr App does NOT provide cloud storage. You must use your own cloud service.
            </Text>

            {/* Firebase Option */}
            <Pressable
              style={[s.providerOption, cloudProvider === 'firebase' && s.providerOptionSelected]}
              onPress={() => setCloudProvider('firebase')}
              accessibilityRole="button"
              accessibilityState={{ selected: cloudProvider === 'firebase' }}
              hitSlop={HIT_SLOP_12}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="flame" size={24} color={palette.primary} style={{ marginRight: 12 }} />
                <Text style={s.providerTitle}>🔥 Firebase (Your Project)</Text>
              </View>
              <Text style={s.providerDesc}>
                • Full features: Chat, sync, notifications{'\n'}
                • Requires YOUR own FREE Firebase account{'\n'}
                • 100% data ownership in YOUR project{'\n'}
                • Free tier: 1GB storage, 10GB bandwidth/month{'\n'}
                • Setup required (see firebase/functions/README.md)
              </Text>
            </Pressable>

            {/* WebDAV Option */}
            <Pressable
              style={[s.providerOption, cloudProvider === 'webdav' && s.providerOptionSelected]}
              onPress={() => setCloudProvider('webdav')}
              accessibilityRole="button"
              accessibilityState={{ selected: cloudProvider === 'webdav' }}
              hitSlop={HIT_SLOP_12}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="cloud" size={24} color={palette.primary} style={{ marginRight: 12 }} />
                <Text style={s.providerTitle}>☁️ WebDAV (Your Server)</Text>
              </View>
              <Text style={s.providerDesc}>
                • Sync and backup only (no chat/notifications){'\n'}
                • Use Nextcloud, ownCloud, or any WebDAV server{'\n'}
                • Maximum privacy with self-hosted storage{'\n'}
                • Requires your own server or hosted service{'\n'}
                • Configuration needed (endpoint + credentials)
              </Text>
            </Pressable>

            {/* Local Only Option */}
            <Pressable
              style={[s.providerOption, cloudProvider === 'none' && s.providerOptionSelected]}
              onPress={() => setCloudProvider('none')}
              accessibilityRole="button"
              accessibilityState={{ selected: cloudProvider === 'none' }}
              hitSlop={HIT_SLOP_12}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="phone-portrait" size={24} color={palette.textSecondary} style={{ marginRight: 12 }} />
                <Text style={s.providerTitle}>📱 Local Only (No Cloud Backup)</Text>
              </View>
              <Text style={s.providerDesc}>
                • All data stored on this device only{'\n'}
                • Community features still work (via app's Firebase){'\n'}
                • No personal cloud backup or sync{'\n'}
                • Maximum privacy for personal data{'\n'}
                • No setup required
              </Text>
            </Pressable>

            <View style={s.modalButtons}>
              <Pressable
                style={[s.modalButton, s.modalButtonSecondary]}
                onPress={onClose}
                accessibilityRole="button"
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[s.modalButtonText, s.modalButtonTextSecondary]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[s.modalButton, s.modalButtonPrimary]}
                onPress={() => onSelect(cloudProvider)}
                accessibilityRole="button"
                hitSlop={HIT_SLOP_12}
              >
                <Text style={[s.modalButtonText, s.modalButtonTextPrimary]}>
                  Continue with {cloudProvider === 'firebase' ? 'Firebase' : cloudProvider === 'webdav' ? 'WebDAV' : 'Local Only'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
