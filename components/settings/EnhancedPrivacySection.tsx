import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import AccessibilityToggle from '../../components/AccessibilityToggle';
import DataOwnershipStatement from '../../components/DataOwnershipStatement';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { useTranslation } from '../../i18n';
import { clearAllData, exportBackup, importBackup } from '../../services/backup';
import { isCloudConsentEnabled, setCloudConsent, setTelemetryConsent } from '../../services/consent';
import { getBYOCConfig, isStrictBYOC, setBYOCConfig, testBYOCConnection } from '../../services/dataPolicy';
import { runRetentionSweep } from '../../services/retention';
import { usePrivacy } from '../../store/privacy';
import { useSettings } from '../../store/settings';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';
import GapView from '../GapView';

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number = 1) {
  return StyleSheet.create({
    sectionSubtitle: { color:palette.text, fontSize:Math.round(14*factor), opacity:0.7, marginBottom:16, lineHeight:Math.round(20*factor) },
    description: { color:palette.text, fontSize:Math.round(14*factor), opacity:0.8, marginBottom:12, lineHeight:Math.round(20*factor) },
    buttonRow: { flexDirection:'row', flexWrap:'wrap' },
    button: { backgroundColor:palette.card, paddingHorizontal:16, paddingVertical:8, borderRadius:6, borderWidth:1, borderColor:palette.muted, minHeight:44, minWidth:60, alignItems:'center', justifyContent:'center' },
    buttonActive: { backgroundColor:palette.primary, borderColor:palette.primary },
    buttonText: { color:palette.text, fontSize:Math.round(14*factor), fontWeight:'500' },
    buttonTextActive: { color:palette.onPrimary },
    rowLabel: { color:palette.text, opacity:0.9, marginTop:10, marginBottom:6, fontSize:Math.round(14*factor) },
    input: { borderWidth:1, borderColor:palette.muted, padding:12, borderRadius:8, marginBottom:10, color:palette.text, fontSize:Math.round(14*factor), minHeight:44 },
    backupSection: { marginTop:16, padding:16, backgroundColor:palette.card, borderRadius:8, borderWidth:1, borderColor:palette.muted },
    backupButtons: { marginTop:16 },
    backupButton: { flexDirection:'row', alignItems:'center', justifyContent:'center', padding:12, borderWidth:1, borderColor:palette.primary, borderRadius:8, minHeight:44 },
    backupButtonText: { color:palette.primary, fontSize:Math.round(14*factor), fontWeight:'500', marginLeft:8 },
    dangerButton: { borderColor:palette.error },
    dangerButtonText: { color:palette.error },
  });
}

