import React from "react";
import { View, TextInput, StyleSheet, Pressable, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, type Palette } from "../theme/colors";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  testID?: string;
};

export default function SearchBar({ value, onChangeText, placeholder = "Search", accessibilityLabel = "Search", testID }: Props) {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  return (
    <View style={styles.container} accessibilityRole="search" testID={testID}>
      <Ionicons name="search" size={18} color={palette.text} style={{ marginHorizontal: 8, opacity: 0.8 }} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.text}
        accessibilityLabel={accessibilityLabel}
        returnKeyType="search"
        clearButtonMode="never"
      />
      {!!value && (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [{ padding: 6 }, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="close-circle" size={18} color={palette.text} style={{ opacity: 0.8 }} />
        </Pressable>
      )}
    </View>
  );
}

function createStyles(palette: Palette) {
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
      paddingVertical: 8,
      color: palette.text,
    },
  });
}
