import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";

export default function Footer() {
  const colorScheme = useColorScheme();

  const Colors = {
    light: { background: "#FFFFFF", text: "#687076", border: "#E5E5EA" },
    dark: { background: "#000000", text: "#9BA1A6", border: "#1C1C1E" },
  };

  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, borderTopColor: theme.border },
      ]}
    >
      <Text style={[styles.text, { color: theme.text }]}>
        © {new Date().getFullYear()} Empowr App – All rights reserved
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderTopWidth: 1,
    alignItems: "center",
  },
  text: {
    fontSize: 12,
  },
});
