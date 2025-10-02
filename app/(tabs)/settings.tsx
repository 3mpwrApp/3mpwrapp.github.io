// Settings Screen – fully reconstructed (v2)
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useLocalSearchParams } from 'expo-router';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Image, Linking, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { a11yLiveRegion } from '../../utils/platform';
import A11yPressable from '../../components/A11yPressable';
import AccessibilityToggle from '../../components/AccessibilityToggle';
import EmergencyWalletCard from '../../components/EmergencyWalletCard';
import LanguageSelector from '../../components/LanguageSelector';
import NotificationPreferences from '../../components/NotificationPreferences';
import { HIT_SLOP_8 } from '../../constants/a11y';
import { useAuth } from '../../context/AuthContext';
import { auth, db, storage } from '../../firebase/config';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { clearAllData, exportBackup, importBackup } from '../../services/backup';
import { useBookmarks } from '../../store/bookmarks';
import { useNetwork } from '../../store/network';
import { usePrivacy } from '../../store/privacy';
import { useProfileLocal } from '../../store/profileLocal';
import type { ResourceFormat, TextScale } from '../../store/settings';
import { useSettings } from '../../store/settings';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

export default function SettingsScreen() {
  const params = useLocalSearchParams<{ open?: string }>();
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = useRef<Text>(null);
  const { user, isGuest } = useAuth();
  const { setOffline } = useNetwork();
  useAnnounceOnMount(t('settings.title', 'Settings'));
  useFocusOnRefOnMount(titleRef);

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [showEmergencyCard, setShowEmergencyCard] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [hasPasswordProvider, setHasPasswordProvider] = useState(false);
  // Removed unused isAnonymous state (previously tracked anonymous account status)
  const [providerList, setProviderList] = useState<string[]>([]);

  useEffect(() => { if (!user) return; (async () => {
    try { const snap = await getDoc(doc(db, 'users', user.uid)); if (snap.exists()) { const p = snap.data() as any; setDisplayName(p.displayName || ''); setPhotoURL(p.photoURL || null); } }
    catch (e:any) { const msg = String(e?.message||''); if (msg.toLowerCase().includes('offline')) setOffline(true); else console.error(msg); }
  })(); }, [user]);

  useEffect(() => {
    if (typeof params?.open === 'string' && params.open.toLowerCase() === 'emergencycard') {
      setShowEmergencyCard(true);
    }
  }, [params?.open]);

  const handleUpdateDisplayName = async () => { if (!user) return; try { await updateDoc(doc(db,'users',user.uid), { displayName }); Alert.alert(t('common.success','Success'), t('settings.account.updatedName','Display name updated')); } catch(e:any){ Alert.alert(t('common.error','Error'), e?.message||'Failed'); } };

  const handleUploadPhoto = async () => { if (!user) return; try { const ImagePicker = await import('expo-image-picker'); const result: any = await ImagePicker.launchImageLibraryAsync({ allowsEditing:true, aspect:[1,1], quality:0.7 }); if (result.canceled) return; const img = await fetch(result.assets[0].uri); const blob = await img.blob(); const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`); await uploadBytes(storageRef, blob); const url = await getDownloadURL(storageRef); await updateDoc(doc(db,'users',user.uid), { photoURL:url }); setPhotoURL(url); Alert.alert(t('common.success','Success'), t('settings.account.photoUpdated','Profile picture updated')); } catch(e:any){ Alert.alert(t('common.error','Error'), e?.message||'Upload failed'); } };

  const beginDelete = () => {
    if (!user) return;
    const providers = user.providerData.map(p => p.providerId);
    setProviderList(providers);
    setHasPasswordProvider(providers.includes('password'));
  // Anonymous status no longer tracked locally (removed isAnonymous state)
    setDeleteMode(true);
  };
  const cancelDelete = () => { setDeleteMode(false); setPassword(''); };
  const confirmDelete = async () => { if (!user?.email) return; const { trackEvent } = require('../../services/analyticsClient'); setDeleting(true); try { const cred = EmailAuthProvider.credential(user.email, password); await reauthenticateWithCredential(user, cred); await deleteUser(user); trackEvent('account_delete', { method: 'password' }); Alert.alert(t('settings.account.deleted','Account deleted')); setDeleteMode(false); } catch(e:any){ trackEvent('account_delete_failed', { code: e?.code || 'error', message: e?.message }); Alert.alert(t('settings.account.reauthFailed','Re-authentication failed'), e?.message||'Error'); } finally { setDeleting(false); } };

  // Removed standalone emergency card navigation: now embedded below.

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding:20 }} accessibilityLabel={t('settings.title','Settings screen')}>
      <Text ref={titleRef} accessibilityRole='header' style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('settings.title','Settings')}</Text>
      <Section title={t('settings.accessibility.title','Accessibility')} subtitle={t('settings.accessibility.subtitle','Make the app work better for you')} styles={styles}><EnhancedA11ySettingsSection /></Section>
      <LanguageSelector />
      <NotificationPreferences />
      <Section title={t('settings.emergencyWallet.title','Emergency Wallet Card')} subtitle={t('settings.emergencyWallet.subtitle','Store key medical and emergency contact information locally')} styles={styles}>
        <A11yPressable
          onPress={() => setShowEmergencyCard(v => !v)}
          accessibilityRole='button'
          accessibilityLabel={showEmergencyCard ? t('settings.emergencyWallet.hide','Hide emergency wallet card form') : t('settings.emergencyWallet.show','Show emergency wallet card form')}
          hitSlop={HIT_SLOP_8}
          style={[styles.linkButton, { justifyContent:'center', marginBottom:12 }]}
        >
          <Ionicons name='medical' size={20} color={palette.primary} />
          <Text style={styles.linkText}>{showEmergencyCard ? t('common.hide','Hide') : t('common.show','Show')}</Text>
        </A11yPressable>
        {showEmergencyCard && <EmergencyWalletCard />}
      </Section>
      <Section title={t('settings.bookmarks.title','Bookmarks')} subtitle={t('settings.bookmarks.subtitle','Save quick links to app features')} styles={styles}><BookmarksSection /></Section>
      <Section title={t('settings.account.title','Account Management')} subtitle={t('settings.account.subtitle','Manage your profile and preferences')} styles={styles}>
        {isGuest && (
          <View style={{ marginBottom:16 }}>
            <Text style={[styles.description, { marginBottom:8 }]}>{t('settings.account.guestNotice','You are browsing as a guest. Create an account to sync data across devices and enable full features.')}</Text>
            <Link href={'/(auth)/register' as any} asChild>
              <A11yPressable style={[styles.linkButton,{ justifyContent:'center' }]} accessibilityRole='button' accessibilityLabel={t('settings.account.createAccount','Create Account')} hitSlop={HIT_SLOP_8}>
                <Ionicons name='person-add' size={20} color={palette.primary} />
                <Text style={styles.linkText}>{t('settings.account.createAccount','Create Account')}</Text>
              </A11yPressable>
            </Link>
          </View>
        )}
        {!isGuest && (
          <>
            {photoURL ? <Image source={{ uri: photoURL }} style={styles.avatar} accessibilityLabel={t('settings.account.photo','Profile picture')} /> : <View style={styles.avatarPlaceholder}><Ionicons name='person' size={40} color={palette.text} /></View>}
            <Button title={t('settings.account.changePhoto','Change Profile Picture')} onPress={handleUploadPhoto} />
            <Text style={styles.rowLabel}>{t('settings.account.displayName','Display Name')}</Text>
            <TextInput style={styles.input} placeholder={t('settings.account.displayNamePlaceholder','Enter display name')} value={displayName} onChangeText={setDisplayName} accessibilityLabel={t('settings.account.displayName','Display Name')} />
            <Button title={t('settings.account.updateName','Update Name')} onPress={handleUpdateDisplayName} />
          </>
        )}
        {user && !isGuest && (
          <View style={{ marginTop:10 }}>
            {user.email && hasPasswordProvider && (
              <Button title={t('settings.account.resetPassword','Send Password Reset Email')} onPress={async()=>{ try{ await sendPasswordResetEmail(auth, user.email!); Alert.alert(t('settings.account.resetPasswordSent','Email Sent'), t('settings.account.resetPasswordSentDesc','Check your inbox for reset instructions.')); } catch(e:any){ Alert.alert(t('settings.account.resetPasswordFailed','Reset Failed'), e?.message||'Error'); } }} />
            )}
            <View style={{ height:8 }} />
            {!deleteMode && <Button color={palette.error} title={t('settings.account.delete','Delete Account')} onPress={beginDelete} />}
            {deleteMode && (
              <View style={styles.deletePanel}>
                {hasPasswordProvider ? (
                  <>
                    <Text style={{ color:palette.error, fontWeight:'600', marginBottom:8 }}>{t('settings.account.deleteConfirmPasswordTitle','Confirm Deletion')}</Text>
                    <Text style={{ color:palette.text, opacity:0.8, marginBottom:8 }}>{t('settings.account.deleteConfirmPasswordBody','Enter your password to permanently delete your account.')}</Text>
                    <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder={t('settings.account.passwordPlaceholder','Password')} accessibilityLabel={t('settings.account.passwordPlaceholder','Password')} />
                    <View style={{ flexDirection:'row', gap:8 }}>
                      <A11yPressable hitSlop={HIT_SLOP_8} style={[styles.deleteBtn,{ backgroundColor:palette.error }]} onPress={confirmDelete} disabled={deleting || !password} accessibilityRole='button' accessibilityLabel={t('settings.account.confirmDelete','Confirm account deletion')}>
                        <Text style={{ color:palette.onPrimary, fontWeight:'700' }}>{deleting? t('common.working','Working...') : t('settings.account.confirmDelete','Confirm Delete')}</Text>
                      </A11yPressable>
                      <A11yPressable hitSlop={HIT_SLOP_8} style={[styles.deleteBtn,{ borderWidth:1, borderColor:palette.muted }]} onPress={cancelDelete} accessibilityRole='button' accessibilityLabel={t('common.cancel','Cancel')}>
                        <Text style={{ color:palette.text, fontWeight:'600' }}>{t('common.cancel','Cancel')}</Text>
                      </A11yPressable>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={{ color:palette.error, fontWeight:'600', marginBottom:8 }}>{t('settings.account.deleteConfirmPasswordTitle','Confirm Deletion')}</Text>
                    <Text style={{ color:palette.text, opacity:0.8, marginBottom:12 }}>
                      {t('settings.account.deleteNoPassword','This account uses a third-party sign-in method. Sign in again with your provider (e.g. Google/Apple) recently, then press Continue to delete.')}
                    </Text>
                    <View style={{ flexDirection:'row', gap:8 }}>
                      <A11yPressable hitSlop={HIT_SLOP_8} style={[styles.deleteBtn,{ backgroundColor:palette.error }]} onPress={confirmDelete} disabled={deleting} accessibilityRole='button' accessibilityLabel={t('settings.account.confirmDelete','Confirm account deletion')}>
                        <Text style={{ color:palette.onPrimary, fontWeight:'700' }}>{deleting? t('common.working','Working...') : t('settings.account.confirmDelete','Confirm Delete')}</Text>
                      </A11yPressable>
                      <A11yPressable hitSlop={HIT_SLOP_8} style={[styles.deleteBtn,{ borderWidth:1, borderColor:palette.muted }]} onPress={cancelDelete} accessibilityRole='button' accessibilityLabel={t('common.cancel','Cancel')}>
                        <Text style={{ color:palette.text, fontWeight:'600' }}>{t('common.cancel','Cancel')}</Text>
                      </A11yPressable>
                    </View>
                    {!!providerList.length && <Text style={{ color:palette.text, opacity:0.6, marginTop:8, fontSize:12 }}>Providers: {providerList.join(', ')}</Text>}
                  </>
                )}
              </View>
            )}
          </View>
        )}
      </Section>
      <Section title={t('settings.emergency.title','Emergency Wallet Card')} subtitle={t('settings.emergency.subtitle','Quick access to important information')} styles={styles}>
        <Text style={styles.description}>{t('settings.emergency.description','Create a digital emergency card with your key information for quick access when needed')}</Text>
        <A11yPressable style={styles.emergencyButton} onPress={()=> setShowEmergencyCard(true)} accessibilityRole='button' accessibilityLabel={t('settings.emergency.openLabel','Open emergency wallet card')} hitSlop={HIT_SLOP_8}>
          <Ionicons name='medical' size={20} color='white' />
          <Text style={styles.emergencyButtonText}>{t('settings.emergency.manage','Manage Emergency Card')}</Text>
        </A11yPressable>
      </Section>
      <Section title='Local Profile (for templates)' styles={styles}><LocalProfileSection /></Section>
      <Section title='Wellness Preferences' styles={styles}><WellnessPrefsSection /></Section>
      <Section title='Media & Locker' styles={styles}><MediaLockerSection /></Section>
      <Section title={t('settings.privacy.title','Privacy & Security')} subtitle={t('settings.privacy.subtitle','Control your data and security')} styles={styles}><EnhancedPrivacySection /></Section>
      <Section title='Terms & Policies' styles={styles}><TermsSection /></Section>
  {user && <Section title='Admin' styles={styles}><AdminSection /></Section>}
    </ScrollView>
  );
}

function EnhancedA11ySettingsSection() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const { textScale, setTextScale, resourcePreferredFormat, setResourcePreferredFormat } = useSettings();
  const { dyslexiaFriendly, setDyslexiaFriendly, plainLanguage, setPlainLanguage, captionsPreferred, setCaptionsPreferred, voiceMode, setVoiceMode, showAssistantPill = true, setShowAssistantPill, assistantPillPosition = 'left', setAssistantPillPosition } = useSettings();
  const ScaleButton = ({ label, value }: { label: string; value: TextScale }) => (
    <A11yPressable accessibilityRole='button' accessibilityState={{ selected: textScale === value }} onPress={() => setTextScale(value)} style={[styles.button, textScale === value && styles.buttonActive]} hitSlop={HIT_SLOP_8}>
      <Text style={[styles.buttonText, textScale === value && styles.buttonTextActive]}>{label}</Text>
    </A11yPressable>
  );
  const FormatButton = ({ label, value }: { label: string; value: ResourceFormat }) => (
    <A11yPressable accessibilityRole='button' accessibilityState={{ selected: resourcePreferredFormat === value }} onPress={() => setResourcePreferredFormat(value)} style={[styles.button, resourcePreferredFormat === value && styles.buttonActive]} hitSlop={HIT_SLOP_8}>
      <Text style={[styles.buttonText, resourcePreferredFormat === value && styles.buttonTextActive]}>{label}</Text>
    </A11yPressable>
  );
  return (
    <View>
      <AccessibilityToggle title={t('settings.accessibility.dyslexia','Dyslexia Friendly Font')} description={t('settings.accessibility.dyslexiaDesc','Use OpenDyslexic where possible')} value={dyslexiaFriendly} onValueChange={setDyslexiaFriendly} icon='text' testID='dyslexia-friendly-toggle' />
      <AccessibilityToggle title={t('settings.accessibility.plainLanguage','Plain Language')} description={t('settings.accessibility.plainLanguageDesc','Uses simpler, clearer text')} value={plainLanguage} onValueChange={setPlainLanguage} icon='document-text' testID='plain-language-toggle' />
      <AccessibilityToggle title={t('settings.accessibility.captions','Captions Preferred')} description={t('settings.accessibility.captionsDesc','Shows captions when available')} value={captionsPreferred} onValueChange={setCaptionsPreferred} icon='logo-closed-captioning' testID='captions-toggle' />
      <AccessibilityToggle title={t('settings.accessibility.voiceMode','Voice Mode (Beta)')} description={t('settings.accessibility.voiceModeDesc','Enables voice navigation')} value={voiceMode} onValueChange={setVoiceMode} icon='mic' testID='voice-mode-toggle' />
  <AccessibilityToggle title={t('settings.accessibility.assistantPill','Show Assistant Pill')} description={t('settings.accessibility.assistantPillDesc','Show the floating assistant button on screens')} value={!!showAssistantPill} onValueChange={setShowAssistantPill} icon='chatbubbles' testID='assistant-pill-toggle' />
      {showAssistantPill && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.sectionSubtitle} accessibilityRole='header'>{t('settings.accessibility.assistantDock','Assistant Pill Position')}</Text>
          <View style={styles.buttonRow}>
            {(['left','right'] as const).map(pos => (
              <A11yPressable key={pos} accessibilityRole='button' accessibilityState={{ selected: assistantPillPosition === pos }} onPress={() => setAssistantPillPosition(pos)} style={[styles.button, assistantPillPosition === pos && styles.buttonActive]} hitSlop={HIT_SLOP_8}>
                <Text style={[styles.buttonText, assistantPillPosition === pos && styles.buttonTextActive]}>{pos === 'left' ? t('common.left','Left') : t('common.right','Right')}</Text>
              </A11yPressable>
            ))}
          </View>
        </View>
      )}
      <View style={styles.textSizeSection}>
        <Text style={styles.sectionSubtitle} accessibilityRole='header'>{t('settings.accessibility.textSize','Text Size')}</Text>
        <Text style={styles.description}>{t('settings.accessibility.textSizeDesc','Adjust text size throughout the app')}</Text>
        <View style={styles.buttonRow}>
          <ScaleButton label='Normal' value='normal' />
          <ScaleButton label='Large' value='large' />
          <ScaleButton label='X-Large' value='xlarge' />
        </View>
      </View>
      <View style={styles.formatSection}>
        <Text style={styles.sectionSubtitle} accessibilityRole='header'>Preferred Resource Format</Text>
        <View style={styles.buttonRow}>
          <FormatButton label='Text' value='text' />
          <FormatButton label='Audio' value='audio' />
          <FormatButton label='ASL' value='asl' />
          <FormatButton label='Easy-Read' value='easy' />
        </View>
      </View>
      <View style={styles.voiceHelpSection}>
        <Link href={'/(tabs)/voice-help' as any} asChild>
          <A11yPressable style={styles.linkButton} accessibilityRole='button' accessibilityLabel='Open voice help guide' hitSlop={HIT_SLOP_8}>
            <Ionicons name='help-circle' size={20} color={palette.primary} />
            <Text style={styles.linkText}>Voice Help Guide</Text>
          </A11yPressable>
        </Link>
      </View>
    </View>
  );
}

function LocalProfileSection() {
  const palette = useAppPalette();
  const s = createStyles(palette);
  const { profile, setProfile } = useProfileLocal();
  const [name, setName] = useState(profile.name ?? '');
  const [contact, setContact] = useState(profile.contact ?? '');
  const [province, setProvince] = useState(profile.province ?? '');
  return (
    <View>
      <Text style={{ color:palette.text, opacity:0.9, marginBottom:6 }}>Name</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholder='Your name' />
      <Text style={{ color:palette.text, opacity:0.9, marginBottom:6 }}>Contact (email/phone)</Text>
      <TextInput style={s.input} value={contact} onChangeText={setContact} placeholder='you@example.com' />
      <Text style={{ color:palette.text, opacity:0.9, marginBottom:6 }}>Province (e.g., ON, QC)</Text>
      <TextInput style={s.input} value={province} onChangeText={setProvince} placeholder='ON' autoCapitalize='characters' maxLength={2} />
      <Button title='Save' onPress={()=> setProfile({ name, contact, province })} />
    </View>
  );
}

function WellnessPrefsSection() {
  const palette = useAppPalette();
  const s = createStyles(palette);
  const [tap, setTap] = useState<'details'|'editor'>('details');
  const [backdate, setBackdate] = useState(true);
  useEffect(()=>{ (async()=>{ try { const v = await AsyncStorage.getItem('reflections.tapAction'); if (v==='details'||v==='editor') setTap(v as any); const b = await AsyncStorage.getItem('reflections.useServerBackdate'); setBackdate(b!=='0'); } catch {} })(); },[]);
  const saveTap = async (next: 'details'|'editor') => { setTap(next); try { await AsyncStorage.setItem('reflections.tapAction', next); } catch {} };
  const saveBackdate = async (val: boolean) => { setBackdate(val); try { await AsyncStorage.setItem('reflections.useServerBackdate', val? '1':'0'); } catch {} };
  return (
    <View>
      <Text style={s.rowLabel}>Reflections Calendar: default tap action</Text>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
        <Button title={`Details ${tap==='details'?'✓':''}`} onPress={()=> saveTap('details')} />
        <Button title={`Editor ${tap==='editor'?'✓':''}`} onPress={()=> saveTap('editor')} />
      </View>
      <View style={{ height:10 }} />
      <Text style={s.rowLabel}>Backdate via server (when adding past days)</Text>
      <Button title={backdate? 'Disable backdating' : 'Enable backdating'} onPress={()=> saveBackdate(!backdate)} />
      <Text style={{ color:palette.text, opacity:0.8, marginTop:6 }}>Tip: You can still change this from inside the calendar.</Text>
    </View>
  );
}

function MediaLockerSection() {
  const palette = useAppPalette();
  const s = createStyles(palette);
  const [thumbs, setThumbs] = useState(true);
  const { youtubeOpenPreference, setYoutubeOpenPreference } = useSettings();
  useEffect(()=>{ (async()=>{ try { const v = await AsyncStorage.getItem('locker.videoThumbnails'); setThumbs(v!=='0'); } catch {} })(); },[]);
  const save = async (val:boolean) => { setThumbs(val); try { await AsyncStorage.setItem('locker.videoThumbnails', val? '1':'0'); } catch {} };
  return (
    <View>
      <Text style={s.rowLabel}>Video thumbnails (cloud videos)</Text>
      <Button title={thumbs? 'Disable thumbnails' : 'Enable thumbnails'} onPress={()=> save(!thumbs)} />
      <Text style={{ color:palette.text, opacity:0.8, marginTop:6 }}>When enabled, the app may request thumbnails from YouTube or an optional server (if configured).</Text>
      <View style={{ height:12 }} />
      <Text style={s.rowLabel}>Open YouTube links in</Text>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
        {(['ask','app','browser'] as const).map(mode => (
          <A11yPressable
            key={mode}
            accessibilityRole='button'
            accessibilityState={{ selected: youtubeOpenPreference === mode }}
            onPress={() => setYoutubeOpenPreference(mode)}
            style={{
              paddingHorizontal:12,
              paddingVertical:8,
              borderRadius:8,
              borderWidth:1,
              borderColor: youtubeOpenPreference === mode ? palette.primary : palette.muted,
              backgroundColor: youtubeOpenPreference === mode ? palette.primary : 'transparent',
              minHeight:44,
              alignItems:'center',
              justifyContent:'center'
            }}
          >
            <Text style={{ color: youtubeOpenPreference === mode ? palette.onPrimary : palette.text, fontWeight:'600' }}>
              {mode === 'ask' ? 'Ask' : mode === 'app' ? 'YouTube App' : 'Browser'}
            </Text>
          </A11yPressable>
        ))}
      </View>
    </View>
  );
}

function EnhancedPrivacySection() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const { state, setPasscode, setLockWellness, setErrorReportingEnabled } = usePrivacy();
  const { requirePasscodeOnLaunch, setRequirePasscodeOnLaunch, autoLockTimeout, setAutoLockTimeout, analyticsOptOut, setAnalyticsOptOut } = useSettings();
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
  return (
    <View>
      <AccessibilityToggle title={t('settings.privacy.passcode','Require Passcode on Launch')} description={t('settings.privacy.passcodeDesc','Lock app with passcode')} value={requirePasscodeOnLaunch} onValueChange={setRequirePasscodeOnLaunch} icon='lock-closed' testID='passcode-toggle' />
      <View style={styles.autoLockSection}>
        <Text style={styles.sectionSubtitle} accessibilityRole='header'>{t('settings.privacy.autoLock','Auto-Lock Timeout')}</Text>
        <Text style={styles.description}>{t('settings.privacy.autoLockDesc','Minutes before app locks')}</Text>
        <View style={styles.buttonRow}>
          {[1,5,15,30].map(m => (
            <A11yPressable key={m} style={[styles.button, autoLockTimeout === m && styles.buttonActive]} onPress={()=> setAutoLockTimeout(m)} accessibilityRole='button' accessibilityState={{ selected: autoLockTimeout === m }} accessibilityLabel={`Set auto-lock to ${m} minutes`} hitSlop={HIT_SLOP_8}>
              <Text style={[styles.buttonText, autoLockTimeout === m && styles.buttonTextActive]}>{m}m</Text>
            </A11yPressable>
          ))}
        </View>
      </View>
      <AccessibilityToggle title={t('settings.privacy.analytics','Opt Out of Analytics')} description={t('settings.privacy.analyticsDesc',"Don't share usage data")} value={analyticsOptOut} onValueChange={setAnalyticsOptOut} icon='analytics' testID='analytics-toggle' />
      <AccessibilityToggle title='Error Reporting' description='Help improve the app by sharing crash reports' value={state.errorReportingEnabled ?? false} onValueChange={setErrorReportingEnabled} icon='bug' testID='error-reporting-toggle' />
      <View style={styles.backupSection}>
        <Text style={styles.sectionSubtitle} accessibilityRole='header'>Data Management</Text>
        <View style={styles.passcodeSection}>
          <Text style={styles.rowLabel}>Set/Change Passcode</Text>
          <TextInput style={styles.input} placeholder='New passcode' secureTextEntry onSubmitEditing={(e)=> setPasscode(e.nativeEvent.text || undefined)} accessibilityLabel='New passcode' accessibilityHint='Enter a new passcode for the app' />
        </View>
        <AccessibilityToggle title='Wellness Lock' description='Require passcode to access wellness features' value={state.lockWellness ?? false} onValueChange={setLockWellness} icon='heart-outline' testID='wellness-lock-toggle' />
        <View style={styles.backupButtons}>
          <A11yPressable style={styles.backupButton} onPress={onExport} accessibilityRole='button' accessibilityLabel='Export backup' hitSlop={HIT_SLOP_8}><Ionicons name='download' size={16} color={palette.primary} /><Text style={styles.backupButtonText}>Export Backup</Text></A11yPressable>
          <A11yPressable style={styles.backupButton} onPress={onImport} accessibilityRole='button' accessibilityLabel='Import backup' hitSlop={HIT_SLOP_8}><Ionicons name='cloud-upload' size={16} color={palette.primary} /><Text style={styles.backupButtonText}>Import Backup</Text></A11yPressable>
          <A11yPressable style={[styles.backupButton, styles.dangerButton]} onPress={onClear} accessibilityRole='button' accessibilityLabel='Clear all data' hitSlop={HIT_SLOP_8}><Ionicons name='trash' size={16} color={palette.error} /><Text style={[styles.backupButtonText, styles.dangerButtonText]}>Clear All Data</Text></A11yPressable>
        </View>
      </View>
    </View>
  );
}

function TermsSection() {
  const openTerms = () => { Linking.openURL('https://empowr.app/terms').catch(()=>{}); };
  const reset = async () => { try { await AsyncStorage.removeItem('empowr.terms.accepted.v1'); Alert.alert('Reset','You will be asked to accept Terms on next launch.'); } catch {} };
  return (
    <View>
      <Button title='View Terms' onPress={openTerms} />
      <View style={{ height:8 }} />
      <Button title='Require re-acceptance' onPress={reset} />
    </View>
  );
}

function AdminSection() {
  const { isAdmin, refreshClaims } = useAuth();
  const palette = useAppPalette();
  return (
    <View>
      <Text style={{ color:palette.text, opacity:0.9, marginBottom:6 }}>Status: {isAdmin? 'Admin':'Standard user'}</Text>
      <Button title='Refresh admin status' onPress={refreshClaims} />
      {isAdmin && (
        <View style={{ marginTop:8 }}>
          <Link href={'/(tabs)/admin' as any} asChild>
            <A11yPressable accessibilityRole='link' accessibilityLabel='Open Admin Panel' hitSlop={HIT_SLOP_8} style={{ paddingVertical:4 }}>
              <Text style={{ color:palette.primary, fontWeight:'700' }}>Open Admin Panel</Text>
            </A11yPressable>
          </Link>
        </View>
      )}
    </View>
  );
}

function BookmarksSection() {
  const { t } = useTranslation();
  const { items, addBookmark, removeBookmark, clearBookmarks, findByRoute } = useBookmarks();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const [route, setRoute] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const registry = require('../../utils/routeRegistry') as any;
  const all: any[] = registry.BOOKMARKABLE_ROUTES || [];
  const bookmarked = new Set(items.map(b => b.route));
  const suggestions = all.filter(r => !bookmarked.has(r.route)).filter(r => { if (!query.trim()) return true; const q = query.trim().toLowerCase(); return r.route.toLowerCase().includes(q) || r.fallback.toLowerCase().includes(q) || r.tKey.toLowerCase().includes(q); }).slice(0,8);
  const addEntry = (r: string, custom?: string) => { const entry = registry.findRouteEntry?.(r); if (!entry) { setError(t('settings.bookmarks.errInvalid','Route not bookmarkable')); return; } if (findByRoute(r)) { setError(t('settings.bookmarks.errDuplicate','Already bookmarked')); return; } addBookmark(r, custom || t(entry.tKey, entry.fallback), entry.tKey); setRoute(''); setLabel(''); setError(null); };
  const onAdd = () => { const r = route.trim(); const l = label.trim(); if (!r) { setError(t('settings.bookmarks.errEmptyRoute','Route required')); return; } addEntry(r, l || undefined); };
  return (
    <View>
      <Text style={styles.description} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('settings.bookmarks.description','Add bookmarks to quickly open frequently used tools and screens.')}</Text>
      <Text style={styles.rowLabel}>{t('settings.bookmarks.search','Search or filter available routes')}</Text>
      <TextInput style={styles.input} placeholder={t('settings.bookmarks.searchPlaceholder','Type to filter suggestions')} value={query} onChangeText={setQuery} autoCapitalize='none' accessibilityLabel={t('settings.bookmarks.search','Search or filter available routes')} />
      {suggestions.length > 0 && (
        <View style={{ marginBottom:12 }}>
          <Text style={[styles.rowLabel, { marginTop:0 }]}>{t('settings.bookmarks.suggestions','Suggestions')}</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
            {suggestions.map(s => (
              <A11yPressable key={s.route} hitSlop={HIT_SLOP_8} onPress={()=> addEntry(s.route)} accessibilityRole='button' accessibilityLabel={t('settings.bookmarks.addSuggestion','Add bookmark for') + ' ' + t(s.tKey, s.fallback)} style={{ paddingHorizontal:12, paddingVertical:8, backgroundColor:palette.card, borderRadius:999, borderWidth:1, borderColor:palette.muted, marginRight:6, marginBottom:6, minHeight:40, justifyContent:'center' }}>
                <Text style={{ color:palette.text, fontSize:Math.round(13*factor) }}>{t(s.tKey, s.fallback)}</Text>
              </A11yPressable>
            ))}
          </View>
        </View>
      )}
      <Text style={styles.rowLabel}>{t('settings.bookmarks.route','Route Path')}</Text>
      <TextInput style={styles.input} placeholder={t('settings.bookmarks.routePlaceholder','e.g. /(tabs)/resources/index')} value={route} onChangeText={setRoute} autoCapitalize='none' />
      <Text style={styles.rowLabel}>{t('settings.bookmarks.label','Label')}</Text>
      <TextInput style={styles.input} placeholder={t('settings.bookmarks.labelPlaceholder','My Resources')} value={label} onChangeText={setLabel} />
      <Button title={t('settings.bookmarks.add','Add Bookmark')} onPress={onAdd} />
  {error && <Text style={{ color:palette.error, marginTop:6 }} {...a11yLiveRegion('polite')}>{error}</Text>}
      {items.length === 0 ? <Text style={[styles.description, { marginTop:12 }]}>{t('settings.bookmarks.empty','No bookmarks yet.')}</Text> : (
        <View style={{ marginTop:12 }}>
          {items.slice().sort((a,b)=> b.created - a.created).map(b => (
            <View key={b.id} style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:8 }}>
              <View style={{ flex:1, paddingRight:8 }}>
                <Text style={{ color:palette.text, fontWeight:'600' }}>{b.tKey ? t(b.tKey, b.label) : b.label}</Text>
                <Text style={{ color:palette.text, opacity:0.6, fontSize:12 }}>{b.route}</Text>
              </View>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> removeBookmark(b.id)} accessibilityRole='button' accessibilityLabel={t('settings.bookmarks.remove','Remove bookmark')} style={{ padding:8, minHeight:44, justifyContent:'center' }}>
                <Ionicons name='trash' size={18} color={palette.error} />
              </A11yPressable>
            </View>
          ))}
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> clearBookmarks()} accessibilityRole='button' accessibilityLabel={t('settings.bookmarks.clearAll','Clear all bookmarks')} style={{ padding:8, alignSelf:'flex-start', minHeight:44, justifyContent:'center' }}>
            <Text style={{ color:palette.error, fontWeight:'600' }}>{t('settings.bookmarks.clearAll','Clear All')}</Text>
          </A11yPressable>
        </View>
      )}
    </View>
  );
}

function Section({ title, subtitle, children, styles }: { title: string; subtitle?: string; children: React.ReactNode; styles: ReturnType<typeof createStyles>; }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole='header' maxFontSizeMultiplier={MAX_FONT_SCALE}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{subtitle}</Text>}
      {children}
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number = 1) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor:palette.background },
    title: { fontSize:Math.round(24*factor), fontWeight:'700', marginBottom:8, color:palette.text },
    section: { paddingVertical:12, borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:palette.muted },
    sectionTitle: { color:palette.text, fontWeight:'700', fontSize:Math.round(18*factor), marginBottom:4 },
    sectionSubtitle: { color:palette.text, fontSize:Math.round(14*factor), opacity:0.7, marginBottom:16, lineHeight:Math.round(20*factor) },
    description: { color:palette.text, fontSize:Math.round(14*factor), opacity:0.8, marginBottom:12, lineHeight:Math.round(20*factor) },
    rowLabel: { color:palette.text, opacity:0.9, marginTop:10, marginBottom:6, fontSize:Math.round(14*factor) },
    input: { borderWidth:1, borderColor:palette.muted, padding:12, borderRadius:8, marginBottom:10, color:palette.text, fontSize:Math.round(14*factor), minHeight:44 },
    avatar: { width:100, height:100, borderRadius:50, marginBottom:10, alignSelf:'center' },
    avatarPlaceholder: { width:100, height:100, borderRadius:50, marginBottom:10, alignSelf:'center', backgroundColor:palette.muted, alignItems:'center', justifyContent:'center' },
    emergencyButton: { backgroundColor:palette.primary, flexDirection:'row', alignItems:'center', justifyContent:'center', padding:16, borderRadius:8, marginTop:8, minHeight:44 },
    emergencyButtonText: { color:'white', fontSize:Math.round(16*factor), fontWeight:'600', marginLeft:8 },
    textSizeSection: { marginTop:16, padding:16, backgroundColor:palette.card, borderRadius:8, borderWidth:1, borderColor:palette.muted },
    formatSection: { marginTop:16, padding:16, backgroundColor:palette.card, borderRadius:8, borderWidth:1, borderColor:palette.muted },
    voiceHelpSection: { marginTop:16 },
    buttonRow: { flexDirection:'row', gap:8, flexWrap:'wrap' },
    button: { backgroundColor:palette.card, paddingHorizontal:16, paddingVertical:8, borderRadius:6, borderWidth:1, borderColor:palette.muted, minHeight:44, minWidth:60, alignItems:'center', justifyContent:'center' },
    buttonActive: { backgroundColor:palette.primary, borderColor:palette.primary },
    buttonText: { color:palette.text, fontSize:Math.round(14*factor), fontWeight:'500' },
    buttonTextActive: { color:'white' },
    linkButton: { flexDirection:'row', alignItems:'center', padding:12, backgroundColor:palette.card, borderRadius:8, borderWidth:1, borderColor:palette.primary, minHeight:44 },
    linkText: { color:palette.primary, fontSize:Math.round(14*factor), fontWeight:'600', marginLeft:8 },
    autoLockSection: { marginTop:8, marginBottom:8 },
    backupSection: { marginTop:16, padding:16, backgroundColor:palette.card, borderRadius:8, borderWidth:1, borderColor:palette.muted },
    passcodeSection: { marginBottom:16 },
    backupButtons: { marginTop:16, gap:8 },
    backupButton: { flexDirection:'row', alignItems:'center', justifyContent:'center', padding:12, borderWidth:1, borderColor:palette.primary, borderRadius:8, minHeight:44 },
    backupButtonText: { color:palette.primary, fontSize:Math.round(14*factor), fontWeight:'500', marginLeft:8 },
    dangerButton: { borderColor:palette.error },
    dangerButtonText: { color:palette.error },
    deletePanel: { marginTop:12, padding:12, borderWidth:1, borderColor:palette.error, borderRadius:8, backgroundColor:palette.card },
    deleteBtn: { paddingHorizontal:16, paddingVertical:12, borderRadius:8, minHeight:44, alignItems:'center', justifyContent:'center' }
  });
}

// END settings.tsx (clean)
