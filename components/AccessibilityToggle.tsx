import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MAX_FONT_SCALE } from "../hooks/useA11y";
import { useTextScale } from "../theme/typography";
import { useAppPalette } from "../theme/usePalette";

type AccessibilityToggleProps = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  testID?: string;
};

export default function AccessibilityToggle({
  title,
  description,
  value,
  onValueChange,
  icon,
  testID,
}: AccessibilityToggleProps) {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={title}
      accessibilityHint={description}
      testID={testID}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons 
              name={icon} 
              size={20} 
              color={value ? palette.primary : palette.text} 
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {title}
          </Text>
          <Text style={styles.description} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {description}
          </Text>
        </View>
        <View style={styles.switchContainer}>
          <View style={[styles.switch, value && styles.switchActive]}>
            <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: palette.muted,
      minHeight: 44, // WCAG minimum tap target
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: Math.round(16 * factor),
      fontWeight: "600",
      color: palette.text,
      marginBottom: 2,
    },
    description: {
      fontSize: Math.round(13 * factor),
      color: palette.text,
      opacity: 0.7,
      lineHeight: Math.round(18 * factor),
    },
    switchContainer: {
      marginLeft: 12,
    },
    switch: {
      width: 44,
      height: 24,
      borderRadius: 12,
      backgroundColor: palette.muted,
      justifyContent: "center",
      padding: 2,
    },
    switchActive: {
      backgroundColor: palette.primary,
    },
    switchThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "white",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    switchThumbActive: {
      alignSelf: "flex-end",
    },
  });
}