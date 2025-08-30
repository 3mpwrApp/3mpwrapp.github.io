import React from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable, ScrollView } from "react-native";
import { colors, type Palette } from "../../theme/colors";
import { useAuth } from "../../store/auth";
import type { ProvinceCode } from "../../types/models";

export default function Onboarding() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const { completeOnboarding, setProvince, state } = useAuth();
  const [selected, setSelected] = React.useState<ProvinceCode | undefined>(state.province);

  return (
    <View style={styles.container} accessibilityLabel="Onboarding screen" accessible>
      <Text style={styles.title}>Welcome to Empowr</Text>
      <Text style={styles.subtitle}>Your hub for support, education, advocacy, and podcasts.</Text>
      <Text style={[styles.subtitle, { marginTop: 8 }]}>Select your province or territory:</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {(["ON","QC","BC","AB","MB","SK","NS","NB","NL","PE","NT","YT","NU"] as ProvinceCode[]).map((code) => (
          <Pressable key={code} onPress={() => setSelected(code)} style={[styles.chip, selected===code && styles.chipActive]} accessibilityRole="button" accessibilityLabel={`Select ${code}`}>
            <Text style={[styles.chipText, selected===code && styles.chipTextActive]}>{code}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable onPress={async ()=>{ if(selected){ await setProvince(selected);} await completeOnboarding(); }} disabled={!selected} style={[styles.cta, !selected && { opacity: 0.5 }]} accessibilityRole="button" accessibilityLabel="Get started">
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
    actions: { flexDirection: "row", gap: 12, marginTop: 12 },
    cta: { backgroundColor: palette.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
    ctaText: { color: palette.onPrimary, fontWeight: "700", fontSize: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", paddingVertical: 8 },
    chip: { borderWidth: 1, borderColor: palette.muted, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    chipText: { color: palette.text, fontWeight: "700" },
    chipTextActive: { color: palette.onPrimary },
  });
}
