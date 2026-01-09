/**
 * Bring Your Own Cloud (BYOC) Settings
 *
 * Allows users to configure their own cloud storage for complete data ownership.
 * Supports WebDAV (Nextcloud, ownCloud, etc.) and Google Drive.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import {
    getBYOCConfig,
    getDataPolicyMode,
    isBYOCEnabled,
    setBYOCConfig,
    testBYOCConnection,
    type BYOCConfig,
} from '../../../services/dataPolicy';
import { isGDriveConfigured } from '../../../services/gdrive';
import { useAppPalette } from '../../../theme/usePalette';

type ProviderType = 'webdav' | 'gdrive' | null;

export default function BYOCSettingsScreen() {
  const palette = useAppPalette();
  const styles = createStyles(palette);

  const [selectedProvider, setSelectedProvider] = useState<ProviderType>(null);
  const [webdavEndpoint, setWebdavEndpoint] = useState('');
  const [webdavUsername, setWebdavUsername] = useState('');
  const [webdavPassword, setWebdavPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const titleRef = React.useRef<Text>(null);
  const mode = getDataPolicyMode();
  const byocEnabled = isBYOCEnabled();

  // Load existing config on mount and when screen gets focus
  React.useEffect(() => {
    const checkConfig = async () => {
      // Load both BYOC and Google Drive configs from AsyncStorage
      // This ensures we pick up any configs saved during OAuth or previous sessions
      const { loadGDriveConfig } = await import('../../../services/gdrive');
      const { loadBYOCConfig } = await import('../../../services/dataPolicy');
      
      await Promise.all([loadGDriveConfig(), loadBYOCConfig()]);

      // Skip config checks while OAuth is in progress
      if (isAuthenticating) {
        console.warn('[BYOC] Skipping config check - authentication in progress');
        return;
      }

      const config = getBYOCConfig();
      const gdriveConfigured = isGDriveConfigured();

      console.warn('[BYOC] checkConfig:', { hasConfig: !!config, gdriveConfigured, currentlyConnected: connected });

      if (config) {
        setSelectedProvider(config.kind);
        setConnected(true);
        if (config.kind === 'webdav') {
          setWebdavEndpoint(config.endpoint || '');
          setWebdavUsername(config.username || '');
          // Don't show password for security
        }
      } else if (gdriveConfigured) {
        setSelectedProvider('gdrive');
        setConnected(true);
      } else if (connected) {
        // Only reset if we were previously connected but now have no config
        // This handles the disconnect case
        console.warn('[BYOC] Was connected but no config found - disconnecting');
        setSelectedProvider(null);
        setConnected(false);
        setWebdavEndpoint('');
        setWebdavUsername('');
        setWebdavPassword('');
      }
      // If not connected and no config, don't touch selectedProvider
      // This allows user to select a provider without it being reset
    };

    // Initial check - handle async properly
    checkConfig().catch(err => console.error('[BYOC] Initial checkConfig error:', err));

    // Check again when screen gets focus (e.g., after OAuth redirect)
    // Use a wrapper to handle the async function
    const intervalId = setInterval(() => {
      checkConfig().catch(err => console.error('[BYOC] checkConfig error:', err));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isAuthenticating, connected]);

  const handleTestConnection = async () => {
    console.warn('[BYOC] handleTestConnection called, provider:', selectedProvider);

    if (selectedProvider === 'webdav') {
      if (!webdavEndpoint.trim()) {
        Alert.alert('Missing Information', 'Please enter the WebDAV endpoint URL.');
        return;
      }

      setTesting(true);
      const config: BYOCConfig = {
        kind: 'webdav',
        endpoint: webdavEndpoint.trim(),
        username: webdavUsername.trim() || undefined,
        password: webdavPassword || undefined,
      };

      const result = await testBYOCConnection(config);
      setTesting(false);

      if (result.ok) {
        Alert.alert(
          '✅ Connection Successful',
          'Successfully connected to your cloud storage. Your data will now be saved to your own cloud.',
          [
            {
              text: 'Connect',
              onPress: async () => {
                await setBYOCConfig(config);
                setConnected(true);
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert(
          '❌ Connection Failed',
          result.error || 'Could not connect to the WebDAV server. Please check your endpoint URL and credentials.',
          [{ text: 'OK' }]
        );
      }
    } else if (selectedProvider === 'gdrive') {
      // Google Drive OAuth flow
      console.warn('[BYOC] Starting Google Drive OAuth flow...');
      setIsAuthenticating(true);
      try {
        console.warn('[BYOC] Importing gdrive service...');
        const { authenticateGDrive } = await import('../../../services/gdrive');
        console.warn('[BYOC] Calling authenticateGDrive()...');
        const result = await authenticateGDrive();
        console.warn('[BYOC] OAuth result:', result);

        if (result.success) {
          console.warn('[BYOC] Setting BYOC config to gdrive...');
          await setBYOCConfig({ kind: 'gdrive' });
          console.warn('[BYOC] Updating connected state to true...');
          setConnected(true);
          setSelectedProvider('gdrive'); // Explicitly set provider
          console.warn('[BYOC] Google Drive connection complete!');
          Alert.alert(
            '✅ Connected to Google Drive',
            'Your data will now be saved to your Google Drive.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            '❌ Connection Failed',
            result.error || 'Could not connect to Google Drive. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('[BYOC] Error during Google Drive OAuth:', error);
        Alert.alert(
          '❌ Connection Failed',
          error instanceof Error ? error.message : 'Unknown error',
          [{ text: 'OK' }]
        );
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  const handleDisconnect = async () => {
    console.warn('[BYOC] handleDisconnect called');

    // Perform disconnect immediately
    console.warn('[BYOC] Starting disconnect process...');

    // If Google Drive is connected, disconnect it properly
    if (selectedProvider === 'gdrive') {
      try {
        console.warn('[BYOC] Disconnecting Google Drive...');
        const { disconnectGDrive } = await import('../../../services/gdrive');
        await disconnectGDrive();
        console.warn('[BYOC] Google Drive disconnected successfully');
      } catch (error) {
        console.error('[BYOC] Error disconnecting Google Drive:', error);
      }
    }

    console.warn('[BYOC] Clearing BYOC config...');
    await setBYOCConfig(null);

    // Force immediate state update
    setConnected(false);
    setWebdavEndpoint('');
    setWebdavUsername('');
    setWebdavPassword('');
    setSelectedProvider(null);

    console.warn('[BYOC] Disconnect complete - UI should update now');

    Alert.alert(
      'Disconnected',
      'Cloud storage has been disconnected. Your data will now be stored locally only.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ResponsiveScreenWrapper>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text
          ref={titleRef}
          style={styles.title}
          accessibilityRole="header"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          ☁️ Bring Your Own Cloud
        </Text>

        <Text style={styles.subtitle}>
          Connect your own cloud storage for complete data ownership. Your data never touches our
          servers.
        </Text>

        <GapView style={{ height: 16 }} />

        {/* Status Banner */}
        {byocEnabled && (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={palette.primary} />
            <Text style={styles.infoBannerText}>
              BYOC Mode: <Text style={{ fontWeight: '700' }}>{mode}</Text>
              {'\n'}
              {connected
                ? `✅ Connected to ${selectedProvider === 'webdav' ? 'WebDAV' : 'Google Drive'}`
                : '⚠️ No cloud storage connected - using local storage only'}
            </Text>
          </View>
        )}

        {!byocEnabled && (
          <View style={[styles.infoBanner, { backgroundColor: palette.warning + '20' }]}>
            <Ionicons name="warning" size={20} color={palette.warning} />
            <Text style={styles.infoBannerText}>
              BYOC is not enabled in this app configuration. Contact the app administrator to enable
              it.
            </Text>
          </View>
        )}

        <GapView style={{ height: 24 }} />

        {/* Provider Selection */}
        <Text style={styles.sectionTitle}>Choose Your Cloud Provider</Text>

        <View style={styles.providerGrid}>
          {/* WebDAV Option */}
          <Pressable
            style={[
              styles.providerCard,
              selectedProvider === 'webdav' && styles.providerCardSelected,
            ]}
            onPress={() => setSelectedProvider('webdav')}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedProvider === 'webdav' }}
            accessibilityLabel="WebDAV - Nextcloud, ownCloud, or custom WebDAV server"
          >
            <Ionicons
              name={selectedProvider === 'webdav' ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={selectedProvider === 'webdav' ? palette.primary : palette.muted}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.providerName}>WebDAV</Text>
              <Text style={styles.providerDesc}>
                Nextcloud, ownCloud, or any WebDAV server
              </Text>
            </View>
          </Pressable>

          {/* Google Drive Option */}
          <Pressable
            style={[
              styles.providerCard,
              selectedProvider === 'gdrive' && styles.providerCardSelected,
            ]}
            onPress={() => setSelectedProvider('gdrive')}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedProvider === 'gdrive' }}
            accessibilityLabel="Google Drive - Your personal Google Drive storage"
          >
            <Ionicons
              name={selectedProvider === 'gdrive' ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={selectedProvider === 'gdrive' ? palette.primary : palette.muted}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.providerName}>Google Drive</Text>
              <Text style={styles.providerDesc}>Your personal Google Drive storage</Text>
            </View>
          </Pressable>
        </View>

        <GapView style={{ height: 24 }} />

        {/* WebDAV Configuration */}
        {selectedProvider === 'webdav' && (
          <View>
            <Text style={styles.sectionTitle}>WebDAV Configuration</Text>

            <Text style={styles.label}>Endpoint URL *</Text>
            <TextInput
              style={styles.input}
              placeholder="https://cloud.example.com/remote.php/dav/files/username/"
              placeholderTextColor={palette.muted}
              value={webdavEndpoint}
              onChangeText={setWebdavEndpoint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Text style={styles.label}>Username (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your username"
              placeholderTextColor={palette.muted}
              value={webdavUsername}
              onChangeText={setWebdavUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password (Optional)</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[styles.input, { paddingRight: 48 }]}
                placeholder="Your password"
                placeholderTextColor={palette.muted}
                value={webdavPassword}
                onChangeText={setWebdavPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  padding: 4,
                }}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={palette.muted}
                />
              </Pressable>
            </View>

            <Text style={styles.helperText}>
              💡 Credentials are stored in memory only for this session. You'll need to reconnect
              each time you open the app.
            </Text>
          </View>
        )}

        {/* Google Drive Info */}
        {selectedProvider === 'gdrive' && (
          <View>
            <Text style={styles.sectionTitle}>Google Drive Setup</Text>
            <Text style={styles.helperText}>
              📱 Tap "Connect" below to sign in with your Google account. We'll only access a
              private folder for this app - we can't see your other Drive files.
            </Text>
            <GapView style={{ height: 8 }} />
            <Text style={styles.helperText}>
              🔒 You can revoke access anytime in your Google Account settings.
            </Text>
          </View>
        )}

        <GapView style={{ height: 24 }} />

        {/* Action Buttons */}
        {!connected && selectedProvider && (
          <A11yPressable
            onPress={handleTestConnection}
            accessibilityRole="button"
            accessibilityLabel={
              selectedProvider === 'webdav' ? 'Test and connect to WebDAV' : 'Connect to Google Drive'
            }
            hitSlop={HIT_SLOP_8}
            style={styles.primaryButton}
            disabled={testing}
          >
            {testing ? (
              <Text style={styles.primaryButtonText}>⏳ Testing Connection...</Text>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color={palette.onPrimary} />
                <Text style={styles.primaryButtonText}>
                  {selectedProvider === 'webdav' ? 'Test & Connect' : 'Connect to Google Drive'}
                </Text>
              </>
            )}
          </A11yPressable>
        )}

        {connected && (
          <>
            {selectedProvider === 'gdrive' && (
              <A11yPressable
                onPress={async () => {
                  console.warn('[BYOC] Testing Google Drive file operations...');
                  try {
                    const { testGDriveConnection, saveToGDrive, loadFromGDrive } = await import('../../../services/gdrive');

                    // Test 1: Connection test
                    console.warn('[BYOC] Test 1: Testing connection...');
                    const connTest = await testGDriveConnection();
                    if (!connTest.ok) {
                      Alert.alert('Connection Test Failed', connTest.error || 'Unknown error');
                      return;
                    }
                    console.warn('[BYOC] ✓ Connection test passed');

                    // Test 2: Upload a test file
                    console.warn('[BYOC] Test 2: Uploading test file...');
                    const testData = 'Hello from EmpowrApp! Test timestamp: ' + new Date().toISOString();
                    const uploadSuccess = await saveToGDrive('/test-file.txt', testData, 'text/plain');
                    if (!uploadSuccess) {
                      Alert.alert('Upload Test Failed', 'Could not upload test file');
                      return;
                    }
                    console.warn('[BYOC] ✓ Upload test passed');

                    // Test 3: Download the test file
                    console.warn('[BYOC] Test 3: Downloading test file...');
                    const downloadedData = await loadFromGDrive('/test-file.txt');
                    if (!downloadedData) {
                      Alert.alert('Download Test Failed', 'Could not download test file');
                      return;
                    }
                    console.warn('[BYOC] ✓ Download test passed');

                    // Test 4: Verify contents
                    console.warn('[BYOC] Test 4: Verifying file contents...');
                    const downloadedText = typeof downloadedData === 'string'
                      ? downloadedData
                      : new TextDecoder().decode(downloadedData);

                    if (downloadedText === testData) {
                      console.warn('[BYOC] ✓ All tests passed!');
                      Alert.alert(
                        '✅ Google Drive Test Successful!',
                        `All tests passed:\n\n✓ Connection verified\n✓ File upload works\n✓ File download works\n✓ Data integrity confirmed\n\nYour Google Drive integration is fully functional!`,
                        [{ text: 'Great!' }]
                      );
                    } else {
                      Alert.alert(
                        '⚠️ Data Mismatch',
                        `File was uploaded and downloaded, but contents don't match.\n\nExpected: ${testData}\n\nGot: ${downloadedText}`,
                        [{ text: 'OK' }]
                      );
                    }
                  } catch (error) {
                    console.error('[BYOC] Test error:', error);
                    Alert.alert(
                      '❌ Test Failed',
                      error instanceof Error ? error.message : 'Unknown error during test',
                      [{ text: 'OK' }]
                    );
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="Test Google Drive connection and file operations"
                hitSlop={HIT_SLOP_8}
                style={[styles.primaryButton, { backgroundColor: palette.success, marginBottom: 12 }]}
              >
                <Ionicons name="checkmark-circle" size={20} color={palette.onPrimary} />
                <Text style={styles.primaryButtonText}>Test Google Drive</Text>
              </A11yPressable>
            )}

            <A11yPressable
              onPress={handleDisconnect}
              accessibilityRole="button"
              accessibilityLabel="Disconnect cloud storage"
              hitSlop={HIT_SLOP_8}
              style={[styles.primaryButton, { backgroundColor: palette.error }]}
            >
              <Ionicons name="cloud-offline" size={20} color={palette.onPrimary} />
              <Text style={styles.primaryButtonText}>Disconnect</Text>
            </A11yPressable>
          </>
        )}

        <GapView style={{ height: 32 }} />

        {/* Benefits Section */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>✨ Benefits of BYOC</Text>
          <GapView style={{ height: 12 }} />

          <BenefitRow
            icon="shield-checkmark"
            text="Complete data ownership - your data, your cloud"
            palette={palette}
          />
          <BenefitRow icon="lock-closed" text="Zero data on our servers" palette={palette} />
          <BenefitRow
            icon="sync"
            text="Access your data from any device with your cloud"
            palette={palette}
          />
          <BenefitRow
            icon="download"
            text="Easy to export - it's already in your cloud"
            palette={palette}
          />
          <BenefitRow icon="swap-horizontal" text="Switch providers anytime" palette={palette} />
          <BenefitRow icon="eye-off" text="Maximum privacy guaranteed" palette={palette} />
        </View>

        <GapView style={{ height: 24 }} />

        {/* Supported Providers */}
        <View style={styles.providersCard}>
          <Text style={styles.providersTitle}>🌐 Supported WebDAV Providers</Text>
          <GapView style={{ height: 8 }} />
          <Text style={styles.providerItem}>• Nextcloud (recommended)</Text>
          <Text style={styles.providerItem}>• ownCloud</Text>
          <Text style={styles.providerItem}>• Box.com</Text>
          <Text style={styles.providerItem}>• Any WebDAV-compatible server</Text>
          <GapView style={{ height: 12 }} />
          <Text style={styles.providersTitle}>🔐 OAuth Providers</Text>
          <GapView style={{ height: 8 }} />
          <Text style={styles.providerItem}>• Google Drive</Text>
          <Text style={styles.providerItem}>• More coming soon...</Text>
        </View>
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

function BenefitRow({
  icon,
  text,
  palette,
}: {
  icon: string;
  text: string;
  palette: ReturnType<typeof useAppPalette>;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <Ionicons name={icon as any} size={18} color={palette.success} style={{ marginRight: 10 }} />
      <Text style={{ fontSize: 14, color: palette.text, flex: 1 }}>{text}</Text>
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof useAppPalette>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: palette.background,
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
    },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: palette.primary + '20',
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    infoBannerText: {
      flex: 1,
      fontSize: 14,
      color: palette.text,
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 12,
    },
    providerGrid: {
      gap: 12,
    },
    providerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    providerCardSelected: {
      borderColor: palette.primary,
      backgroundColor: palette.primary + '10',
    },
    providerName: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    providerDesc: {
      fontSize: 13,
      color: palette.textSecondary,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 8,
      marginTop: 12,
    },
    input: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: palette.text,
      marginBottom: 4,
    },
    helperText: {
      fontSize: 13,
      color: palette.textSecondary,
      lineHeight: 18,
      marginTop: 8,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.primary,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      gap: 8,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.onPrimary,
    },
    benefitsCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
    },
    benefitsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    providersCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
    },
    providersTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    providerItem: {
      fontSize: 14,
      color: palette.textSecondary,
      marginBottom: 4,
    },
  });

