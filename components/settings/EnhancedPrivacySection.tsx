import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import AccessibilityToggle from '../../../components/AccessibilityToggle';
import DataOwnershipStatement from '../../../components/DataOwnershipStatement';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { clearAllData, exportBackup, importBackup } from '../../../services/backup';
import { isCloudConsentEnabled, setCloudConsent, setTelemetryConsent } from '../../../services/consent';
import { getBYOCConfig, isStrictBYOC, setBYOCConfig, testBYOCConnection } from '../../../services/dataPolicy';
import { runRetentionSweep } from '../../../services/retention';
import { usePrivacy } from '../../../store/privacy';
import { useSettings } from '../../../store/settings';
import { useTextScale } from '../../../theme/typography';
import { useAppPalette } from '../../../theme/usePalette';

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number = 1) {
  return StyleSheet.create({
    sectionSubtitle: { color:palette.text, fontSize:Math.round(14*factor), opacity:0.7, marginBottom:16, lineHeight:Math.round(20*factor) },
    description: { color:palette.text, fontSize:Math.round(14*factor), opacity:0.8, marginBottom:12, lineHeight:Math.round(20*factor) },
    buttonRow: { flexDirection:'row', gap:8, flexWrap:'wrap' },
    button: { backgroundColor:palette.card, paddingHorizontal:16, paddingVertical:8, borderRadius:6, borderWidth:1, borderColor:palette.muted, minHeight:44, minWidth:60, alignItems:'center', justifyContent:'center' },
    buttonActive: { backgroundColor:palette.primary, borderColor:palette.primary },
    buttonText: { color:palette.text, fontSize:Math.round(14*factor), fontWeight:'500' },
    buttonTextActive: { color:palette.onPrimary },
    rowLabel: { color:palette.text, opacity:0.9, marginTop:10, marginBottom:6, fontSize:Math.round(14*factor) },
    input: { borderWidth:1, borderColor:palette.muted, padding:12, borderRadius:8, marginBottom:10, color:palette.text, fontSize:Math.round(14*factor), minHeight:44 },
    backupSection: { marginTop:16, padding:16, backgroundColor:palette.card, borderRadius:8, borderWidth:1, borderColor:palette.muted },
    backupButtons: { marginTop:16, gap:8 },
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
        <DataOwnershipStatement compact showHeader={false} style={{ marginTop: 8 }} />
      </View>

      <AccessibilityToggle title={t('settings.privacy.passcode','Require Passcode on Launch')} description={t('settings.privacy.passcodeDesc','Lock app with passcode')} value={requirePasscodeOnLaunch} onValueChange={setRequirePasscodeOnLaunch} icon='lock-closed' testID='passcode-toggle' />
      <View style={{ marginTop:8, marginBottom:8 }}>
        <Text style={s.sectionSubtitle} accessibilityRole='header'>{t('settings.privacy.autoLock','Auto-Lock Timeout')}</Text>
        <Text style={s.description}>{t('settings.privacy.autoLockDesc','Minutes before app locks')}</Text>
        <View style={s.buttonRow}>
          {[1,5,15,30].map(m => (
            <A11yPressable key={m} style={[s.button, autoLockTimeout === m && s.buttonActive]} onPress={()=> setAutoLockTimeout(m)} accessibilityRole='button' accessibilityState={{ selected: autoLockTimeout === m }} accessibilityLabel={`Set auto-lock to ${m} minutes`} hitSlop={HIT_SLOP_8}>
              <Text style={[s.buttonText, autoLockTimeout === m && s.buttonTextActive]}>{m}m</Text>
            </A11yPressable>
          ))}
        </View>
      </View>
  <AccessibilityToggle title={t('settings.privacy.analytics','Opt Out of Analytics')} description={t('settings.privacy.analyticsDesc',"Don't share usage data")} value={analyticsOptOut} onValueChange={(v)=>{ setAnalyticsOptOut(v); try { setTelemetryConsent(!v); } catch {} }} icon='analytics' testID='analytics-toggle' />
  <AccessibilityToggle title='Cloud Features (Chat & Sync)' description='Allow optional cloud features like community chat and device tokens' value={cloudOn} onValueChange={(v)=>{ setCloudOn(!!v); try { setCloudConsent(!!v); } catch {} }} icon='cloud-outline' testID='cloud-consent-toggle' />
      <AccessibilityToggle title='Error Reporting' description='Help improve the app by sharing crash reports' value={state.errorReportingEnabled ?? false} onValueChange={setErrorReportingEnabled} icon='bug' testID='error-reporting-toggle' />
      <AccessibilityToggle title='Save Search History' description='Remember your searches for quick access and autocomplete' value={saveSearchHistory} onValueChange={setSaveSearchHistory} icon='search' testID='search-history-toggle' />
      <View style={s.backupSection}>
        <Text style={s.sectionSubtitle} accessibilityRole='header'>Data Management</Text>
        {strict && (
          <View style={{ marginBottom:16 }}>
            <Text style={[s.description, { marginBottom:8 }]}>Strict mode is ON: 100% user-owned storage. App/server storage is disabled.</Text>
            <Text style={s.rowLabel}>WebDAV Endpoint</Text>
            <TextInput style={s.input} placeholder='https://dav.example.com/remote.php/dav/files/username/' value={endpoint} onChangeText={setEndpoint} autoCapitalize='none' autoCorrect={false} keyboardType='url' accessibilityLabel='WebDAV endpoint' />
            <Text style={s.rowLabel}>Username (optional)</Text>
            <TextInput style={s.input} placeholder='Username' value={username} onChangeText={setUsername} autoCapitalize='none' autoCorrect={false} accessibilityLabel='WebDAV username' />
            <Text style={s.rowLabel}>Password (optional)</Text>
            <TextInput style={s.input} placeholder='Password' value={password} onChangeText={setPassword} secureTextEntry accessibilityLabel='WebDAV password' />
            <View style={s.buttonRow}>
              <A11yPressable style={s.backupButton} onPress={onConnectBYOC} accessibilityRole='button' accessibilityLabel='Connect personal storage' hitSlop={HIT_SLOP_8}><Ionicons name='cloud-done' size={16} color={palette.primary} /><Text style={s.backupButtonText}>Connect Storage</Text></A11yPressable>
              <A11yPressable style={[s.backupButton, s.dangerButton]} onPress={onClearBYOC} accessibilityRole='button' accessibilityLabel='Clear storage session' hitSlop={HIT_SLOP_8}><Ionicons name='close' size={16} color={palette.error} /><Text style={[s.backupButtonText, s.dangerButtonText]}>Clear Session</Text></A11yPressable>
            </View>
            {probe && (<Text style={[s.description, { marginTop:8 }]}>Connection: {probe.ok ? 'OK' : 'Failed'}{typeof probe.status==='number' ? ` (HTTP ${probe.status})` : ''}</Text>)}
          </View>
        )}
        <View style={{ marginBottom:16 }}>
          <Text style={s.rowLabel}>Set/Change Passcode</Text>
          <TextInput style={s.input} placeholder='New passcode' secureTextEntry onSubmitEditing={(e)=> setPasscode(e.nativeEvent.text || undefined)} accessibilityLabel='New passcode' accessibilityHint='Enter a new passcode for the app' />
        </View>
        <AccessibilityToggle title='Wellness Lock' description='Require passcode to access wellness features' value={state.lockWellness ?? false} onValueChange={setLockWellness} icon='heart-outline' testID='wellness-lock-toggle' />
        <View style={s.backupButtons}>
          <A11yPressable style={s.backupButton} onPress={onExport} accessibilityRole='button' accessibilityLabel='Export backup' hitSlop={HIT_SLOP_8}><Ionicons name='download' size={16} color={palette.primary} /><Text style={s.backupButtonText}>Export Backup</Text></A11yPressable>
          <A11yPressable style={s.backupButton} onPress={onImport} accessibilityRole='button' accessibilityLabel='Import backup' hitSlop={HIT_SLOP_8}><Ionicons name='cloud-upload' size={16} color={palette.primary} /><Text style={s.backupButtonText}>Import Backup</Text></A11yPressable>
          <A11yPressable style={[s.backupButton, s.dangerButton]} onPress={onClear} accessibilityRole='button' accessibilityLabel='Clear all data' hitSlop={HIT_SLOP_8}><Ionicons name='trash' size={16} color={palette.error} /><Text style={[s.backupButtonText, s.dangerButtonText]}>Clear All Data</Text></A11yPressable>
          <A11yPressable style={s.backupButton} onPress={onRetention} accessibilityRole='button' accessibilityLabel='Run retention sweep' hitSlop={HIT_SLOP_8}><Ionicons name='time-outline' size={16} color={palette.primary} /><Text style={s.backupButtonText}>Prune Old Cache</Text></A11yPressable>
        </View>
      </View>
    </View>
  );
}
