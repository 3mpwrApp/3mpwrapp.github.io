import React from "react";
import { View, Text, StyleSheet, Pressable, TextInput, useColorScheme } from "react-native";
import { colors, type Palette } from "../theme/colors";
import { useAuth } from "../store/auth";
import { router } from "expo-router";
import { useTranslation, Lang } from "../i18n";

export default function Profile() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const { state, signIn, continueAnonymously, signOut } = useAuth();
  const { lang, setLanguage } = useTranslation();
  const [name, setName] = React.useState(state.user?.name ?? "");

  return (
    <View style={styles.container} accessibilityLabel="Profile screen" accessible>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Row label="Status" value={state.status} />
        <Row label="Onboarded" value={state.isOnboarded ? "Yes" : "No"} />
        <Row label="User" value={state.user?.name ?? "Guest"} />
      </View>

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

      {state.status === "signedIn" ? (
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
          <Pressable style={[styles.cta, styles.primary]} onPress={() => signIn(name || undefined)} accessibilityRole="button" accessibilityLabel="Save name">
            <Text style={styles.primaryText}>Save</Text>
          </Pressable>

          <Pressable style={[styles.cta, styles.ghost]} onPress={signOut} accessibilityRole="button" accessibilityLabel="Sign out">
            <Text style={styles.ghostText}>Sign out</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable style={[styles.cta, styles.primary]} onPress={() => router.push("/(auth)/login")} accessibilityRole="button" accessibilityLabel="Go to login">
            <Text style={styles.primaryText}>Sign in</Text>
          </Pressable>
          <Pressable style={[styles.cta, styles.ghost]} onPress={continueAnonymously} accessibilityRole="button" accessibilityLabel="Continue as guest">
            <Text style={styles.ghostText}>Continue as Guest</Text>
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
