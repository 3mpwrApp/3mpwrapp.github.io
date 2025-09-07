import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export default function AdvocacyScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Advocacy");
  useFocusOnRefOnMount(titleRef);

  return (
    <View style={styles.container} accessibilityLabel="Advocacy screen" accessible>
      <Text ref={titleRef} nativeID="advocacy-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Advocacy Directory
      </Text>
      <Text style={styles.subtitle}>
        We’re building a directory of trusted advocates and organizations to help with claims, appeals, and workplace issues.
      </Text>
      <Text style={styles.subtitle}>
        You’ll be able to browse by province, issue type, and availability. Have a suggestion? Email empowrapp08162025@gmail.com
      </Text>
      <Text style={[styles.subtitle, { opacity: 0.8 }]}>Coming soon.</Text>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: Math.round(16 * factor), color: palette.text, opacity: 0.95, marginBottom: 8 },
  });
}

