import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export default function JusticeAsAService() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Justice-as-a-Service");
  useFocusOnRefOnMount(titleRef);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Justice-as-a-Service
      </Text>
      <Text style={styles.subtitle}>
        Generate anonymized, aggregate reports that highlight real barriers faced by disabled and injured people —
        tailored for advocacy groups, unions, journalists, and researchers.
      </Text>
      <View style={styles.block}>
        <Text style={styles.blockTitle}>How it works</Text>
        <Text style={styles.text}>• Privacy-first: data is anonymized and aggregated.</Text>
        <Text style={styles.text}>• Opt-in: only users who consent are included.</Text>
        <Text style={styles.text}>• Actionable outputs: heatmaps, timelines, and trends.</Text>
      </View>
      <Pressable
        onPress={() => Alert.alert("Beta", "Report generation is in private beta. Coming soon.")}
        accessibilityRole="button"
        accessibilityLabel="Request anonymized report"
        style={styles.cta}
      >
        <Text style={styles.ctaText}>Request Anonymized Report (Beta)</Text>
      </Pressable>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 6 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12 },
    block: { marginTop: 6, marginBottom: 12 },
    blockTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    text: { color: palette.text, marginBottom: 4 },
    cta: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 8,
    },
    ctaText: { color: palette.onPrimary, fontWeight: "700" },
  });
}

