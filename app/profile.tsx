import React from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { type Palette } from "../theme/colors";
import { useAppPalette } from "../theme/usePalette";
import { useA11ySettings } from "../store/a11ySettings";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import type { Href } from "expo-router";
import { useTranslation, Lang } from "../i18n";

export default function Profile() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const { user, signOut } = useAuth();
  const { lang, setLanguage } = useTranslation();
  const [name, setName] = React.useState(user?.displayName ?? "");
  const { state: a11y, toggleHighContrast } = useA11ySettings();

  return (
    <View style={styles.container} accessibilityLabel="Profile screen" accessible>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Row label="User" value={user?.email ?? user?.displayName ?? "Guest"} />
      </View>

      <View style={styles.card}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Accessibility</Text>
        <Pressable
          onPress={toggleHighContrast}
          accessibilityRole="button"
          accessibilityLabel="Toggle high contrast mode"
          style={({ pressed }) => [styles.cta, styles.ghost, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.ghostText}>{a11y.highContrast ? "Disable High Contrast" : "Enable High Contrast"}</Text>
        </Pressable>
      </View>

      {/* Notifications test removed at user's request */}

      <View style={styles.card}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Language</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["en", "fr", "es"] as Lang[]).map((code) => (
            <Pressable
              key={code}
              onPress={() => setLanguage(code)}
              style={[styles.langChip, lang === code && styles.langChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Switch language to ${code}`}
            >
              <Text style={[styles.langChipText, lang === code && styles.langChipTextActive]}>{code.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {user ? (
        <>
          <Text style={styles.label}>Update name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={palette.muted}
            accessibilityLabel="Name"
          />
          <Pressable style={[styles.cta, styles.ghost]} onPress={signOut} accessibilityRole="button" accessibilityLabel="Sign out">
            <Text style={styles.ghostText}>Sign out</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable style={[styles.cta, styles.primary]} onPress={() => router.push("/(auth)/login" as Href)} accessibilityRole="button" accessibilityLabel="Go to login">
            <Text style={styles.primaryText}>Sign in</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
      <Text style={{ fontWeight: "600" }}>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "800", color: palette.text, marginBottom: 16 },
    card: { backgroundColor: palette.surface, borderColor: palette.muted, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 16, marginBottom: 16 },
    label: { color: palette.muted, marginBottom: 6 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: palette.text, marginBottom: 12 },
    cta: { paddingVertical: 12, borderRadius: 12, alignItems: "center", marginTop: 8 },
    primary: { backgroundColor: palette.primary },
    primaryText: { color: palette.onPrimary, fontWeight: "700" },
    ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: palette.muted },
    ghostText: { color: palette.text, fontWeight: "700" },
    langChip: { borderWidth: 1, borderColor: palette.muted, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
    langChipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    langChipText: { color: palette.text, fontWeight: "700" },
    langChipTextActive: { color: palette.onPrimary },
  });
}
