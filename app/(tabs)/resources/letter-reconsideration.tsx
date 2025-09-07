import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Share,
  Alert,
} from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useProfileLocal } from "../../../store/profileLocal";
import { buildCombinedEvidenceSummary } from "../../../services/insights";
import { logEvent } from "../../../services/analytics";

export const options = { href: null };

export default function ReconsiderationLetter() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Reconsideration letter");
  useFocusOnRefOnMount(titleRef);
  const { profile } = useProfileLocal();
  const [name, setName] = React.useState(profile.name ?? "");
  const [claim, setClaim] = React.useState("");
  const [points, setPoints] = React.useState("");
  const [date, setDate] = React.useState("");
  const preview = `Date: ${date || new Date().toLocaleDateString()}\n\nRe: Request for Reconsideration (Claim ${claim || "[ID]"})\n\nDear Claims Officer,\n\nI am requesting reconsideration of my claim decision. Key points: ${points || "[list facts/evidence]"}.\n\nSincerely,\n${name || "[Your Name]"}`;
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Reconsideration Letter
      </Text>
      <TextInput
        placeholder="Your name"
        placeholderTextColor={palette.text + "77"}
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Claim number"
        placeholderTextColor={palette.text + "77"}
        value={claim}
        onChangeText={setClaim}
        style={styles.input}
      />
      <TextInput
        placeholder="Key points / evidence"
        placeholderTextColor={palette.text + "77"}
        value={points}
        onChangeText={setPoints}
        style={styles.input}
      />
      <TextInput
        placeholder="Date"
        placeholderTextColor={palette.text + "77"}
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />
      <View style={styles.preview}>
        <Text style={{ color: palette.text }}>{preview}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share letter"
        style={styles.button}
        onPress={() => {
          logEvent("letter_share", { type: "reconsideration" });
          Share.share({ message: preview, title: "Reconsideration Letter" });
        }}
      >
        <Text style={styles.buttonText}>Share</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Export PDF"
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const mod = await import("expo-print");
            const html = `<pre style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;\">${preview.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
            const { uri } = await mod.printToFileAsync({ html });
            await Share.share({ url: uri, title: "Reconsideration Letter" });
          } catch {
            Alert.alert(
              "PDF not available",
              "Install expo-print in a dev build to export PDFs.",
            );
          }
        }}
      >
        <Text style={styles.buttonText}>Export as PDF</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Export DOC"
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const FS = await import("expo-file-system");
            const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${preview.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre></body></html>`;
            const path =
              FS.cacheDirectory + `reconsideration_${Date.now()}.doc`;
            await FS.writeAsStringAsync(path, html, {
              encoding: FS.EncodingType.UTF8,
            });
            await Share.share({
              url: path,
              title: "Reconsideration Letter (.doc)",
            });
          } catch {
            Alert.alert("Export failed", "Could not create .doc file.");
          }
        }}
      >
        <Text style={styles.buttonText}>Export as .doc</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Insert from trackers"
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          const ins = await buildCombinedEvidenceSummary();
          logEvent("letter_insert_from_trackers", { type: "reconsideration" });
          setPoints((p) => (p ? p + "\n\n" : "") + ins);
          Alert.alert("Inserted", "Added tracker summary to your points.");
        }}
      >
        <Text style={styles.buttonText}>Insert from trackers</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Copy letter"
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const mod = await import("expo-clipboard");
            await mod.setStringAsync(preview);
            Alert.alert("Copied", "Letter copied to clipboard.");
          } catch {
            Alert.alert(
              "Clipboard not available",
              "Install expo-clipboard in a dev build to enable copy.",
            );
          }
        }}
      >
        <Text style={styles.buttonText}>Copy to clipboard</Text>
      </Pressable>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: palette.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      marginBottom: 8,
    },
    preview: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
  });
}
