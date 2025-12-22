// pii-scan-ignore-file - Contains user profile email display
// Settings Screen – fully reconstructed (v2)
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Image, Linking, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import AccessibilityToggle from '../../../components/AccessibilityToggle';
import UserBadgesDisplay from '../../../components/badges/UserBadgesDisplay';
import { GapView } from '../../../components/GapView';
import LanguageSelector from '../../../components/LanguageSelector';
import ReferralCard from '../../../components/ReferralCard';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import * as SettingsLazy from '../../../components/settings';
import UpdateChecker from '../../../components/UpdateChecker';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useAuth } from '../../../context/AuthContext';
import { auth, db, storage } from '../../../firebase/config';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useBetaTesterBadge } from '../../../hooks/useBetaTesterBadge';
import { useTranslation } from '../../../i18n';
import { useDevPrefs } from '../../../services/devPrefs';
import { isSentryInitialized, showFeedbackWidget } from '../../../services/telemetry';
import { useNetwork } from '../../../store/network';
import type { ResourceFormat, TextScale } from '../../../store/settings';
import { useSettings } from '../../../store/settings';
import { useTextScale } from '../../../theme/typography';
import { useAppPalette } from '../../../theme/usePalette';
import { logError } from '../../../utils/errorLogger';
import { sendFeedbackEmailInternal } from '../../../utils/feedback';
const NotificationPreferences = React.lazy(() => import('../../../components/NotificationPreferences'));
const EmergencyWalletCard = React.lazy(() => import('../../../components/EmergencyWalletCard'));
const WeeklyWhatsNewToggle = React.lazy(() => import('../../../components/WeeklyWhatsNewToggle').then(m => ({ default: m.WeeklyWhatsNewToggle })));

