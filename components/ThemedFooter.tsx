import { SafeAreaView, Text, StyleSheet } from "react-native";

import { type Palette } from "../theme/colors";
import { useAppPalette } from "../theme/usePalette";

export default function ThemedFooter() {
  const palette = useAppPalette();
  const styles = createStyles(palette);

  const year = new Date().getFullYear();
  return (
    <SafeAreaView
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`Footer. Empowr, ${year}`}
    >
      <Text style={styles.text} numberOfLines={1}>{"\u00A9 "}{year} Empowr</Text>
    </SafeAreaView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.muted,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    text: {
      color: palette.text,
      opacity: 1,
      fontSize: 14,
      textAlign: "center",
    },
  });
}

