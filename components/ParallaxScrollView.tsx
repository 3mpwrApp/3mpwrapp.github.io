/* eslint import/no-named-as-default: off */
import type { ReactNode } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import useColorScheme from "../hooks/useColorScheme";
import { ThemedView } from "./ThemedView";
export default function ParallaxScrollView({
  children,
  headerBackgroundColor = { light: "#e6f0ff", dark: "#1a1a1a" },
}: {
  children: ReactNode;
  headerBackgroundColor?: { light: string; dark: string };
}) {
  const colorScheme = useColorScheme(); // 'light' | 'dark'

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedView
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
        ]}
      />
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  header: { height: 120, width: "100%" },
  inner: { padding: 16 },
});
