import { SafeAreaView, Text, StyleSheet, useColorScheme } from "react-native";
import { colors } from "../theme/colors";

export default function ThemedHeader() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);

  return (
    <SafeAreaView style={styles.container} accessibilityRole="header">
      <Text style={styles.title}>Empowr</Text>
    </SafeAreaView>
  );
}

function createStyles(palette: typeof colors.light) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      color: palette.text,
      fontSize: 20,
      fontWeight: "700",
    },
  });
}
