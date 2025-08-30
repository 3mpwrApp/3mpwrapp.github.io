import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable, useColorScheme } from "react-native";
import { colors, type Palette } from "../../theme/colors";
import { useAuth } from "../../store/auth";
import { router } from "expo-router";

export default function Login() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const { signIn, continueAnonymously, state } = useAuth();
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (state.status === "signedIn" || state.status === "anonymous") {
      router.replace("/(tabs)");
    }
  }, [state.status]);

  return (
    <View style={styles.container} accessibilityLabel="Login screen" accessible>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>Use your name for a quick demo sign-in, or continue as a guest.</Text>
      <Text style={[styles.subtitle, { marginBottom: 16 }]}>Enable notifications in system settings for updates.</Text>

      <TextInput
        placeholder="Your name"
        placeholderTextColor={palette.muted}
        value={name}
        onChangeText={setName}
        style={styles.input}
        accessibilityLabel="Name"
        returnKeyType="done"
      />

      <Pressable onPress={async () => { await signIn(name || undefined); router.replace("/(tabs)"); }} style={[styles.cta, { backgroundColor: palette.primary }]} accessibilityRole="button" accessibilityLabel="Sign in">
        <Text style={[styles.ctaText, { color: palette.onPrimary }]}>Sign in</Text>
      </Pressable>

      <Pressable onPress={async () => { await continueAnonymously(); router.replace("/(tabs)"); }} style={[styles.cta, styles.ghost]} accessibilityRole="button" accessibilityLabel="Continue as guest">
        <Text style={[styles.ctaText, { color: palette.text }]}>Continue as Guest</Text>
      </Pressable>
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: palette.background, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 24, fontWeight: "800", marginBottom: 6, color: palette.text },
    subtitle: { fontSize: 14, color: palette.muted, textAlign: "center", marginBottom: 12 },
    input: { width: "90%", maxWidth: 420, borderWidth: 1, borderColor: palette.muted, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: palette.text, marginBottom: 12 },
    cta: { width: "90%", maxWidth: 420, paddingVertical: 12, borderRadius: 12, alignItems: "center", marginTop: 8 },
    ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: palette.muted },
    ctaText: { fontWeight: "700", fontSize: 16 },
  });
}
