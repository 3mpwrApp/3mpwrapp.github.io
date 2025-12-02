/**
 * Security Settings Screen
 * 
 * Allows users to manage evidence encryption settings:
 * - Enable/disable passphrase protection
 * - View encryption status
 * - Rotate encryption keys
 * - Export/import encrypted data
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import {
    forceSyncNow,
    getSyncConfig,
    getSyncStatus,
    saveSyncConfig,
    type SyncConfig
} from '../../../services/backgroundSync';
import {
    disablePassphraseProtection,
    enablePassphraseProtection,
    getSecurityStatus,
    rotateDeviceKey
} from '../../../services/encryptionEnhanced';
import { useAppPalette } from '../../../theme/usePalette';

export default function SecuritySettingsScreen() {
  const palette = useAppPalette();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Security Settings');
  useFocusOnRefOnMount(titleRef);
  
  const [loading, setLoading] = React.useState(true);
  const [securityStatus, setSecurityStatus] = React.useState<{
    secureStoreAvailable: boolean;
    passphraseEnabled: boolean;
    lastKeyRotation: Date | null;
    encryptionVersion: number;
    recommendation?: string;
  } | null>(null);
  const [syncConfig, setSyncConfigState] = React.useState<SyncConfig | null>(null);
  const [syncStatus, setSyncStatus] = React.useState<{
    isOnline: boolean;
    pendingItems: number;
    lastSync: Date | null;
    syncEnabled: boolean;
    backgroundTaskRegistered: boolean;
  } | null>(null);
  
  // Passphrase modal state
  const [showPassphraseModal, setShowPassphraseModal] = React.useState(false);
  const [passphrase, setPassphrase] = React.useState('');
  const [confirmPassphrase, setConfirmPassphrase] = React.useState('');
  const [passphraseMode, setPassphraseMode] = React.useState<'enable' | 'disable' | 'verify'>('enable');
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  
  // Load security status
  React.useEffect(() => {
    loadStatus();
  }, []);
  
  async function loadStatus() {
    setLoading(true);
    try {
      const [security, sync, syncStat] = await Promise.all([
        getSecurityStatus(),
        getSyncConfig(),
        getSyncStatus(),
      ]);
      setSecurityStatus(security);
      setSyncConfigState(sync);
      setSyncStatus(syncStat);
    } catch (err) {
      console.error('Failed to load security status:', err);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleTogglePassphrase() {
    if (securityStatus?.passphraseEnabled) {
      setPassphraseMode('disable');
      setShowPassphraseModal(true);
    } else {
      setPassphraseMode('enable');
      setShowPassphraseModal(true);
    }
  }
  
  async function handlePassphraseSubmit() {
    if (passphraseMode === 'enable') {
      if (passphrase.length < 8) {
        Alert.alert('Weak Passphrase', 'Please use at least 8 characters for your passphrase.');
        return;
      }
      if (passphrase !== confirmPassphrase) {
        Alert.alert('Mismatch', 'Passphrases do not match. Please try again.');
        return;
      }
      
      setIsProcessing(true);
      const success = await enablePassphraseProtection(passphrase);
      setIsProcessing(false);
      
      if (success) {
        Alert.alert('Success', 'Passphrase protection enabled. You will need this passphrase to access your evidence.');
        setShowPassphraseModal(false);
        setPassphrase('');
        setConfirmPassphrase('');
        loadStatus();
      } else {
        Alert.alert('Error', 'Failed to enable passphrase protection. Please try again.');
      }
    } else if (passphraseMode === 'disable') {
      setIsProcessing(true);
      const success = await disablePassphraseProtection(passphrase);
      setIsProcessing(false);
      
      if (success) {
        Alert.alert('Success', 'Passphrase protection disabled.');
        setShowPassphraseModal(false);
        setPassphrase('');
        loadStatus();
      } else {
        Alert.alert('Incorrect Passphrase', 'The passphrase you entered is incorrect.');
      }
    }
  }
  
  async function handleRotateKey() {
    Alert.alert(
      'Rotate Encryption Key',
      'This will generate a new encryption key and re-encrypt all your data. This is recommended every 90 days for maximum security.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rotate Key',
          onPress: async () => {
            setIsProcessing(true);
            const success = await rotateDeviceKey();
            setIsProcessing(false);
            
            if (success) {
              Alert.alert('Success', 'Encryption key rotated successfully.');
              loadStatus();
            } else {
              Alert.alert('Error', 'Failed to rotate encryption key.');
            }
          },
        },
      ]
    );
  }
  
  async function handleToggleSync(enabled: boolean) {
    await saveSyncConfig({ enabled });
    setSyncConfigState(prev => prev ? { ...prev, enabled } : null);
  }
  
  async function handleForcSync() {
    setIsProcessing(true);
    try {
      const result = await forceSyncNow();
      Alert.alert(
        'Sync Complete',
        `Processed: ${result.itemsProcessed}\nFailed: ${result.itemsFailed}\nDuration: ${result.duration}ms`
      );
    } catch (err: any) {
      Alert.alert('Sync Failed', err?.message || 'Unknown error');
    } finally {
      setIsProcessing(false);
      loadStatus();
    }
  }
  
  if (loading) {
    return (
      <ResponsiveScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Loading security settings...</Text>
        </View>
      </ResponsiveScreenWrapper>
    );
  }
  
  return (
    <ResponsiveScreenWrapper scrollable>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          🔐 Security & Privacy
        </Text>
        <Text style={styles.subtitle}>
          Manage how your evidence and personal data are protected.
        </Text>
        
        {/* Encryption Status Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Encryption Status</Text>
          
          <View style={styles.statusRow}>
            <View style={styles.statusIcon}>
              <Ionicons 
                name={securityStatus?.secureStoreAvailable ? 'shield-checkmark' : 'shield'} 
                size={24} 
                color={securityStatus?.secureStoreAvailable ? palette.success : palette.warning} 
              />
            </View>
            <View style={styles.statusText}>
              <Text style={styles.statusLabel}>Hardware Security</Text>
              <Text style={styles.statusValue}>
                {securityStatus?.secureStoreAvailable 
                  ? '✅ SecureStore Available (Hardware-backed)'
                  : '⚠️ Using Software Encryption'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusRow}>
            <View style={styles.statusIcon}>
              <Ionicons name="key" size={24} color={palette.primary} />
            </View>
            <View style={styles.statusText}>
              <Text style={styles.statusLabel}>Encryption Version</Text>
              <Text style={styles.statusValue}>AES-256 v{securityStatus?.encryptionVersion}</Text>
            </View>
          </View>
          
          {securityStatus?.lastKeyRotation && (
            <View style={styles.statusRow}>
              <View style={styles.statusIcon}>
                <Ionicons name="refresh" size={24} color={palette.textSecondary} />
              </View>
              <View style={styles.statusText}>
                <Text style={styles.statusLabel}>Last Key Rotation</Text>
                <Text style={styles.statusValue}>
                  {securityStatus.lastKeyRotation.toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
          
          {securityStatus?.recommendation && (
            <View style={styles.recommendationBox}>
              <Ionicons name="information-circle" size={20} color={palette.primary} />
              <Text style={styles.recommendationText}>{securityStatus.recommendation}</Text>
            </View>
          )}
        </View>
        
        {/* Passphrase Protection Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Passphrase Protection</Text>
          <Text style={styles.sectionDesc}>
            Add an extra layer of security by requiring a passphrase to access your evidence.
          </Text>
          
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Enable Passphrase</Text>
              <Text style={styles.toggleDesc}>
                {securityStatus?.passphraseEnabled 
                  ? 'Your evidence is protected with a passphrase'
                  : 'Add passphrase for extra security'}
              </Text>
            </View>
            <Switch
              value={securityStatus?.passphraseEnabled || false}
              onValueChange={handleTogglePassphrase}
              trackColor={{ false: palette.muted, true: palette.primary }}
            />
          </View>
          
          {securityStatus?.passphraseEnabled && (
            <A11yPressable
              onPress={() => {
                setPassphraseMode('verify');
                setShowPassphraseModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Change passphrase"
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Change Passphrase</Text>
            </A11yPressable>
          )}
        </View>
        
        {/* Key Management Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Key Management</Text>
          <Text style={styles.sectionDesc}>
            Rotate your encryption key periodically for maximum security.
          </Text>
          
          <A11yPressable
            onPress={handleRotateKey}
            accessibilityRole="button"
            accessibilityLabel="Rotate encryption key"
            style={styles.dangerButton}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="refresh" size={18} color="#FFF" />
                <Text style={styles.dangerButtonText}>Rotate Encryption Key</Text>
              </>
            )}
          </A11yPressable>
        </View>
        
        {/* Background Sync Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Background Sync</Text>
          <Text style={styles.sectionDesc}>
            Automatically sync your data when connected to the internet.
          </Text>
          
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Enable Auto-Sync</Text>
              <Text style={styles.toggleDesc}>
                Sync evidence and data in background
              </Text>
            </View>
            <Switch
              value={syncConfig?.enabled || false}
              onValueChange={handleToggleSync}
              trackColor={{ false: palette.muted, true: palette.primary }}
            />
          </View>
          
          {syncStatus && (
            <>
              <View style={styles.statusRow}>
                <View style={styles.statusIcon}>
                  <Ionicons 
                    name={syncStatus.isOnline ? 'cloud-done' : 'cloud-offline'} 
                    size={24} 
                    color={syncStatus.isOnline ? palette.success : palette.error} 
                  />
                </View>
                <View style={styles.statusText}>
                  <Text style={styles.statusLabel}>Connection</Text>
                  <Text style={styles.statusValue}>
                    {syncStatus.isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.statusRow}>
                <View style={styles.statusIcon}>
                  <Ionicons name="hourglass" size={24} color={palette.textSecondary} />
                </View>
                <View style={styles.statusText}>
                  <Text style={styles.statusLabel}>Pending Items</Text>
                  <Text style={styles.statusValue}>{syncStatus.pendingItems} items</Text>
                </View>
              </View>
              
              {syncStatus.lastSync && (
                <View style={styles.statusRow}>
                  <View style={styles.statusIcon}>
                    <Ionicons name="time" size={24} color={palette.textSecondary} />
                  </View>
                  <View style={styles.statusText}>
                    <Text style={styles.statusLabel}>Last Sync</Text>
                    <Text style={styles.statusValue}>
                      {syncStatus.lastSync.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
          
          <A11yPressable
            onPress={handleForcSync}
            accessibilityRole="button"
            accessibilityLabel="Sync now"
            style={styles.primaryButton}
            disabled={isProcessing || !syncStatus?.isOnline}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="sync" size={18} color="#FFF" />
                <Text style={styles.primaryButtonText}>Sync Now</Text>
              </>
            )}
          </A11yPressable>
        </View>
        
        {/* Passphrase Modal */}
        {showPassphraseModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>
                {passphraseMode === 'enable' ? 'Set Passphrase' : 
                 passphraseMode === 'disable' ? 'Enter Passphrase' : 'Change Passphrase'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Enter passphrase"
                placeholderTextColor={palette.textSecondary}
                secureTextEntry
                value={passphrase}
                onChangeText={setPassphrase}
                autoCapitalize="none"
              />
              
              {passphraseMode === 'enable' && (
                <TextInput
                  style={styles.input}
                  placeholder="Confirm passphrase"
                  placeholderTextColor={palette.textSecondary}
                  secureTextEntry
                  value={confirmPassphrase}
                  onChangeText={setConfirmPassphrase}
                  autoCapitalize="none"
                />
              )}
              
              <View style={styles.modalButtons}>
                <A11yPressable
                  onPress={() => {
                    setShowPassphraseModal(false);
                    setPassphrase('');
                    setConfirmPassphrase('');
                  }}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </A11yPressable>
                
                <A11yPressable
                  onPress={handlePassphraseSubmit}
                  style={styles.modalConfirmButton}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.modalConfirmText}>
                      {passphraseMode === 'enable' ? 'Enable' : 'Confirm'}
                    </Text>
                  )}
                </A11yPressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

