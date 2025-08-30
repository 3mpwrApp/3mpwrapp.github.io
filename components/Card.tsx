import React from "react";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, type Palette } from "../theme/colors";

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPressRight?: () => void;
  rightA11yLabel?: string;
  testID?: string;
  accessibilityLabel?: string;
};

export default function Card({ title, subtitle, onPress, rightIcon = "chevron-forward", onPressRight, rightA11yLabel, testID, accessibilityLabel }: Props) {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      testID={testID}
    >
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onPressRight ? (
        <Pressable
          onPress={onPressRight}
          accessibilityRole="button"
          accessibilityLabel={rightA11yLabel ?? "Actions"}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.rightAction, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name={rightIcon} size={20} color={palette.muted} />
        </Pressable>
      ) : (
          <Ionicons name={rightIcon} size={20} color={palette.muted} />
      )}
    </Pressable>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: palette.background,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
      minHeight: 56,
    },
    textWrap: { flex: 1, paddingEnd: 12 },
    title: { color: palette.text, fontSize: 16, fontWeight: "600" },
    subtitle: { color: palette.text, opacity: 0.9, fontSize: 14, marginTop: 2 },
    rightAction: { paddingStart: 8 },
  });
}
