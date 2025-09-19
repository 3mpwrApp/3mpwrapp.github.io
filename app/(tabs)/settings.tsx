import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  Alert,
  Image,
  Linking,
  Pressable,
} from "react-native";
import { useAppPalette } from "../../theme/usePalette";
import { useTextScale } from "../../theme/typography";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import { useSettings, TextScale, ResourceFormat } from "../../store/settings";
import { useTranslation } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { Link } from "expo-router";
import { db, storage } from "../../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNetwork } from "../../store/network";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useProfileLocal } from "../../store/profileLocal";
import {
  exportBackup,
  importBackup,
  clearAllData,
} from "../../services/backup";
import { usePrivacy } from "../../store/privacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// Import new components
import AccessibilityToggle from "../../components/AccessibilityToggle";
import LanguageSelector from "../../components/LanguageSelector";
import NotificationPreferences from "../../components/NotificationPreferences";
import EmergencyWalletCard from "../../components/EmergencyWalletCard";

export default function SettingsScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  
  useAnnounceOnMount(t("settings.title", "Settings"));
  useFocusOnRefOnMount(titleRef);

  // Profile state
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [showEmergencyCard, setShowEmergencyCard] = useState(false);

  // Track offline state when profile fetch fails (for banner)
  const { setOffline } = useNetwork();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profile = docSnap.data();
          setDisplayName(profile.displayName || "");
          setPhotoURL(profile.photoURL || null);
        }
      } catch (err: any) {
        const msg = String(err?.message ?? "");
        if (msg.toLowerCase().includes("offline")) {
          setOffline(true);
        } else {
          console.error("Error fetching profile:", msg);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdateDisplayName = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { displayName });
      Alert.alert("Success", "Your display name has been updated!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleUploadPhoto = async () => {
    if (!user) return;
    let result: any;
    try {
      const ImagePicker = await import("expo-image-picker");
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
    } catch {
      Alert.alert(
        "Image Picker Unavailable",
        "Please rebuild the Android app to include expo-image-picker (npx expo run:android).",
      );
      return;
    }

    if (result.canceled) return;

    try {
      const img = await fetch(result.assets[0].uri);
      const blob = await img.blob();

      const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { photoURL: downloadURL });

      setPhotoURL(downloadURL);
      Alert.alert("Success", "Profile picture updated!");
    } catch (err: any) {
      Alert.alert("Error uploading photo", err.message);
    }
  };

  if (showEmergencyCard) {
    return <EmergencyWalletCard />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      accessibilityLabel={t("settings.title", "Settings screen")}
      accessible
    >
      <Text
        ref={titleRef}
        nativeID="settings-title"
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t("settings.title", "Settings")}
      </Text>

      {/* Account Management Section */}
      <Section 
        title={t("settings.account.title", "Account Management")}
        subtitle={t("settings.account.subtitle", "Manage your profile and preferences")}
        styles={styles}
      >
        {photoURL ? (
          <Image
            source={{ uri: photoURL }}
            style={styles.avatar}
            accessibilityLabel="Profile picture"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color={palette.text} />
          </View>
        )}
        <Button title="Change Profile Picture" onPress={handleUploadPhoto} />

        <Text style={styles.rowLabel}>{t("settings.account.displayName", "Display Name")}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter display name"
          value={displayName}
          onChangeText={setDisplayName}
          accessibilityLabel="Display name"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />
        <Button title="Update Name" onPress={handleUpdateDisplayName} />
      </Section>

      {/* Enhanced Accessibility Preferences */}
      <Section 
        title={t("settings.accessibility.title", "Accessibility")}
        subtitle={t("settings.accessibility.subtitle", "Make the app work better for you")}
        styles={styles}
      >
        <EnhancedA11ySettingsSection />
      </Section>

      {/* Language Preferences */}
      <LanguageSelector />

      {/* Notification Preferences */}
      <NotificationPreferences />

      {/* Emergency Wallet Card */}
      <Section 
        title={t("settings.emergency.title", "Emergency Wallet Card")}
        subtitle={t("settings.emergency.subtitle", "Quick access to important information")}
        styles={styles}
      >
        <Text style={styles.description} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t("settings.emergency.description", "Create a digital emergency card with your key information for quick access when needed")}
        </Text>
        <Pressable
          style={styles.emergencyButton}
          onPress={() => setShowEmergencyCard(true)}
          accessibilityRole="button"
          accessibilityLabel="Open emergency wallet card"
          accessibilityHint="Create or edit your emergency contact and medical information"
        >
          <Ionicons name="medical" size={20} color="white" />
          <Text style={styles.emergencyButtonText}>Manage Emergency Card</Text>
        </Pressable>
      </Section>

      {/* Local profile for templates */}
      <Section title="Local Profile (for templates)" styles={styles}>
        <LocalProfileSection />
      </Section>

      {/* Wellness Preferences */}
      <Section title="Wellness Preferences" styles={styles}>
        <WellnessPrefsSection />
      </Section>

      {/* Media & Locker */}
      <Section title="Media & Locker" styles={styles}>
        <MediaLockerSection />
      </Section>

      {/* Enhanced Privacy & Security */}
      <Section 
        title={t("settings.privacy.title", "Privacy & Security")}
        subtitle={t("settings.privacy.subtitle", "Control your data and security")}
        styles={styles}
      >
        <EnhancedPrivacySection />
      </Section>

      <Section title="Terms & Policies" styles={styles}>
        <TermsSection />
      </Section>

      {user && (
        <Section title="Admin" styles={styles}>
          <AdminSection />
        </Section>
      )}
    </ScrollView>
  );
}

