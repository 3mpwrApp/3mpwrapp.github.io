import { SafeAreaView, Text, StyleSheet, useColorScheme } from "react-native";
import { colors, type Palette } from "../theme/colors";

export default function ThemedFooter() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
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
      paddingVertical: 12,
    },
    text: {
      color: palette.muted,
      fontSize: 12,
      textAlign: "center",
    },
  });
}
