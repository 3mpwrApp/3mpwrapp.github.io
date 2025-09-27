import React from "react";
import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useAppPalette } from "../theme/usePalette";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

const KEY = "empowr.terms.accepted.v1";

export default function TermsGate({ children }: { children: React.ReactNode }) {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const [accepted, setAccepted] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage?.getItem?.(KEY);
        setAccepted(raw === "1");
      } catch {
        setAccepted(false);
      }
    })();
  }, []);

  if (accepted === null) return null; // splash/loading handled by app
  if (accepted) return <>{children}</>;

  const onAccept = async () => {
    setAccepted(true);
    try {
      await AsyncStorage?.setItem?.(KEY, "1");
    } catch {}
  };

  const openTerms = () => {
    const url = "https://empowr.app/terms"; // replace with your hosted terms
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.overlay} accessibilityLabel="Terms and Conditions">
      <View style={styles.card}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <ScrollView
          style={{ maxHeight: 260 }}
          contentContainerStyle={{ paddingBottom: 12 }}
        >
          <Text style={styles.text}>
            By continuing, you agree to our Terms and Conditions and Privacy
            Policy. This app provides educational information and tools only,
            and is not legal, medical, or financial advice. Do not include
            personal identifiers or confidential information unless you consent.
            You can read the full Terms online.
          </Text>
          <Pressable
            onPress={openTerms}
            accessibilityRole="link"
            style={({ pressed }) => [styles.link, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.linkText}>Open full Terms</Text>
          </Pressable>
        </ScrollView>
        <Pressable
          onPress={onAccept}
          accessibilityRole="button"
          style={styles.button}
        >
          <Text style={styles.buttonText}>I Agree</Text>
        </Pressable>
        <Text style={[styles.text, { marginTop: 6 }]}>
          You must agree to continue.
        </Text>
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
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 9999,
    },
    card: {
      width: "100%",
      maxWidth: 520,
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
    },
    title: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: palette.text },
    text: { color: palette.text, opacity: 0.9 },
    link: { marginTop: 8 },
    linkText: { color: palette.primary, fontWeight: "700" },
    button: {
      marginTop: 8,
      backgroundColor: palette.primary,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
  });
}