function createStyles(palette: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      color: palette.textSecondary,
      fontSize: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: palette.textSecondary,
      lineHeight: 22,
      marginBottom: 20,
    },
    card: {
      padding: 16,
      marginBottom: 16,
      backgroundColor: palette.surface,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 8,
    },
    sectionDesc: {
      fontSize: 14,
      color: palette.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    statusIcon: {
      width: 40,
      alignItems: 'center',
    },
    statusText: {
      flex: 1,
      marginLeft: 8,
    },
    statusLabel: {
      fontSize: 14,
      color: palette.textSecondary,
    },
    statusValue: {
      fontSize: 15,
      color: palette.text,
      fontWeight: '500',
      marginTop: 2,
    },
    recommendationBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: palette.background,
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
      gap: 8,
    },
    recommendationText: {
      flex: 1,
      fontSize: 13,
      color: palette.text,
      lineHeight: 18,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    toggleLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: palette.text,
    },
    toggleDesc: {
      fontSize: 13,
      color: palette.textSecondary,
      marginTop: 2,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      gap: 8,
      marginTop: 12,
    },
    primaryButtonText: {
      color: palette.onPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    secondaryButton: {
      alignItems: 'center',
      paddingVertical: 10,
      marginTop: 8,
    },
    secondaryButtonText: {
      color: palette.primary,
      fontSize: 14,
      fontWeight: '500',
      textDecorationLine: 'underline',
    },
    dangerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.warning,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      gap: 8,
    },
    dangerButtonText: {
      color: '#FFF',
      fontSize: 15,
      fontWeight: '600',
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modal: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      backgroundColor: palette.background,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: palette.text,
      marginBottom: 12,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 12,
    },
    modalCancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    modalCancelText: {
      color: palette.textSecondary,
      fontSize: 15,
      fontWeight: '500',
    },
    modalConfirmButton: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    modalConfirmText: {
      color: palette.onPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
  });
}
