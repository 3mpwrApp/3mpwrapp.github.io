import { SafeAreaView, Text, StyleSheet, useColorScheme } from "react-native";
import { colors, type Palette } from "../theme/colors";

export default function ThemedFooter() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);

  return (
    <SafeAreaView style={styles.container} accessibilityRole="text">
      <Text style={styles.text}>Empowr</Text>
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
