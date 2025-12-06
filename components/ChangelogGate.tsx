import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useAppPalette } from "../theme/usePalette";

import A11yPressable from "./A11yPressable";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

// Bump this ID when you want to show users what's new again
const CHANGELOG_ID = "2025-10-06-a";
const KEY = "empowr.changelog.seen";

export default function ChangelogGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage?.getItem?.(KEY);
        if (seen !== CHANGELOG_ID) setShow(true);
      } catch {}
    })();
  }, []);

  if (!show) return <>{children}</>;

  const onDismiss = async () => {
    setShow(false);
    try {
      await AsyncStorage?.setItem?.(KEY, CHANGELOG_ID);
    } catch {}
  };

  return (
    <View
      style={styles.overlay}
      accessibilityViewIsModal={true}
      accessibilityLabel="What's new"
      collapsable={false}
    >
      <View style={styles.card}>
  <Text accessibilityRole="header" style={styles.title}>What’s new</Text>
        <ScrollView style={{ maxHeight: 280 }}>
          <Text style={styles.text}>
            What’s new this month:
            {'\n'}• Plain-language What’s New: daily updates from our changelog, with older items auto‑archived after 30 days.
            {'\n'}• Settings → About & Contact: quick “Send email” button for feedback during closed beta.
            {'\n'}• Accessibility & i18n: more labels and translations across Wellness and Resources.
            {'\n'}• Analytics: events now include a beta flag to help us focus fixes.
          </Text>
        </ScrollView>
        <A11yPressable onPress={onDismiss} style={styles.button}>
          <Text style={styles.buttonText}>Got it</Text>
        </A11yPressable>
      </View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 9998,
    },
    card: {
      width: "100%",
      maxWidth: 520,
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    text: { color: palette.text, opacity: 0.95, lineHeight: 20 },
    button: {
      marginTop: 10,
      backgroundColor: palette.primary,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
  });
}
