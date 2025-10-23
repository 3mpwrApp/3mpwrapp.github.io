import { Platform, StyleSheet, Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Palette } from "../theme/colors";
import { useAppPalette } from "../theme/usePalette";

export default function ThemedFooter() {
  const palette = useAppPalette();
  const styles = createStyles(palette);

  const year = new Date().getFullYear();
  return (
    <SafeAreaView
      style={[styles.container, Platform.OS === 'web' ? styles.webOnly : null]}
      accessibilityRole="text"
      accessibilityLabel={`Footer. 3mpwr App, ${year}`}
    >
      <Text style={styles.text} numberOfLines={1}>{"\u00A9 "}{year} 3mpwr App</Text>
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
    webOnly: {
      // On web we can allow it to behave like a footer at the bottom
      position: 'absolute' as any, // sticky not supported in RN types but works on web
      bottom: 0,
    },
    text: {
      color: palette.text,
      opacity: 1,
      fontSize: 14,
      textAlign: "center",
    },
  });
}

