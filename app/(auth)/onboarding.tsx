import React from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable } from "react-native";
import { colors, type Palette } from "../../theme/colors";
import { useAuth } from "../../store/auth";

export default function Onboarding() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const { completeOnboarding } = useAuth();

  return (
    <View style={styles.container} accessibilityLabel="Onboarding screen" accessible>
      <Text style={styles.title}>Welcome to Empowr</Text>
      <Text style={styles.subtitle}>Your hub for support, education, advocacy, and podcasts.</Text>

      <View style={styles.actions}>
        <Pressable onPress={completeOnboarding} style={styles.cta} accessibilityRole="button" accessibilityLabel="Get started">
          <Text style={styles.ctaText}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: palette.background, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 28, fontWeight: "800", marginBottom: 8, color: palette.text, textAlign: "center" },
    subtitle: { fontSize: 16, color: palette.muted, textAlign: "center", marginBottom: 24 },
    actions: { flexDirection: "row", gap: 12 },
    cta: { backgroundColor: palette.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
    ctaText: { color: palette.onPrimary, fontWeight: "700", fontSize: 16 },
  });
}

