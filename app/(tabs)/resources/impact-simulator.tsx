import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export default function ImpactSimulator() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Impact Simulator");
  useFocusOnRefOnMount(titleRef);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Impact Simulator
      </Text>
      <Text style={styles.subtitle}>
        Data-driven empathy: simulate how changes in law or workplace policy could affect real disabled/injured people.
        Configure scenarios, then view estimated impacts across income, timelines, appeals, and health outcomes.
      </Text>
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Sample Scenarios</Text>
        <Text style={styles.text}>• Adjust benefit rates or waiting periods</Text>
        <Text style={styles.text}>• Introduce/withdraw accommodations</Text>
        <Text style={styles.text}>• Change documentation or appeal thresholds</Text>
      </View>
      <Pressable
        onPress={() => Alert.alert("Coming soon", "Interactive simulator UI is in development.")}
        accessibilityRole="button"
        accessibilityLabel="Start simulation"
        style={styles.cta}
      >
        <Text style={styles.ctaText}>Start Simulation (Preview)</Text>
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

