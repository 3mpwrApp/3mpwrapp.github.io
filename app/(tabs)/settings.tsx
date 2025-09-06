import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Alert, Image } from "react-native";
import { useAppPalette } from "../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../hooks/useA11y";
// import { useTranslation } from "../../i18n";
// import { useSettings } from "../../store/settings";

import { useAuth } from "../../context/AuthContext";
import { db, storage } from "../../firebase/config"; // dY"1 storage import
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // dY"1 for file upload
import { useProfileLocal } from "../../store/profileLocal";
import { exportBackup, importBackup, clearAllData } from "../../services/backup";
import { usePrivacy } from "../../store/privacy";

export default function SettingsScreen() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Settings");
  useFocusOnRefOnMount(titleRef);

  // const { setLanguage } = useTranslation();
  // const settings = useSettings();

  // dY"1 Profile state
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  // const [loadingProfile, setLoadingProfile] = useState(true);

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
        console.error("Error fetching profile:", err.message);
      } finally {
        // no-op
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

  // dY"1 Upload new profile picture
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
    } catch (e) {
      Alert.alert(
        "Image Picker Unavailable",
        "Please rebuild the Android app to include expo-image-picker (npx expo run:android)."
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      accessibilityLabel="Settings screen"
      accessible
    >
      <Text
        ref={titleRef}
        nativeID="settings-title"
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Settings
      </Text>

      {/* dY"1 Profile section */}
      <Section title="Profile" styles={styles}>
        {photoURL ? (
          <Image
            source={{ uri: photoURL }}
            style={styles.avatar}
            accessibilityLabel="Profile picture"
          />
        ) : (
          <Text>No profile picture</Text>
        )}
        <Button title="Change Profile Picture" onPress={handleUploadPhoto} />

        <Text style={styles.rowLabel}>Display Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter display name"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <Button title="Update Name" onPress={handleUpdateDisplayName} />
      </Section>

      {/* Local profile for templates */}
      <Section title="Local Profile (for templates)" styles={styles}>
        <LocalProfileSection />
      </Section>

      {/* Privacy & Backups */}
      <Section title="Privacy & Backups" styles={styles}>
        <PrivacyBackupSection />
      </Section>
    </ScrollView>
  );
}

function LocalProfileSection() {
  const palette = useAppPalette();
  const { profile, setProfile } = useProfileLocal();
  const [name, setName] = useState(profile.name ?? "");
  const [contact, setContact] = useState(profile.contact ?? "");
  const [province, setProvince] = useState(profile.province ?? "");
  return (
    <View>
      <Text style={{ color: palette.text, opacity: 0.9, marginBottom: 6 }}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />
      <Text style={{ color: palette.text, opacity: 0.9, marginBottom: 6 }}>Contact (email/phone)</Text>
      <TextInput style={styles.input} value={contact} onChangeText={setContact} placeholder="you@example.com" />
      <Text style={{ color: palette.text, opacity: 0.9, marginBottom: 6 }}>Province (e.g., ON, QC)</Text>
      <TextInput style={styles.input} value={province} onChangeText={setProvince} placeholder="ON" autoCapitalize="characters" maxLength={2} />
      <Button title="Save" onPress={() => setProfile({ name, contact, province })} />
    </View>
  );
}

function PrivacyBackupSection() {
  const { state, setPasscode, setLockWellness } = usePrivacy();
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
      Alert.alert(ok ? "Imported" : "Import failed", ok ? "Backup restored." : "Could not restore backup.");
    } catch {
      Alert.alert("Import failed", "Unable to read backup file.");
    }
  };
  const onClear = async () => {
    const ok = await clearAllData();
    Alert.alert(ok ? "Cleared" : "Failed", ok ? "Local app data cleared." : "Unable to clear data.");
  };
  return (
    <View>
      <Text style={styles.rowLabel}>Set/Change Passcode</Text>
      <TextInput style={styles.input} placeholder="New passcode" secureTextEntry onSubmitEditing={(e) => setPasscode(e.nativeEvent.text || undefined)} />
      <View style={{ height: 8 }} />
      <Button title={state.lockWellness ? "Disable Wellness Lock" : "Enable Wellness Lock"} onPress={() => setLockWellness(!state.lockWellness)} />
      <View style={{ height: 12 }} />
      <Button title="Export backup" onPress={onExport} />
      <View style={{ height: 8 }} />
      <Button title="Import backup" onPress={onImport} />
      <View style={{ height: 8 }} />
      <Button title="Clear all local data" onPress={onClear} />
    </View>
  );
}

function Section({ title, children, styles }: { title: string; children: React.ReactNode; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
    section: { paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.muted },
    sectionTitle: { color: palette.text, fontWeight: "700", marginBottom: 8 },
    rowLabel: { color: palette.text, opacity: 0.9, marginTop: 10, marginBottom: 6 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      padding: 10,
      borderRadius: 6,
      marginBottom: 10,
      color: palette.text,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
      alignSelf: "center",
    },
  });
}

