import React from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";

import { useTranslation } from "../i18n";
import { type Palette } from "../theme/colors";
import { useTextScale } from "../theme/typography";
import { useAppPalette } from "../theme/usePalette";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string; // custom placeholder (already localized upstream if provided)
  accessibilityLabel?: string; // custom accessibility label
  clearLabel?: string; // optional custom clear label
  testID?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  clearLabel,
  testID,
}: Props) {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const { t } = useTranslation();
  const finalPlaceholder = placeholder ?? t("common.search", "Search");
  const finalA11yLabel = accessibilityLabel ?? finalPlaceholder;
  const finalClearLabel = clearLabel ?? t("common.clearSearch", "Clear search");
  // In Jest or non-Expo environments, loading vector icons can fail. Fallback gracefully.
  let Ionicons: any = () => null;
  try {
    Ionicons = require("@expo/vector-icons").Ionicons;
  } catch {}
  const styles = React.useMemo(
    () => createStyles(palette, factor),
    [palette, factor],
  );

  const isWeb = Platform.OS === 'web';
  return (
    <View style={styles.container} accessibilityRole="search" testID={testID}>
      <Ionicons
        name="search"
        size={18}
        color={palette.text}
        style={{ marginHorizontal: 8, opacity: 0.8 }}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={finalPlaceholder}
        accessibilityLabel={finalA11yLabel}
        {...(!isWeb ? { placeholderTextColor: palette.muted ?? palette.text, returnKeyType: 'search' as const } : {})}
      />
      {!!value && (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel={finalClearLabel}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          focusable
          style={({ pressed }) => [{ padding: 6 }, pressed && { opacity: 0.7 }]}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={palette.text}
            style={{ opacity: 0.8 }}
          />
        </Pressable>
      )}
    </View>
  );
}

function createStyles(palette: Palette, factor: number) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingEnd: 6,
      marginTop: 8,
    },
    input: {
      flex: 1,
      paddingVertical: Math.round(8 * factor),
      color: palette.text,
    },
  });
}
