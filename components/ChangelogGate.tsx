import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import A11yPressable from "./A11yPressable";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

// Bump this ID when you want to show users what's new again
const CHANGELOG_ID = "2025-09-06-a";
const KEY = "empowr.changelog.seen";

export default function ChangelogGate({
  children,
}: {
  children: React.ReactNode;
}) {
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
      accessibilityViewIsModal
      accessibilityLabel="What’s new"
    >
      <View style={styles.card}>
        <Text style={styles.title}>What’s new</Text>
        <ScrollView style={{ maxHeight: 280 }}>
          <Text style={styles.text}>
            New Advocacy tools: Self-Advocacy Coach, Policy Made Simple, AI
            Translator, AI Case Interpreter, Collective Legal Hub, and AI
            Government Navigator. Wellness: Work-Balance AI, Grief & Identity
            Hub, Adaptive Meditation, trackers with exports and privacy lock.
            Resources: Voice-to-Case Notes, Deadlines with reminders/ICS/calendar,
            Evidence Checklist, Template Gallery. Campaign Rooms: shared tasks and
            notes with realtime sync. Terms gate and optional LLM backend hooks.
          </Text>
        </ScrollView>
        <A11yPressable onPress={onDismiss} style={styles.button}>
          <Text style={styles.buttonText}>Got it</Text>
        </A11yPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#000" },
  text: { color: "#000", opacity: 0.95, lineHeight: 20 },
  button: {
    marginTop: 10,
    backgroundColor: "#0066cc",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
