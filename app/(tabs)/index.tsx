import React from "react";
import { View, Text, StyleSheet, useColorScheme, Pressable } from "react-native";
import { Link } from "expo-router";
import { colors, type Palette } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";

export default function TabsHome() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Home");
  useFocusOnRefOnMount(titleRef);

  return (
    <View style={styles.container} accessibilityLabel="Home screen" accessible>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Welcome to Empowr
      </Text>
      <Text style={styles.subtitle}>Support. Advocacy. Empowerment.</Text>
      {/* Keep Home minimal; tabs below handle navigation */}
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: palette.background, justifyContent: "center" },
    title: { fontSize: 28, fontWeight: "800", marginBottom: 8, color: palette.text, textAlign: "center" },
    subtitle: { fontSize: 16, color: palette.muted, textAlign: "center" },
    row: { flexDirection: "row", gap: 12, justifyContent: "center", marginTop: 8 },
    chip: { backgroundColor: palette.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, minHeight: 44, alignItems: "center", justifyContent: "center" },
    chipText: { color: palette.onPrimary, fontSize: 14, fontWeight: "700" },
  });
}