export default function SettingsScreen() {
  const params = useLocalSearchParams<{ open?: string }>();
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = useRef<Text>(null);
  const { user, isGuest } = useAuth();
  const { setOffline } = useNetwork();
  const router = useRouter();
  useAnnounceOnMount(t('settings.title', 'Settings'));
  useFocusOnRefOnMount(titleRef);
  
  // Auto-award beta tester badge on first launch (if in beta)
  useBetaTesterBadge();

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [showEmergencyCard, setShowEmergencyCard] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [hasPasswordProvider, setHasPasswordProvider] = useState(false);
  // Removed unused isAnonymous state (previously tracked anonymous account status)
  const [providerList, setProviderList] = useState<string[]>([]);

  useEffect(() => { 
    if (!user || !db) return; // Safety check: skip if Firestore not available
    let mounted = true;
    (async () => {
      try { 
        const snap = await getDoc(doc(db, 'users', user.uid)); 
        if (mounted && snap.exists()) { 
          const p = snap.data() as any; 
          setDisplayName(p.displayName || ''); 
          setPhotoURL(p.photoURL || null); 
        } 
      }
      catch (e:any) { 
        if (mounted) {
          const msg = String(e?.message||''); 
          if (msg.toLowerCase().includes('offline')) setOffline(true); 
          else logError('Settings', 'loading profile', e); 
        }
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    if (typeof params?.open === 'string' && params.open.toLowerCase() === 'emergencycard') {
      setShowEmergencyCard(true);
    }
  }, [params?.open]);

  const handleUpdateDisplayName = async () => { if (!user || !db) return; try { await updateDoc(doc(db,'users',user.uid), { displayName }); Alert.alert(t('common.success','Success'), t('settings.account.updatedName','Display name updated')); } catch(e:any){ Alert.alert(t('common.error','Error'), e?.message||'Failed'); } };

  const handleUploadPhoto = async () => { if (!user || !db || !storage) return; try { const ImagePicker = await import('expo-image-picker'); const result: any = await ImagePicker.launchImageLibraryAsync({ allowsEditing:true, aspect:[1,1], quality:0.7 }); if (result.canceled) return; const img = await fetch(result.assets[0].uri); const blob = await img.blob(); const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`); await uploadBytes(storageRef, blob); const url = await getDownloadURL(storageRef); await updateDoc(doc(db,'users',user.uid), { photoURL:url }); setPhotoURL(url); Alert.alert(t('common.success','Success'), t('settings.account.photoUpdated','Profile picture updated')); } catch(e:any){ Alert.alert(t('common.error','Error'), e?.message||'Upload failed'); } };

  const beginDelete = () => {
    if (!user) return;
    const providers = user.providerData.map(p => p.providerId);
    setProviderList(providers);
    setHasPasswordProvider(providers.includes('password'));
  // Anonymous status no longer tracked locally (removed isAnonymous state)
    setDeleteMode(true);
  };
  const cancelDelete = () => { setDeleteMode(false); setPassword(''); };
  const confirmDelete = async () => { if (!user?.email) return; const { trackEvent } = require('../../../services/analyticsClient'); setDeleting(true); try { const cred = EmailAuthProvider.credential(user.email, password); await reauthenticateWithCredential(user, cred); await deleteUser(user); trackEvent('account_delete', { method: 'password' }); Alert.alert(t('settings.account.deleted','Account deleted')); setDeleteMode(false); } catch(e:any){ trackEvent('account_delete_failed', { code: e?.code || 'error', message: e?.message }); Alert.alert(t('settings.account.reauthFailed','Re-authentication failed'), e?.message||'Error'); } finally { setDeleting(false); } };

  // Removed standalone emergency card navigation: now embedded below.

  const sendFeedbackEmail = () => sendFeedbackEmailInternal(t);

  return (
    <ResponsiveScreenWrapper>
      <View style={[styles.container, { padding:20 }]} accessibilityLabel={t('settings.title','Settings screen')}>
        <Text ref={titleRef} accessibilityRole='header' style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('settings.title','Settings')}</Text>
        
        <Section title={t('settings.accessibility.title','Accessibility')} subtitle={t('settings.accessibility.subtitle','Make the app work better for you')} styles={styles}>
          <EnhancedA11ySettingsSection />
          
          {/* Complexity Mode Settings Link - NEW */}
          <A11yPressable
            style={[styles.linkButton, { justifyContent:'center', marginTop:12, backgroundColor: palette.primary, borderWidth: 2, borderColor: palette.primary }]}
            accessibilityRole='button'
            accessibilityLabel='Complexity Mode - Choose Simple, Standard, or Power User mode to control feature visibility'
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/settings/complexity-mode')}
          >
            <Ionicons name='layers-outline' size={20} color={palette.onPrimary} />
            <Text style={[styles.linkText, { color: palette.onPrimary, fontWeight: '700' }]}>🎯 Complexity Mode (Simple/Standard/Power)</Text>
            <Ionicons name='chevron-forward' size={16} color={palette.onPrimary} style={{ marginLeft:'auto' }} />
          </A11yPressable>
          
          {/* Cognitive Accessibility Settings Link */}
          <A11yPressable
            style={[styles.linkButton, { justifyContent:'center', marginTop:12 }]}
            accessibilityRole='button'
            accessibilityLabel={t('settings.cognitiveAccessibility', 'Cognitive Accessibility Settings - Simplified mode, auto-save, and navigation memory for ADHD, autism, and learning disabilities')}
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/settings/cognitive-accessibility')}
          >
            <Ionicons name='bulb-outline' size={20} color={palette.primary} />
            <Text style={styles.linkText}>{t('settings.cognitiveAccessibilityTitle', 'Cognitive Accessibility')}</Text>
            <Ionicons name='chevron-forward' size={16} color={palette.muted} style={{ marginLeft:'auto' }} />
          </A11yPressable>
          
          {/* Advanced Accessibility Settings Link */}
          <A11yPressable
            style={[styles.linkButton, { justifyContent:'center', marginTop:8 }]}
            accessibilityRole='button'
            accessibilityLabel="Advanced Accessibility Settings - Additional accessibility options"
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/settings/advanced-accessibility')}
          >
            <Ionicons name='options' size={20} color={palette.primary} />
            <Text style={styles.linkText}>Advanced Accessibility</Text>
            <Ionicons name='chevron-forward' size={16} color={palette.muted} style={{ marginLeft:'auto' }} />
          </A11yPressable>
        </Section>
        
        <Section title="Cultural & Neurodiversity Support" subtitle="Inclusive settings for diverse communities" styles={styles}>
          {/* Neurodivergent Support Link */}
          <A11yPressable
            style={[styles.linkButton, { justifyContent:'center', marginBottom:8 }]}
            accessibilityRole='button'
            accessibilityLabel="Neurodivergent Support Settings"
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/settings/neurodivergent')}
          >
            <Ionicons name='git-branch' size={20} color={palette.primary} />
            <Text style={styles.linkText}>Neurodivergent Support</Text>
            <Ionicons name='chevron-forward' size={16} color={palette.muted} style={{ marginLeft:'auto' }} />
          </A11yPressable>
          
          {/* Cognitive Comfort Link - For users with brain fog, memory challenges */}
          <A11yPressable
            style={[styles.linkButton, { justifyContent:'center', marginBottom:8 }]}
            accessibilityRole='button'
            accessibilityLabel={t('cognitiveComfort.settings.title', 'Cognitive Comfort - Where Was I, breadcrumbs, focus lock for brain fog and memory support')}
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/settings/cognitive-comfort' as never)}
          >
            <Ionicons name='cloudy-outline' size={20} color={palette.primary} />
            <Text style={styles.linkText}>{t('cognitiveComfort.settings.title', 'Cognitive Comfort')}</Text>
            <Ionicons name='chevron-forward' size={16} color={palette.muted} style={{ marginLeft:'auto' }} />
          </A11yPressable>
          
          {/* Cultural Safety Link */}
          <A11yPressable
            style={[styles.linkButton, { justifyContent:'center', marginBottom:8 }]}
            accessibilityRole='button'
            accessibilityLabel="Cultural Safety Settings"
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/settings/cultural-safety')}
          >
            <Ionicons name='globe' size={20} color={palette.primary} />
            <Text style={styles.linkText}>Cultural Safety</Text>
            <Ionicons name='chevron-forward' size={16} color={palette.muted} style={{ marginLeft:'auto' }} />
          </A11yPressable>
          
          {/* Indigenous Languages Link */}
          <A11yPressable
            style={[styles.linkButton, { justifyContent:'center' }]}
            accessibilityRole='button'
            accessibilityLabel="Indigenous Languages - Traditional language support"
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/settings/indigenous-language')}
          >
            <Ionicons name='leaf' size={20} color={palette.primary} />
            <Text style={styles.linkText}>Indigenous Languages</Text>
            <Ionicons name='chevron-forward' size={16} color={palette.muted} style={{ marginLeft:'auto' }} />
          </A11yPressable>
        </Section>
        
        <LanguageSelector />
        
        <Section title={t('settings.privacy.title','Privacy & Security')} subtitle={t('settings.privacy.subtitle','Control your data and security')} styles={styles}>
          <React.Suspense fallback={<View accessibilityRole='progressbar' style={{ paddingVertical:8 }}><Text>Loading privacy…</Text></View>}>
            <SettingsLazy.EnhancedPrivacySection />
          </React.Suspense>
          
          {/* Advanced Security Link */}
          <A11yPressable
            style={[styles.linkButton, { justifyContent:'center', marginTop:12 }]}
            accessibilityRole='button'
            accessibilityLabel="Advanced Security Settings"
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/settings/advanced-security')}
          >
            <Ionicons name='shield-checkmark' size={20} color={palette.primary} />
            <Text style={styles.linkText}>Advanced Security</Text>
            <Ionicons name='chevron-forward' size={16} color={palette.muted} style={{ marginLeft:'auto' }} />
          </A11yPressable>
          
          {/* Evidence Encryption & Background Sync */}
          <A11yPressable
            style={[styles.linkButton, { justifyContent:'center', marginTop:12 }]}
            accessibilityRole='button'
            accessibilityLabel="Evidence Security and Background Sync settings"
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/settings/security')}
          >
            <Ionicons name='lock-closed' size={20} color={palette.primary} />
            <Text style={styles.linkText}>Evidence Encryption & Sync</Text>
            <Ionicons name='chevron-forward' size={16} color={palette.muted} style={{ marginLeft:'auto' }} />
          </A11yPressable>

          {/* Bring Your Own Cloud (BYOC) */}
          <A11yPressable
            style={[styles.linkButton, { justifyContent:'center', marginTop:12, backgroundColor: palette.primary, borderWidth: 2, borderColor: palette.primary }]}
            accessibilityRole='button'
            accessibilityLabel="Bring Your Own Cloud - Connect WebDAV or Google Drive for complete data ownership"
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/settings/byoc' as any)}
          >
            <Ionicons name='cloud-upload' size={20} color={palette.onPrimary} />
            <Text style={[styles.linkText, { color: palette.onPrimary, fontWeight: '700' }]}>☁️ Bring Your Own Cloud (BYOC)</Text>
            <Ionicons name='chevron-forward' size={16} color={palette.onPrimary} style={{ marginLeft:'auto' }} />
          </A11yPressable>
        </Section>
        
        <Section title={t('updates.title', 'App Updates')} subtitle={t('updates.subtitle', 'Check for and install the latest features')} styles={styles}>
          <UpdateChecker />
        </Section>
        
        <React.Suspense fallback={<View accessibilityRole='progressbar' style={{ paddingVertical:8 }}><Text>Loading notification preferences…</Text></View>}>
          <NotificationPreferences />
        </React.Suspense>

        <Section title="What's New Notifications" subtitle="Weekly summaries of app updates and improvements" styles={styles}>
          <React.Suspense fallback={<View accessibilityRole='progressbar' style={{ paddingVertical:8 }}><Text>Loading…</Text></View>}>
            <WeeklyWhatsNewToggle />
          </React.Suspense>
        </Section>

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
          {showEmergencyCard && (
            <React.Suspense fallback={<View accessibilityRole='progressbar' style={{ paddingVertical:8 }}><Text>Loading emergency card…</Text></View>}>
              <EmergencyWalletCard />
            </React.Suspense>
          )}
        </Section>
        <Section title={t('settings.bookmarks.title','Bookmarks')} subtitle={t('settings.bookmarks.subtitle','Save quick links to app features')} styles={styles}>
          <React.Suspense fallback={<View accessibilityRole='progressbar' style={{ paddingVertical:8 }}><Text>Loading bookmarks…</Text></View>}>
            <SettingsLazy.BookmarksSection />
          </React.Suspense>
        </Section>
        
        {/* Referral Section - Viral Growth */}
        <Section title={t('referral.title', 'Invite Friends')} subtitle={t('referral.subtitle', 'Share 3mpwr with others and earn rewards')} styles={styles}>
          <ReferralCard compact />
        </Section>
        
        <Section title={t('settings.account.title','Account Management')} subtitle={t('settings.account.subtitle','Manage your profile and preferences')} styles={styles}>
          {/* Profile Editor Link */}
          {!isGuest && (
            <A11yPressable
              style={[styles.linkButton, { justifyContent:'center', marginBottom:8 }]}
              accessibilityRole='button'
              accessibilityLabel="Profile Editor - Update your disability profile, role, and energy patterns"
              hitSlop={HIT_SLOP_8}
              onPress={() => router.push('/profile/editor')}
            >
              <Ionicons name='person-circle' size={20} color={palette.primary} />
              <Text style={styles.linkText}>Edit Profile</Text>
              <Ionicons name='chevron-forward' size={16} color={palette.muted} style={{ marginLeft:'auto' }} />
            </A11yPressable>
          )}
          
          {isGuest && (
            <View style={{ marginBottom:16 }}>
              <Text style={[styles.description, { marginBottom:8 }]}>{t('settings.account.guestNotice','You are browsing as a guest. Create an account to sync data across devices and enable full features.')}</Text>
              <A11yPressable style={[styles.linkButton,{ justifyContent:'center' }]} accessibilityRole='button' accessibilityLabel={t('settings.account.createAccount','Create Account')} hitSlop={HIT_SLOP_8} onPress={() => router.push('/(auth)/signup')}>
                <Ionicons name='person-add' size={20} color={palette.primary} />
                <Text style={styles.linkText}>{t('settings.account.createAccount','Create Account')}</Text>
              </A11yPressable>
            </View>
          )}
          {!isGuest && (
            <>
              {photoURL ? <Image source={{ uri: photoURL }} style={styles.avatar} accessibilityLabel={t('settings.account.photo','Profile picture')} /> : <View style={styles.avatarPlaceholder}><Ionicons name='person' size={40} color={palette.text} /></View>}
              <Button title={t('settings.account.changePhoto','Change Profile Picture')} onPress={handleUploadPhoto} />
              
              <UserBadgesDisplay />
              
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
                      <TextInput style={styles.input} secureTextEntry={true} value={password} onChangeText={setPassword} placeholder={t('settings.account.passwordPlaceholder','Password')} accessibilityLabel={t('settings.account.passwordPlaceholder','Password')} />
                      <GapView gap={8} style={{ flexDirection:'row' }}>
                        <A11yPressable hitSlop={HIT_SLOP_8} style={[styles.deleteBtn,{ backgroundColor:palette.error }]} onPress={confirmDelete} disabled={deleting || !password} accessibilityRole='button' accessibilityLabel={t('settings.account.confirmDelete','Confirm account deletion')}>
                          <Text style={{ color:palette.onPrimary, fontWeight:'700' }}>{deleting? t('common.working','Working...') : t('settings.account.confirmDelete','Confirm Delete')}</Text>
                        </A11yPressable>
                        <A11yPressable hitSlop={HIT_SLOP_8} style={[styles.deleteBtn,{ borderWidth:1, borderColor:palette.muted }]} onPress={cancelDelete} accessibilityRole='button' accessibilityLabel={t('common.cancel','Cancel')}>
                          <Text style={{ color:palette.text, fontWeight:'600' }}>{t('common.cancel','Cancel')}</Text>
                        </A11yPressable>
                      </GapView>
                    </>
                  ) : (
                    <>
                      <Text style={{ color:palette.error, fontWeight:'600', marginBottom:8 }}>{t('settings.account.deleteConfirmPasswordTitle','Confirm Deletion')}</Text>
                      <Text style={{ color:palette.text, opacity:0.8, marginBottom:12 }}>
                        {t('settings.account.deleteNoPassword','This account uses a third-party sign-in method. Sign in again with your provider (e.g. Google/Apple) recently, then press Continue to delete.')}
                      </Text>
                      <GapView gap={8} style={{ flexDirection:'row' }}>
                        <A11yPressable hitSlop={HIT_SLOP_8} style={[styles.deleteBtn,{ backgroundColor:palette.error }]} onPress={confirmDelete} disabled={deleting} accessibilityRole='button' accessibilityLabel={t('settings.account.confirmDelete','Confirm account deletion')}>
                          <Text style={{ color:palette.onPrimary, fontWeight:'700' }}>{deleting? t('common.working','Working...') : t('settings.account.confirmDelete','Confirm Delete')}</Text>
                        </A11yPressable>
                        <A11yPressable hitSlop={HIT_SLOP_8} style={[styles.deleteBtn,{ borderWidth:1, borderColor:palette.muted }]} onPress={cancelDelete} accessibilityRole='button' accessibilityLabel={t('common.cancel','Cancel')}>
                          <Text style={{ color:palette.text, fontWeight:'600' }}>{t('common.cancel','Cancel')}</Text>
                        </A11yPressable>
                      </GapView>
                      {!!providerList.length && <Text style={{ color:palette.textSecondary, marginTop:8, fontSize:12 }}>Providers: {providerList.join(', ')}</Text>}
                    </>
                  )}
                </View>
              )}
            </View>
          )}
        </Section>
        <Section title='Local Profile (for templates)' styles={styles}>
          <React.Suspense fallback={<View accessibilityRole='progressbar' style={{ paddingVertical:8 }}><Text>Loading…</Text></View>}>
            <SettingsLazy.LocalProfileSection />
          </React.Suspense>
        </Section>
        <Section title='Wellness Preferences' styles={styles}>
          <React.Suspense fallback={<View accessibilityRole='progressbar' style={{ paddingVertical:8 }}><Text>Loading…</Text></View>}>
            <SettingsLazy.WellnessPrefsSection />
          </React.Suspense>
        </Section>
        <Section title='Media & Locker' styles={styles}>
          <React.Suspense fallback={<View accessibilityRole='progressbar' style={{ paddingVertical:8 }}><Text>Loading…</Text></View>}>
            <SettingsLazy.MediaLockerSection />
          </React.Suspense>
        </Section>
        <DeveloperSection styles={styles} />
        <Section title={t('about.title','About & Contact')} styles={styles}>
          <A11yPressable
            onPress={() => {
              if (isSentryInitialized()) {
                showFeedbackWidget();
              } else {
                sendFeedbackEmail();
              }
            }}
            accessibilityRole='button'
            accessibilityLabel={t('about.sendFeedback','Send Feedback')}
            hitSlop={HIT_SLOP_8}
            style={[styles.linkButton, { justifyContent:'center', marginBottom:12 }]}
          >
            <Ionicons name='chatbubble-ellipses' size={20} color={palette.primary} />
            <Text style={styles.linkText}>{t('about.sendFeedback','Send Feedback')}</Text>
          </A11yPressable>
          <A11yPressable
            onPress={sendFeedbackEmail}
            accessibilityRole='button'
            accessibilityLabel={t('about.sendLabel','Send email')}
            hitSlop={HIT_SLOP_8}
            style={[styles.linkButton, { justifyContent:'center', marginBottom:12 }]}
          >
            <Ionicons name='mail' size={20} color={palette.primary} />
            <Text style={styles.linkText}>{t('about.sendLabel','Send email')}</Text>
          </A11yPressable>
        </Section>
        <Section title='Terms & Policies' styles={styles}><TermsSection /></Section>
        <DeveloperSection styles={styles} />
      </View>
    </ResponsiveScreenWrapper>
  );
}

function EnhancedA11ySettingsSection() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const router = useRouter();
  const { textScale, setTextScale, resourcePreferredFormat, setResourcePreferredFormat } = useSettings();
  const { dyslexiaFriendly, setDyslexiaFriendly, plainLanguage, setPlainLanguage, captionsPreferred, setCaptionsPreferred, voiceMode, setVoiceMode } = useSettings();
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
      {/* Assistant Pill removed - Ask button now in header */}
      <View style={styles.textSizeSection}>
        <Text style={styles.sectionSubtitle} accessibilityRole='header'>{t('settings.accessibility.textSize','Text Size')}</Text>
        <Text style={styles.description}>{t('settings.accessibility.textSizeDesc','Adjust text size throughout the app')}</Text>
        <GapView gap={8} style={styles.buttonRow}>
          <ScaleButton label='Normal' value='normal' />
          <ScaleButton label='Large' value='large' />
          <ScaleButton label='X-Large' value='xlarge' />
        </GapView>
      </View>
      <View style={styles.formatSection}>
        <Text style={styles.sectionSubtitle} accessibilityRole='header'>Preferred Resource Format</Text>
        <GapView gap={8} style={styles.buttonRow}>
          <FormatButton label='Text' value='text' />
          <FormatButton label='Audio' value='audio' />
          <FormatButton label='ASL' value='asl' />
          <FormatButton label='Easy-Read' value='easy' />
        </GapView>
      </View>
      <View style={styles.voiceHelpSection}>
        <A11yPressable style={styles.linkButton} accessibilityRole='button' accessibilityLabel='Open voice help guide' hitSlop={HIT_SLOP_8} onPress={() => router.push('/(tabs)/voice-help')}>
          <Ionicons name='help-circle' size={20} color={palette.primary} />
          <Text style={styles.linkText}>Voice Help Guide</Text>
        </A11yPressable>
      </View>
    </View>
  );
}


function TermsSection() {
  const openTerms = () => { Linking.openURL('https://3mpwrapp.pages.dev/terms/').catch(()=>{}); };
  const openPrivacy = () => { Linking.openURL('https://3mpwrapp.pages.dev/privacy/').catch(()=>{}); };
  const openDataOwnership = () => { Linking.openURL('https://3mpwrapp.pages.dev/data-ownership/').catch(()=>{}); };
  const openCommunityGuidelines = () => { Linking.openURL('https://3mpwrapp.pages.dev/community/guidelines/').catch(()=>{}); };
  const openDeleteData = () => { Linking.openURL('https://3mpwrapp.pages.dev/delete-data/').catch(()=>{}); };
  const openLegalDisclaimers = () => { Linking.openURL('https://3mpwrapp.pages.dev/legal/disclaimers/').catch(()=>{}); };
  const openPrivacyControls = () => { Linking.openURL('https://3mpwrapp.pages.dev/privacy-controls/').catch(()=>{}); };
  const reset = async () => { try { await AsyncStorage.removeItem('empowr.terms.accepted.v1'); Alert.alert('Reset','You will be asked to accept Terms on next launch.'); } catch {} };
  return (
    <View>
      <Button title='Terms of Service' onPress={openTerms} />
      <View style={{ height:8 }} />
      <Button title='Privacy Policy' onPress={openPrivacy} />
      <View style={{ height:8 }} />
      <Button title='Data Ownership' onPress={openDataOwnership} />
      <View style={{ height:8 }} />
      <Button title='Community Guidelines' onPress={openCommunityGuidelines} />
      <View style={{ height:8 }} />
      <Button title='Legal Disclaimers' onPress={openLegalDisclaimers} />
      <View style={{ height:8 }} />
      <Button title='Privacy & Controls' onPress={openPrivacyControls} />
      <View style={{ height:8 }} />
      <Button title='Delete My Data' onPress={openDeleteData} />
      <View style={{ height:8 }} />
      <Button title='Require re-acceptance' onPress={reset} />
    </View>
  );
}

function DeveloperSection({ styles }: { styles: ReturnType<typeof createStyles> }) {
  const palette = useAppPalette();
  const { user } = useAuth();
  const router = useRouter();
  const { costAlertsEnabled, setCostAlertsEnabled } = useDevPrefs();
  
  // Only show developer section for specific email
  if (user?.email !== 'empowrapp08162025@gmail.com') {
    return null;
  }
  
  return (
    <Section title='Developer' subtitle='Local-only toggles for development' styles={styles}>
      <View style={{ paddingVertical:8 }}>
        {/* Admin Panel Link */}
        <A11yPressable
          accessibilityRole='button'
          accessibilityLabel='Admin Panel - A/B Testing, Feature Flags, Analytics Dashboard'
          onPress={() => router.push('/(tabs)/settings/admin' as never)}
          hitSlop={HIT_SLOP_8}
          style={[styles.linkButton, { marginBottom:12 }]}
        >
          <Ionicons name='construct' size={20} color={palette.primary} />
          <Text style={styles.linkText}>🔧 Admin Panel</Text>
          <Ionicons name='chevron-forward' size={16} color={palette.muted} style={{ marginLeft:'auto' }} />
        </A11yPressable>
        
        <A11yPressable
          accessibilityRole='switch'
          accessibilityState={{ checked: !!costAlertsEnabled }}
          onPress={() => setCostAlertsEnabled(!costAlertsEnabled)}
          hitSlop={HIT_SLOP_8}
          style={[styles.linkButton, { justifyContent:'space-between' }]}
        >
          <View style={{ flexDirection:'row', alignItems:'center' }}>
            <Ionicons name='alert-circle' size={20} color={palette.primary} />
            <Text style={[styles.linkText, { marginLeft:8 }]}>Cost alerts</Text>
          </View>
          <Text style={{ color: palette.textSecondary }}>{costAlertsEnabled ? 'On' : 'Off'}</Text>
        </A11yPressable>
        <Text style={[styles.description, { marginTop:8 }]}>
          When enabled, the app will warn before using features that could incur costs (e.g., external LLM, Sentry, Android Maps). Free Mode still blocks paid features.
        </Text>
      </View>
    </Section>
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
    sectionSubtitle: { color:palette.textSecondary, fontSize:Math.round(14*factor), marginBottom:16, lineHeight:Math.round(20*factor) },
    description: { color:palette.text, fontSize:Math.round(14*factor), opacity:0.8, marginBottom:12, lineHeight:Math.round(20*factor) },
    rowLabel: { color:palette.text, opacity:0.9, marginTop:10, marginBottom:6, fontSize:Math.round(14*factor) },
    input: { borderWidth:1, borderColor:palette.muted, padding:12, borderRadius:8, marginBottom:10, color:palette.text, fontSize:Math.round(14*factor), minHeight:44 },
    avatar: { width:100, height:100, borderRadius:50, marginBottom:10, alignSelf:'center' },
    avatarPlaceholder: { width:100, height:100, borderRadius:50, marginBottom:10, alignSelf:'center', backgroundColor:palette.muted, alignItems:'center', justifyContent:'center' },
    emergencyButton: { backgroundColor:palette.primary, flexDirection:'row', alignItems:'center', justifyContent:'center', padding:16, borderRadius:8, marginTop:8, minHeight:44 },
    emergencyButtonText: { color:palette.onPrimary, fontSize:Math.round(16*factor), fontWeight:'600', marginLeft:8 },
    textSizeSection: { marginTop:16, padding:16, backgroundColor:palette.card, borderRadius:8, borderWidth:1, borderColor:palette.muted },
    formatSection: { marginTop:16, padding:16, backgroundColor:palette.card, borderRadius:8, borderWidth:1, borderColor:palette.muted },
    voiceHelpSection: { marginTop:16 },
    buttonRow: { flexDirection:'row', flexWrap:'wrap' },
    button: { backgroundColor:palette.card, paddingHorizontal:16, paddingVertical:8, borderRadius:6, borderWidth:1, borderColor:palette.muted, minHeight:44, minWidth:60, alignItems:'center', justifyContent:'center' },
    buttonActive: { backgroundColor:palette.primary, borderColor:palette.primary },
    buttonText: { color:palette.text, fontSize:Math.round(14*factor), fontWeight:'500' },
    buttonTextActive: { color:palette.onPrimary },
    linkButton: { flexDirection:'row', alignItems:'center', padding:12, backgroundColor:palette.card, borderRadius:8, borderWidth:1, borderColor:palette.primary, minHeight:44 },
    linkText: { color:palette.primary, fontSize:Math.round(14*factor), fontWeight:'600', marginLeft:8 },
    autoLockSection: { marginTop:8, marginBottom:8 },
    backupSection: { marginTop:16, padding:16, backgroundColor:palette.card, borderRadius:8, borderWidth:1, borderColor:palette.muted },
    passcodeSection: { marginBottom:16 },
    backupButtons: { marginTop:16 },
    backupButton: { flexDirection:'row', alignItems:'center', justifyContent:'center', padding:12, borderWidth:1, borderColor:palette.primary, borderRadius:8, minHeight:44 },
    backupButtonText: { color:palette.primary, fontSize:Math.round(14*factor), fontWeight:'500', marginLeft:8 },
    dangerButton: { borderColor:palette.error },
    dangerButtonText: { color:palette.error },
    deletePanel: { marginTop:12, padding:12, borderWidth:1, borderColor:palette.error, borderRadius:8, backgroundColor:palette.card },
    deleteBtn: { paddingHorizontal:16, paddingVertical:12, borderRadius:8, minHeight:44, alignItems:'center', justifyContent:'center' }
  });
}

// END settings.impl.tsx
