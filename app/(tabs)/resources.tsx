import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { colors } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";

export default function ResourcesScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Resources");
  useFocusOnRefOnMount(titleRef);
  return (
    <View style={styles.container} accessibilityLabel="Resources screen" accessible>
      <Text ref={titleRef} nativeID="resources-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Resources
      </Text>
      <Text style={styles.subtitle}>Find helpful guides and materials.</Text>
    </View>
  );
}

function createStyles(palette: typeof colors.light) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: 16, color: palette.muted },
  });
}
