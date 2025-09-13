import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, type Palette } from "../theme/colors";
import { useTextScale } from "../theme/typography";
import { useSettings } from "../store/settings";

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPressRight?: () => void;
  rightA11yLabel?: string;
  testID?: string;
  accessibilityLabel?: string;
  left?: React.ReactNode;
};

export default function Card({
  title,
  subtitle,
  onPress,
  onLongPress,
  rightIcon = "chevron-forward",
  onPressRight,
  rightA11yLabel,
  testID,
  accessibilityLabel,
  left,
}: Props) {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const { factor } = useTextScale();
  const { dyslexiaFriendly } = useSettings();
  const styles = React.useMemo(
    () => createStyles(palette, factor, dyslexiaFriendly),
    [palette, factor, dyslexiaFriendly],
  );

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      testID={testID}
    >
      {!!left && <View style={styles.leftWrap}>{left}</View>}
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
          style={({ pressed }) => [
            styles.rightAction,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Ionicons name={rightIcon} size={20} color={palette.muted} />
        </Pressable>
      ) : (
        <Ionicons name={rightIcon} size={20} color={palette.muted} />
      )}
    </Pressable>
  );
}

function createStyles(palette: Palette, factor: number, dyslexia: boolean) {
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
      minHeight: 60,
    },
    textWrap: { flex: 1, paddingEnd: 12 },
    leftWrap: { marginEnd: 12 },
    title: {
      color: palette.text,
      fontSize: Math.round(16 * factor),
      fontWeight: "600",
      letterSpacing: dyslexia ? 0.5 : 0,
      lineHeight: Math.round(20 * factor),
    },
    subtitle: {
      color: palette.text,
      opacity: 1,
      fontSize: Math.round(14 * factor),
      marginTop: 2,
      letterSpacing: dyslexia ? 0.25 : 0,
      lineHeight: Math.round(18 * factor),
    },
    rightAction: { paddingStart: 8 },
  });
}