function EnhancedA11ySettingsSection() {
  const { t } = useTranslation();
  const {
    highContrast,
    setHighContrast,
    textScale,
    setTextScale,
    dyslexiaFriendly,
    setDyslexiaFriendly,
    plainLanguage,
    setPlainLanguage,
    captionsPreferred,
    setCaptionsPreferred,
    screenReaderOptimized,
    setScreenReaderOptimized,
    reduceMotion,
    setReduceMotion,
    focusIndicatorEnhanced,
    setFocusIndicatorEnhanced,
    tapTargetMinimum,
    setTapTargetMinimum,
    voiceMode,
    setVoiceMode,
    setResourcePreferredFormat,
  } = useSettings();

  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);

  const ScaleButton = ({ label, value }: { label: string; value: TextScale }) => (
    <Pressable
      style={[styles.button, textScale === value && styles.buttonActive]}
      onPress={() => setTextScale(value)}
      accessibilityRole="button"
      accessibilityState={{ selected: textScale === value }}
      accessibilityLabel={`Set text size to ${label}`}
    >
      <Text style={[styles.buttonText, textScale === value && styles.buttonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );

  const FormatButton = ({ label, value }: { label: string; value: ResourceFormat }) => (
    <Pressable
      style={styles.button}
      onPress={() => setResourcePreferredFormat(value)}
      accessibilityRole="button"
      accessibilityLabel={`Set preferred format to ${label}`}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );

  return (
    <View>
      <AccessibilityToggle
        title={t("settings.accessibility.highContrast", "High Contrast")}
        description={t("settings.accessibility.highContrastDesc", "Increases contrast for better readability")}
        value={highContrast}
        onValueChange={setHighContrast}
        icon="contrast"
        testID="high-contrast-toggle"
      />

      <AccessibilityToggle
        title={t("settings.accessibility.screenReader", "Screen Reader Optimized")}
        description={t("settings.accessibility.screenReaderDesc", "Optimizes content for screen readers")}
        value={screenReaderOptimized}
        onValueChange={setScreenReaderOptimized}
        icon="ear"
        testID="screen-reader-toggle"
      />

      <AccessibilityToggle
        title={t("settings.accessibility.reduceMotion", "Reduce Motion")}
        description={t("settings.accessibility.reduceMotionDesc", "Minimizes animations and transitions")}
        value={reduceMotion}
        onValueChange={setReduceMotion}
        icon="pause"
        testID="reduce-motion-toggle"
      />

      <AccessibilityToggle
        title={t("settings.accessibility.focusIndicator", "Enhanced Focus Indicators")}
        description={t("settings.accessibility.focusIndicatorDesc", "Makes keyboard navigation more visible")}
        value={focusIndicatorEnhanced}
        onValueChange={setFocusIndicatorEnhanced}
        icon="square-outline"
        testID="focus-indicator-toggle"
      />

      <AccessibilityToggle
        title={t("settings.accessibility.tapTarget", "Minimum Tap Target Size")}
        description={t("settings.accessibility.tapTargetDesc", "Ensures buttons are easy to tap")}
        value={tapTargetMinimum}
        onValueChange={setTapTargetMinimum}
        icon="finger-print"
        testID="tap-target-toggle"
      />

      <AccessibilityToggle
        title={t("settings.accessibility.dyslexiaFriendly", "Dyslexia-Friendly Font")}
        description={t("settings.accessibility.dyslexiaFriendlyDesc", "Improves letter spacing and readability")}
        value={dyslexiaFriendly}
        onValueChange={setDyslexiaFriendly}
        icon="text"
        testID="dyslexia-friendly-toggle"
      />

      <AccessibilityToggle
        title={t("settings.accessibility.plainLanguage", "Plain Language")}
        description={t("settings.accessibility.plainLanguageDesc", "Uses simpler, clearer text")}
        value={plainLanguage}
        onValueChange={setPlainLanguage}
        icon="document-text"
        testID="plain-language-toggle"
      />

      <AccessibilityToggle
        title={t("settings.accessibility.captions", "Captions Preferred")}
        description={t("settings.accessibility.captionsDesc", "Shows captions when available")}
        value={captionsPreferred}
        onValueChange={setCaptionsPreferred}
        icon="closed-captioning"
        testID="captions-toggle"
      />

      <AccessibilityToggle
        title={t("settings.accessibility.voiceMode", "Voice Mode (Beta)")}
        description={t("settings.accessibility.voiceModeDesc", "Enables voice navigation")}
        value={voiceMode}
        onValueChange={setVoiceMode}
        icon="mic"
        testID="voice-mode-toggle"
      />

      <View style={styles.textSizeSection}>
        <Text style={styles.sectionSubtitle} accessibilityRole="header">
          {t("settings.accessibility.textSize", "Text Size")}
        </Text>
        <Text style={styles.description}>
          {t("settings.accessibility.textSizeDesc", "Adjust text size throughout the app")}
        </Text>
        <View style={styles.buttonRow}>
          <ScaleButton label="Normal" value="normal" />
          <ScaleButton label="Large" value="large" />
          <ScaleButton label="X-Large" value="xlarge" />
        </View>
      </View>

      <View style={styles.formatSection}>
        <Text style={styles.sectionSubtitle} accessibilityRole="header">
          Preferred Resource Format
        </Text>
        <View style={styles.buttonRow}>
          <FormatButton label="Text" value="text" />
          <FormatButton label="Audio" value="audio" />
          <FormatButton label="ASL" value="asl" />
          <FormatButton label="Easy-Read" value="easy" />
        </View>
      </View>

      <View style={styles.voiceHelpSection}>
        <Link href={("/(tabs)/voice-help" as any)} asChild>
          <Pressable style={styles.linkButton} accessibilityRole="button">
            <Ionicons name="help-circle" size={20} color={palette.primary} />
            <Text style={styles.linkText}>Voice Help Guide</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

function LocalProfileSection() {
  const palette = useAppPalette();
  const s = createStyles(palette);
  const { profile, setProfile } = useProfileLocal();
  const [name, setName] = useState(profile.name ?? "");
  const [contact, setContact] = useState(profile.contact ?? "");
  const [province, setProvince] = useState(profile.province ?? "");
  return (
    <View>
      <Text style={{ color: palette.text, opacity: 0.9, marginBottom: 6 }}>
        Name
      </Text>
      <TextInput
        style={s.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
      />
      <Text style={{ color: palette.text, opacity: 0.9, marginBottom: 6 }}>
        Contact (email/phone)
      </Text>
      <TextInput
        style={s.input}
        value={contact}
        onChangeText={setContact}
        placeholder="you@example.com"
      />
      <Text style={{ color: palette.text, opacity: 0.9, marginBottom: 6 }}>
        Province (e.g., ON, QC)
      </Text>
      <TextInput
        style={s.input}
        value={province}
        onChangeText={setProvince}
        placeholder="ON"
        autoCapitalize="characters"
        maxLength={2}
      />
      <Button
        title="Save"
        onPress={() => setProfile({ name, contact, province })}
      />
    </View>
  );
}

function WellnessPrefsSection() {
  const palette = useAppPalette();
  const s = createStyles(palette);
  const [tap, setTap] = React.useState<'details'|'editor'>('details');
  const [backdate, setBackdate] = React.useState(true);
  React.useEffect(() => {
    (async () => {
      try {
        const val = await AsyncStorage.getItem('reflections.tapAction'); if (val==='details'||val==='editor') setTap(val as any);
        const b = await AsyncStorage.getItem('reflections.useServerBackdate'); setBackdate(b!=='0');
      } catch {}
    })();
  }, []);
  const save = async (next: 'details'|'editor') => { setTap(next); try { await AsyncStorage.setItem('reflections.tapAction', next); } catch {} };
  const saveBackdate = async (val: boolean) => { setBackdate(val); try { await AsyncStorage.setItem('reflections.useServerBackdate', val? '1':'0'); } catch {} };
  return (
    <View>
      <Text style={s.rowLabel}>Reflections Calendar: default tap action</Text>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
        <Button title={`Details ${tap==='details'?'✓':''}`} onPress={()=> save('details')} />
        <Button title={`Editor ${tap==='editor'?'✓':''}`} onPress={()=> save('editor')} />
      </View>
      <View style={{ height: 10 }} />
      <Text style={s.rowLabel}>Backdate via server (when adding past days)</Text>
      <Button title={backdate? 'Disable backdating' : 'Enable backdating'} onPress={()=> saveBackdate(!backdate)} />
      <Text style={{ color: palette.text, opacity: 0.8, marginTop: 6 }}>Tip: You can still change this from inside the calendar.</Text>
    </View>
  );
}

function MediaLockerSection() {
  const palette = useAppPalette();
  const s = createStyles(palette);
  const [thumbs, setThumbs] = React.useState(true);
  React.useEffect(()=>{ (async()=>{ try { const v = await AsyncStorage.getItem('locker.videoThumbnails'); setThumbs(v!=='0'); } catch {} })(); },[]);
  const save = async (val: boolean) => { setThumbs(val); try { await AsyncStorage.setItem('locker.videoThumbnails', val? '1':'0'); } catch {} };
  return (
    <View>
      <Text style={s.rowLabel}>Video thumbnails (cloud videos)</Text>
      <Button title={thumbs? 'Disable thumbnails' : 'Enable thumbnails'} onPress={()=> save(!thumbs)} />
      <Text style={{ color: palette.text, opacity: 0.8, marginTop: 6 }}>When enabled, the app may request thumbnails from YouTube or an optional server (if configured).</Text>
    </View>
  );
}

function EnhancedPrivacySection() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const { state, setPasscode, setLockWellness, setAnalyticsEnabled, setErrorReportingEnabled } = usePrivacy();
  const {
    requirePasscodeOnLaunch,
    setRequirePasscodeOnLaunch,
    autoLockTimeout,
    setAutoLockTimeout,
    analyticsOptOut,
    setAnalyticsOptOut,
  } = useSettings();

  const onExport = async () => {
    const bundle = await exportBackup();
    if (!bundle) return Alert.alert("Export failed", "Storage unavailable.");
    try {
      const FS = await import("expo-file-system");
      const path = FS.cacheDirectory + `empowr_backup_${Date.now()}.json`;
      await FS.writeAsStringAsync(path, JSON.stringify(bundle, null, 2));
      const Share = await import("expo-sharing");
      if (Share?.isAvailableAsync && (await Share.isAvailableAsync())) {
        await Share.shareAsync(path);
      } else {
        Alert.alert("Backup ready", "Backup file saved to cache.");
      }
    } catch {
      Alert.alert("Export failed", "Could not create file.");
    }
  };

  const onImport = async () => {
    try {
      const Doc = await import("expo-document-picker");
      const res = await Doc.getDocumentAsync({ type: "application/json" });
      if (res.canceled || !res.assets?.length) return;
      const uri = res.assets[0].uri;
      const FS = await import("expo-file-system");
      const raw = await FS.readAsStringAsync(uri);
      const ok = await importBackup(JSON.parse(raw));
      Alert.alert(
        ok ? "Imported" : "Import failed",
        ok ? "Backup restored." : "Could not restore backup.",
      );
    } catch {
      Alert.alert("Import failed", "Unable to read backup file.");
    }
  };

  const onClear = async () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your local app data. This cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            const ok = await clearAllData();
            Alert.alert(
              ok ? "Cleared" : "Failed",
              ok ? "Local app data cleared." : "Unable to clear data.",
            );
          },
        },
      ]
    );
  };

  return (
    <View>
      <AccessibilityToggle
        title={t("settings.privacy.passcode", "Require Passcode on Launch")}
        description={t("settings.privacy.passcodeDesc", "Lock app with passcode")}
        value={requirePasscodeOnLaunch}
        onValueChange={setRequirePasscodeOnLaunch}
        icon="lock-closed"
        testID="passcode-toggle"
      />

      <View style={styles.autoLockSection}>
        <Text style={styles.sectionSubtitle} accessibilityRole="header">
          {t("settings.privacy.autoLock", "Auto-Lock Timeout")}
        </Text>
        <Text style={styles.description}>
          {t("settings.privacy.autoLockDesc", "Minutes before app locks")}
        </Text>
        <View style={styles.buttonRow}>
          {[1, 5, 15, 30].map((minutes) => (
            <Pressable
              key={minutes}
              style={[styles.button, autoLockTimeout === minutes && styles.buttonActive]}
              onPress={() => setAutoLockTimeout(minutes)}
              accessibilityRole="button"
              accessibilityState={{ selected: autoLockTimeout === minutes }}
              accessibilityLabel={`Set auto-lock to ${minutes} minutes`}
            >
              <Text style={[styles.buttonText, autoLockTimeout === minutes && styles.buttonTextActive]}>
                {minutes}m
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <AccessibilityToggle
        title={t("settings.privacy.analytics", "Opt Out of Analytics")}
        description={t("settings.privacy.analyticsDesc", "Don't share usage data")}
        value={analyticsOptOut}
        onValueChange={setAnalyticsOptOut}
        icon="analytics"
        testID="analytics-toggle"
      />

      <AccessibilityToggle
        title="Error Reporting"
        description="Help improve the app by sharing crash reports"
        value={state.errorReportingEnabled}
        onValueChange={setErrorReportingEnabled}
        icon="bug"
        testID="error-reporting-toggle"
      />

      <View style={styles.backupSection}>
        <Text style={styles.sectionSubtitle} accessibilityRole="header">
          Data Management
        </Text>
        
        <View style={styles.passcodeSection}>
          <Text style={styles.rowLabel}>Set/Change Passcode</Text>
          <TextInput
            style={styles.input}
            placeholder="New passcode"
            secureTextEntry
            onSubmitEditing={(e) => setPasscode(e.nativeEvent.text || undefined)}
            accessibilityLabel="New passcode"
            accessibilityHint="Enter a new passcode for the app"
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          />
        </View>

        <AccessibilityToggle
          title="Wellness Lock"
          description="Require passcode to access wellness features"
          value={state.lockWellness}
          onValueChange={setLockWellness}
          icon="heart-outline"
          testID="wellness-lock-toggle"
        />

        <View style={styles.backupButtons}>
          <Pressable
            style={styles.backupButton}
            onPress={onExport}
            accessibilityRole="button"
            accessibilityLabel="Export backup"
            accessibilityHint="Create a backup file of your app data"
          >
            <Ionicons name="download" size={16} color={palette.primary} />
            <Text style={styles.backupButtonText}>Export Backup</Text>
          </Pressable>

          <Pressable
            style={styles.backupButton}
            onPress={onImport}
            accessibilityRole="button"
            accessibilityLabel="Import backup"
            accessibilityHint="Restore app data from a backup file"
          >
            <Ionicons name="cloud-upload" size={16} color={palette.primary} />
            <Text style={styles.backupButtonText}>Import Backup</Text>
          </Pressable>

          <Pressable
            style={[styles.backupButton, styles.dangerButton]}
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Clear all data"
            accessibilityHint="Permanently delete all local app data"
          >
            <Ionicons name="trash" size={16} color={palette.error} />
            <Text style={[styles.backupButtonText, styles.dangerButtonText]}>Clear All Data</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function TermsSection() {
  const openTerms = () => {
    Linking.openURL("https://empowr.app/terms").catch(() => {});
  };
  const reset = async () => {
    try {
      await AsyncStorage.removeItem("empowr.terms.accepted.v1");
      Alert.alert("Reset", "You will be asked to accept Terms on next launch.");
    } catch {}
  };
  return (
    <View>
      <Button title="View Terms" onPress={openTerms} />
      <View style={{ height: 8 }} />
      <Button title="Require re-acceptance" onPress={reset} />
    </View>
  );
}

function AdminSection() {
  const { isAdmin, refreshClaims } = useAuth();
  const palette = useAppPalette();
  return (
    <View>
      <Text style={{ color: palette.text, opacity: 0.9, marginBottom: 6 }}>
        Status: {isAdmin ? "Admin" : "Standard user"}
      </Text>
      <Button title="Refresh admin status" onPress={refreshClaims} />
      {isAdmin && (
        <View style={{ marginTop: 8 }}>
          <Link href={"/(tabs)/admin" as any}>
            <Text style={{ color: palette.primary, fontWeight: "700" }}>Open Admin Panel</Text>
          </Link>
        </View>
      )}
    </View>
  );
}

function Section({
  title,
  subtitle,
  children,
  styles,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.sectionSubtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: {
      fontSize: Math.round(24 * factor),
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    section: {
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.muted,
    },
    sectionTitle: { 
      color: palette.text, 
      fontWeight: "700", 
      fontSize: Math.round(18 * factor),
      marginBottom: 4,
    },
    sectionSubtitle: {
      color: palette.text,
      fontSize: Math.round(14 * factor),
      opacity: 0.7,
      marginBottom: 16,
      lineHeight: Math.round(20 * factor),
    },
    description: {
      color: palette.text,
      fontSize: Math.round(14 * factor),
      opacity: 0.8,
      marginBottom: 12,
      lineHeight: Math.round(20 * factor),
    },
    rowLabel: {
      color: palette.text,
      opacity: 0.9,
      marginTop: 10,
      marginBottom: 6,
      fontSize: Math.round(14 * factor),
    },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      color: palette.text,
      fontSize: Math.round(14 * factor),
      minHeight: 44, // WCAG minimum tap target
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
      alignSelf: "center",
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
      alignSelf: "center",
      backgroundColor: palette.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    emergencyButton: {
      backgroundColor: palette.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 8,
      marginTop: 8,
      minHeight: 44,
    },
    emergencyButtonText: {
      color: "white",
      fontSize: Math.round(16 * factor),
      fontWeight: "600",
      marginLeft: 8,
    },
    textSizeSection: {
      marginTop: 16,
      padding: 16,
      backgroundColor: palette.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    formatSection: {
      marginTop: 16,
      padding: 16,
      backgroundColor: palette.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    voiceHelpSection: {
      marginTop: 16,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    button: {
      backgroundColor: palette.card,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: palette.muted,
      minHeight: 44,
      minWidth: 60,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    buttonText: {
      color: palette.text,
      fontSize: Math.round(14 * factor),
      fontWeight: "500",
    },
    buttonTextActive: {
      color: "white",
    },
    linkButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      backgroundColor: palette.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.primary,
      minHeight: 44,
    },
    linkText: {
      color: palette.primary,
      fontSize: Math.round(14 * factor),
      fontWeight: "600",
      marginLeft: 8,
    },
    autoLockSection: {
      marginTop: 8,
      marginBottom: 8,
    },
    backupSection: {
      marginTop: 16,
      padding: 16,
      backgroundColor: palette.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    passcodeSection: {
      marginBottom: 16,
    },
    backupButtons: {
      marginTop: 16,
      gap: 8,
    },
    backupButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderWidth: 1,
      borderColor: palette.primary,
      borderRadius: 8,
      minHeight: 44,
    },
    backupButtonText: {
      color: palette.primary,
      fontSize: Math.round(14 * factor),
      fontWeight: "500",
      marginLeft: 8,
    },
    dangerButton: {
      borderColor: palette.error,
    },
    dangerButtonText: {
      color: palette.error,
    },
  });
}
