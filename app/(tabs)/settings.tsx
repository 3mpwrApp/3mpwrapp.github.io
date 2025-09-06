import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Button,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // dY"1 new
import { useAppPalette } from "../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import { useTranslation } from "../../i18n";
import { useSettings } from "../../store/settings";
import type { ProvinceCode } from "../../types/models";

import { useAuth } from "../../context/AuthContext";
import { db, storage } from "../../firebase/config"; // dY"1 storage import
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // dY"1 for file upload

const PROVINCES: ProvinceCode[] = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT",
];

export default function SettingsScreen() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Settings");
  useFocusOnRefOnMount(titleRef);

  const { setLanguage } = useTranslation();
  const {
    highContrast, setHighContrast,
    textScale, setTextScale,
    province, setProvince,
    includeProvincialHolidays, setIncludeProvincialHolidays,
    youtubeOpenPreference, setYoutubeOpenPreference,
  } = useSettings();

  // dY"1 Profile state
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

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
        setLoadingProfile(false);
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

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

      {/* dY"1 Keep rest of your settings */}
      {/* ... existing Display, Language, Region, Links sections ... */}
    </ScrollView>
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

