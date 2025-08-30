import { SafeAreaView, Text, StyleSheet, useColorScheme } from "react-native";
import { type Palette } from "../theme/colors";
import { usePalette } from "../theme/usePalette";

export default function ThemedFooter() {
  const palette = usePalette();
  const styles = createStyles(palette);

  const year = new Date().getFullYear();
  return (
    <SafeAreaView style={styles.container} accessibilityRole="text" accessibilityLabel={`Footer. Empowr, ${year}`}>
      <Text style={styles.text}>© {year} Empowr</Text>
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
      opacity: 0.88,
      fontSize: 14,
      fontFamily: "Roboto",
      textAlign: "center",
    },
  });
}
