/* eslint import/no-named-as-default: off */
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import useColorScheme from "../hooks/useColorScheme";
import { useAppPalette } from "../theme/usePalette";

import { ThemedView } from "./ThemedView";
export default function ParallaxScrollView({
  children,
  headerBackgroundColor,
}: {
  children: ReactNode;
  headerBackgroundColor?: { light: string; dark: string };
}) {
  const colorScheme = useColorScheme(); // 'light' | 'dark'
  const palette = useAppPalette();
  const bg = headerBackgroundColor?.[colorScheme] ?? (colorScheme === 'light' ? palette.surface : palette.background);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedView style={[styles.header, { backgroundColor: bg }]} />
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  header: { height: 120, width: "100%" },
  inner: { padding: 16 },
});