export default function EnhancedPrivacySection() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = React.useMemo(()=> createStyles(palette, factor), [palette, factor]);
  const { t } = useTranslation();
  const { state, setPasscode, setLockWellness, setErrorReportingEnabled } = usePrivacy();
  const { requirePasscodeOnLaunch, setRequirePasscodeOnLaunch, autoLockTimeout, setAutoLockTimeout, analyticsOptOut, setAnalyticsOptOut, saveSearchHistory, setSaveSearchHistory } = useSettings();
  const [cloudOn, setCloudOn] = React.useState<boolean>(isCloudConsentEnabled());
  const [cloudProvider, setCloudProvider] = React.useState<'firebase' | 'webdav' | 'none'>('firebase');
  
  React.useEffect(() => {
    // Load saved cloud provider preference
    const loadProvider = async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const saved = await AsyncStorage.getItem('empowr.cloud.provider');
        if (saved === 'webdav' || saved === 'firebase' || saved === 'none') {
          setCloudProvider(saved);
        }
      } catch {}
    };
    loadProvider();
  }, []);
  
  const handleCloudProviderChange = async (provider: 'firebase' | 'webdav' | 'none') => {
    setCloudProvider(provider);
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem('empowr.cloud.provider', provider);
      
      // Auto-disable cloud features if 'none' selected
      if (provider === 'none') {
        setCloudOn(false);
        setCloudConsent(false);
      }
    } catch {}
  };
  
  const onExport = async () => {
     const bundle = await exportBackup();
     if (!bundle) return Alert.alert('Export failed','Storage unavailable.');
     try {
       const FileSystemModule = await import('expo-file-system');
       const FS: any = FileSystemModule.default ?? FileSystemModule;
       const baseDir = FS.cacheDirectory ?? FS.documentDirectory;
       if (!baseDir) return Alert.alert('Export failed','No writable directory.');
       const path = baseDir + `empowr_backup_${Date.now()}.json`;
       await FS.writeAsStringAsync(path, JSON.stringify(bundle, null, 2));
       const Share = await import('expo-sharing');
       if (Share?.isAvailableAsync && (await Share.isAvailableAsync())) {
         await Share.shareAsync(path);
       } else {
         Alert.alert('Backup ready','Backup file saved to cache.');
       }
     } catch {
       Alert.alert('Export failed','Could not create file.');
     }
  };
  const onImport = async () => { try { const Doc = await import('expo-document-picker'); const res = await Doc.getDocumentAsync({ type:'application/json' }); if (res.canceled || !res.assets?.length) return; const uri = res.assets[0].uri; const FS = await import('expo-file-system'); const raw = await FS.readAsStringAsync(uri); const ok = await importBackup(JSON.parse(raw)); Alert.alert(ok? 'Imported':'Import failed', ok? 'Backup restored.':'Could not restore backup.'); } catch { Alert.alert('Import failed','Unable to read backup file.'); } };
  const onClear = async () => { Alert.alert('Clear All Data','This will permanently delete all your local app data. This cannot be undone. Are you sure?', [ { text:'Cancel', style:'cancel' }, { text:'Clear Data', style:'destructive', onPress: async()=> { const ok = await clearAllData(); Alert.alert(ok? 'Cleared':'Failed', ok? 'Local app data cleared.':'Unable to clear data.'); } } ] ); };
  const onRetention = async () => { try { const res = await runRetentionSweep(); Alert.alert('Prune complete', `Removed ${res.removed} items.`); } catch { Alert.alert('Prune complete','Done.'); } };

  // BYOC strict mode config (session-only)
  const strict = isStrictBYOC();
  const [endpoint, setEndpoint] = React.useState(getBYOCConfig()?.endpoint || '');
  const [username, setUsername] = React.useState(getBYOCConfig()?.username || '');
  const [password, setPassword] = React.useState('');
  const [probe, setProbe] = React.useState<null | { ok: boolean; status?: number }>(null);
  const onConnectBYOC = async () => {
    const cfg = { kind: 'webdav' as const, endpoint: endpoint.trim(), username: username.trim() || undefined, password: password || undefined };
    setBYOCConfig(cfg);
    const res = await testBYOCConnection(cfg);
    setProbe(res);
    Alert.alert(res.ok ? 'Connected' : 'Connection failed', res.ok ? 'Your personal storage is connected.' : `Status: ${res.status ?? 'error'}`);
  };
  const onClearBYOC = () => { setBYOCConfig(null); setProbe(null); setEndpoint(''); setUsername(''); setPassword(''); Alert.alert('Cleared','BYOC session cleared.'); };

  return (
    <View>
      {/* Data Ownership Statement */}
      <View style={s.backupSection}>
        <Text style={s.sectionSubtitle} accessibilityRole='header'>Data Ownership & Security</Text>
        <Text style={s.description}>
          Your data belongs 100% to you. 3mpwr App is built on the fundamental principle of complete user data sovereignty.
        </Text>
        <DataOwnershipStatement compact={true} showHeader={false} style={{ marginTop: 8 }} />
      </View>

      <AccessibilityToggle title={t('settings.privacy.passcode','Require Passcode on Launch')} description={t('settings.privacy.passcodeDesc','Lock app with passcode')} value={requirePasscodeOnLaunch} onValueChange={setRequirePasscodeOnLaunch} icon='lock-closed' testID='passcode-toggle' />
      <View style={{ marginTop:8, marginBottom:8 }}>
        <Text style={s.sectionSubtitle} accessibilityRole='header'>{t('settings.privacy.autoLock','Auto-Lock Timeout')}</Text>
        <Text style={s.description}>{t('settings.privacy.autoLockDesc','Minutes before app locks')}</Text>
        <GapView style={s.buttonRow} gap={8}>
          {[1,5,15,30].map(m => (
            <A11yPressable key={m} style={[s.button, autoLockTimeout === m && s.buttonActive]} onPress={()=> setAutoLockTimeout(m)} accessibilityRole='button' accessibilityState={{ selected: autoLockTimeout === m }} accessibilityLabel={`Set auto-lock to ${m} minutes`} hitSlop={HIT_SLOP_8}>
              <Text style={[s.buttonText, autoLockTimeout === m && s.buttonTextActive]}>{m}m</Text>
            </A11yPressable>
          ))}
        </GapView>
      </View>
  <AccessibilityToggle title={t('settings.privacy.analytics','Opt Out of Analytics')} description={t('settings.privacy.analyticsDesc',"Don't share usage data")} value={analyticsOptOut} onValueChange={(v)=>{ setAnalyticsOptOut(v); try { setTelemetryConsent(!v); } catch {} }} icon='analytics' testID='analytics-toggle' />
  <AccessibilityToggle title='Cloud Features (Chat & Sync)' description='Allow optional cloud features like community chat and device tokens' value={cloudOn} onValueChange={(v)=>{ setCloudOn(!!v); try { setCloudConsent(!!v); } catch {} }} icon='cloud-outline' testID='cloud-consent-toggle' />
      
      {/* Cloud Provider Selection */}
      {cloudOn && (
        <View style={{ marginTop: 16, marginBottom: 8 }}>
          <Text style={s.sectionSubtitle} accessibilityRole='header'>🔒 Bring Your Own Cloud (BYOC)</Text>
          <Text style={[s.description, { fontWeight: '600', marginBottom: 8 }]}>
            ⚠️ IMPORTANT: You must use YOUR OWN cloud storage. 3mpwr does NOT provide cloud storage.
          </Text>
          <Text style={s.description}>
            Choose where YOUR data is stored. All options require your own accounts/servers. Your data will NEVER be stored on 3mpwr servers.
          </Text>
          <GapView style={s.buttonRow} gap={8}>
            <A11yPressable 
              style={[s.button, { flex: 1 }, cloudProvider === 'firebase' && s.buttonActive]} 
              onPress={() => handleCloudProviderChange('firebase')} 
              accessibilityRole='button' 
              accessibilityState={{ selected: cloudProvider === 'firebase' }}
              accessibilityLabel='Use your own Firebase project for cloud storage - not 3mpwr Firebase'
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name='flame' size={18} color={cloudProvider === 'firebase' ? palette.onPrimary : palette.text} />
              <Text style={[s.buttonText, cloudProvider === 'firebase' && s.buttonTextActive, { marginTop: 4 }]}>Firebase</Text>
              <Text style={[{ fontSize: 10, opacity: 0.7, textAlign: 'center', marginTop: 2 }, cloudProvider === 'firebase' && { color: palette.onPrimary }]}>YOUR Project</Text>
            </A11yPressable>
            
            <A11yPressable 
              style={[s.button, { flex: 1 }, cloudProvider === 'webdav' && s.buttonActive]} 
              onPress={() => handleCloudProviderChange('webdav')} 
              accessibilityRole='button' 
              accessibilityState={{ selected: cloudProvider === 'webdav' }}
              accessibilityLabel='Use your personal WebDAV storage (Nextcloud, ownCloud, etc.)'
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name='cloud' size={18} color={cloudProvider === 'webdav' ? palette.onPrimary : palette.text} />
              <Text style={[s.buttonText, cloudProvider === 'webdav' && s.buttonTextActive, { marginTop: 4 }]}>WebDAV</Text>
              <Text style={[{ fontSize: 10, opacity: 0.7, textAlign: 'center', marginTop: 2 }, cloudProvider === 'webdav' && { color: palette.onPrimary }]}>Your Server</Text>
            </A11yPressable>
            
            <A11yPressable 
              style={[s.button, { flex: 1 }, cloudProvider === 'none' && s.buttonActive]} 
              onPress={() => handleCloudProviderChange('none')} 
              accessibilityRole='button' 
              accessibilityState={{ selected: cloudProvider === 'none' }}
              accessibilityLabel='No cloud storage - local only'
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name='phone-portrait' size={18} color={cloudProvider === 'none' ? palette.onPrimary : palette.text} />
              <Text style={[s.buttonText, cloudProvider === 'none' && s.buttonTextActive, { marginTop: 4 }]}>Local Only</Text>
              <Text style={[{ fontSize: 10, opacity: 0.7, textAlign: 'center', marginTop: 2 }, cloudProvider === 'none' && { color: palette.onPrimary }]}>No Cloud</Text>
            </A11yPressable>
          </GapView>
          
          {/* Provider-specific information */}
          {cloudProvider === 'firebase' && (
            <View style={{ marginTop: 12, padding: 12, backgroundColor: palette.card, borderRadius: 8, borderWidth: 1, borderColor: palette.warning || palette.primary }}>
              <Text style={[s.description, { marginBottom: 8, fontWeight: '700' }]}>
                <Ionicons name='warning' size={16} color={palette.warning || palette.primary} /> IMPORTANT: Use YOUR OWN Firebase Project
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
                accessibilityRole='button'
                accessibilityLabel='View Firebase setup requirements'
                hitSlop={HIT_SLOP_8}
              >
                <Text style={{ color: palette.onPrimary, fontSize: 12, fontWeight: '600' }}>
                  📖 View Setup Guide
                </Text>
              </A11yPressable>
            </View>
          )}
          
          {cloudProvider === 'webdav' && (
            <View style={{ marginTop: 12, padding: 12, backgroundColor: palette.card, borderRadius: 8, borderWidth: 1, borderColor: palette.muted }}>
              <Text style={[s.description, { marginBottom: 8 }]}>
                <Ionicons name='information-circle' size={16} color={palette.primary} /> Using WebDAV (Your Server)
              </Text>
              <Text style={[s.description, { fontSize: 12, opacity: 0.9, marginBottom: 8 }]}>
                • Store data on YOUR personal server{'\n'}
                • Compatible with Nextcloud, ownCloud, etc.{'\n'}
                • Complete control over data location{'\n'}
                • Configure connection details below
              </Text>
            </View>
          )}
          
          {cloudProvider === 'none' && (
            <View style={{ marginTop: 12, padding: 12, backgroundColor: palette.card, borderRadius: 8, borderWidth: 1, borderColor: palette.warning || palette.muted }}>
              <Text style={[s.description, { marginBottom: 8 }]}>
                <Ionicons name='warning' size={16} color={palette.warning || palette.text} /> Local Storage Only
              </Text>
              <Text style={[s.description, { fontSize: 12, opacity: 0.9, marginBottom: 0 }]}>
                • All data stored on this device only{'\n'}
                • No cloud backup or sync{'\n'}
                • Data lost if device is lost/reset{'\n'}
                • Most private option (offline-first)
              </Text>
            </View>
          )}
        </View>
      )}
      
      <AccessibilityToggle 
        title='Error Reporting' 
        description='Help improve the app by sharing crash reports' 
        value={state.errorReportingEnabled ?? false} 
        onValueChange={async (v) => {
          try {
            await setErrorReportingEnabled(v);
          } catch (error) {
            console.error('Error toggling crash reporting:', error);
            Alert.alert(
              'Error',
              'Could not change error reporting setting. The app will continue to work normally.',
              [{ text: 'OK' }]
            );
          }
        }} 
        icon='bug' 
        testID='error-reporting-toggle' 
      />
      <AccessibilityToggle title='Save Search History' description='Remember your searches for quick access and autocomplete' value={saveSearchHistory} onValueChange={setSaveSearchHistory} icon='search' testID='search-history-toggle' />
      <View style={s.backupSection}>
        <Text style={s.sectionSubtitle} accessibilityRole='header'>Data Management</Text>
        {(strict || cloudProvider === 'webdav') && (
          <View style={{ marginBottom:16 }}>
            <Text style={[s.description, { marginBottom:8 }]}>
              {strict 
                ? 'Strict mode is ON: 100% user-owned storage. App/server storage is disabled.' 
                : 'WebDAV Storage: Connect your personal cloud storage (Nextcloud, ownCloud, etc.)'}
            </Text>
            <Text style={s.rowLabel}>WebDAV Endpoint</Text>
            <TextInput style={s.input} placeholder='https://dav.example.com/remote.php/dav/files/username/' value={endpoint} onChangeText={setEndpoint} autoCapitalize='none' autoCorrect={false} keyboardType='url' accessibilityLabel='WebDAV endpoint' />
            <Text style={s.rowLabel}>Username (optional)</Text>
            <TextInput style={s.input} placeholder='Username' value={username} onChangeText={setUsername} autoCapitalize='none' autoCorrect={false} accessibilityLabel='WebDAV username' />
            <Text style={s.rowLabel}>Password (optional)</Text>
            <TextInput style={s.input} placeholder='Password' value={password} onChangeText={setPassword} secureTextEntry={true} accessibilityLabel='WebDAV password' />
            <GapView style={s.buttonRow} gap={8}>
              <A11yPressable style={s.backupButton} onPress={onConnectBYOC} accessibilityRole='button' accessibilityLabel='Connect personal storage' hitSlop={HIT_SLOP_8}><Ionicons name='cloud-done' size={16} color={palette.primary} /><Text style={s.backupButtonText}>Connect Storage</Text></A11yPressable>
              <A11yPressable style={[s.backupButton, s.dangerButton]} onPress={onClearBYOC} accessibilityRole='button' accessibilityLabel='Clear storage session' hitSlop={HIT_SLOP_8}><Ionicons name='close' size={16} color={palette.error} /><Text style={[s.backupButtonText, s.dangerButtonText]}>Clear Session</Text></A11yPressable>
            </GapView>
            {probe && (<Text style={[s.description, { marginTop:8 }]}>Connection: {probe.ok ? 'OK' : 'Failed'}{typeof probe.status==='number' ? ` (HTTP ${probe.status})` : ''}</Text>)}
          </View>
        )}
        <View style={{ marginBottom:16 }}>
          <Text style={s.rowLabel}>Set/Change Passcode</Text>
          <TextInput style={s.input} placeholder='New passcode' secureTextEntry={true} onSubmitEditing={(e)=> setPasscode(e.nativeEvent.text || undefined)} accessibilityLabel='New passcode' accessibilityHint='Enter a new passcode for the app' />
        </View>
        <AccessibilityToggle title='Wellness Lock' description='Require passcode to access wellness features' value={state.lockWellness ?? false} onValueChange={setLockWellness} icon='heart-outline' testID='wellness-lock-toggle' />
        <GapView style={s.backupButtons} gap={8}>
          <A11yPressable style={s.backupButton} onPress={onExport} accessibilityRole='button' accessibilityLabel='Export backup' hitSlop={HIT_SLOP_8}><Ionicons name='download' size={16} color={palette.primary} /><Text style={s.backupButtonText}>Export Backup</Text></A11yPressable>
          <A11yPressable style={s.backupButton} onPress={onImport} accessibilityRole='button' accessibilityLabel='Import backup' hitSlop={HIT_SLOP_8}><Ionicons name='cloud-upload' size={16} color={palette.primary} /><Text style={s.backupButtonText}>Import Backup</Text></A11yPressable>
          <A11yPressable style={[s.backupButton, s.dangerButton]} onPress={onClear} accessibilityRole='button' accessibilityLabel='Clear all data' hitSlop={HIT_SLOP_8}><Ionicons name='trash' size={16} color={palette.error} /><Text style={[s.backupButtonText, s.dangerButtonText]}>Clear All Data</Text></A11yPressable>
          <A11yPressable style={s.backupButton} onPress={onRetention} accessibilityRole='button' accessibilityLabel='Run retention sweep' hitSlop={HIT_SLOP_8}><Ionicons name='time-outline' size={16} color={palette.primary} /><Text style={s.backupButtonText}>Prune Old Cache</Text></A11yPressable>
        </GapView>
      </View>
    </View>
  );
}
