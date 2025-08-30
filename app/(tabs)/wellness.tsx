import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { colors, type Palette } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";

export default function WellnessScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Wellness");
  useFocusOnRefOnMount(titleRef);
  return (
    <View style={styles.container} accessibilityLabel="Wellness screen" accessible>
      <Text ref={titleRef} nativeID="wellness-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Wellness
      </Text>
      <Text style={styles.subtitle}>Tools and tips for wellbeing.</Text>
      <View style={styles.tip} accessible accessibilityLabel="Tip one">
        <Text style={styles.tipTitle}>Daily breathing</Text>
        <Text style={styles.tipText}>Try 4-7-8 breathing for 1 minute.</Text>
      </View>
      <View style={styles.tip} accessible accessibilityLabel="Tip two">
        <Text style={styles.tipTitle}>Short walk</Text>
        <Text style={styles.tipText}>Take a 10 minute walk outside.</Text>
      </View>
      <View style={styles.tip} accessible accessibilityLabel="Tip three">
        <Text style={styles.tipTitle}>Gratitude</Text>
        <Text style={styles.tipText}>Write down one thing you’re grateful for.</Text>
      </View>
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: 17, color: palette.text, opacity: 0.9, marginBottom: 12 },
    tip: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    tipTitle: { color: palette.text, fontWeight: "600", marginBottom: 4 },
    tipText: { color: palette.text, opacity: 0.9 },
  });
}
