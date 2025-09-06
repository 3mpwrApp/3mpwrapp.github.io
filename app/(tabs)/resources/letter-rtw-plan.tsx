import React from "react";
export const options = { href: null };
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Share, Alert } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useProfileLocal } from "../../../store/profileLocal";
import { buildSymptomSummary } from "../../../services/insights";
import { logEvent } from "../../../services/analytics";

export default function RTWPlanLetter() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Return to Work plan");
  useFocusOnRefOnMount(titleRef);
  const { profile } = useProfileLocal();
  const [name, setName] = React.useState(profile.name ?? "");
  const [employer, setEmployer] = React.useState("");
  const [duties, setDuties] = React.useState("");
  const [accom, setAccom] = React.useState("");
  const [date, setDate] = React.useState("");
  const preview = `Date: ${date || new Date().toLocaleDateString()}\n\n${employer || "[Employer]"}\nRe: Return-to-Work Plan\n\nDear ${employer || "Employer"},\n\nI propose a staged return to work with the following duties: ${duties || "[duties]"} and accommodations: ${accom || "[accommodations]"}.\n\nSincerely,\n${name || "[Your Name]"}`;
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Return-to-Work Plan</Text>
      <TextInput placeholder="Your name" placeholderTextColor={palette.text+"77"} value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Employer" placeholderTextColor={palette.text+"77"} value={employer} onChangeText={setEmployer} style={styles.input} />
      <TextInput placeholder="Proposed duties" placeholderTextColor={palette.text+"77"} value={duties} onChangeText={setDuties} style={styles.input} />
      <TextInput placeholder="Accommodations" placeholderTextColor={palette.text+"77"} value={accom} onChangeText={setAccom} style={styles.input} />
      <TextInput placeholder="Date" placeholderTextColor={palette.text+"77"} value={date} onChangeText={setDate} style={styles.input} />
      <View style={styles.preview}><Text style={{ color: palette.text }}>{preview}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Share plan" style={styles.button} onPress={() => { logEvent('letter_share', { type: 'rtw' }); Share.share({ message: preview, title: "Return-to-Work Plan" }); }}>
        <Text style={styles.buttonText}>Share</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Insert from trackers" style={[styles.button, { marginTop: 8 }]} onPress={async () => {
        const ins = await buildSymptomSummary();
        logEvent('letter_insert_from_trackers', { type: 'rtw' });
        setAccom((a) => (a ? a + "\n\n" : "") + ins);
      }}>
        <Text style={styles.buttonText}>Insert from trackers</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Export DOC" style={[styles.button, { marginTop: 8 }]} onPress={async () => {
        try {
          const FS = await import("expo-file-system");
          const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${preview
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")}</pre></body></html>`;
          const path = FS.cacheDirectory + `rtw_${Date.now()}.doc`;
          await FS.writeAsStringAsync(path, html, { encoding: FS.EncodingType.UTF8 });
          await Share.share({ url: path, title: "Return-to-Work Plan (.doc)" });
        } catch {
          Alert.alert("Export failed", "Could not create .doc file.");
        }
      }}>
        <Text style={styles.buttonText}>Export as .doc</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Copy plan" style={[styles.button, { marginTop: 8 }]} onPress={async () => {
        try {
          const mod = await import("expo-clipboard");
          await mod.setStringAsync(preview);
          Alert.alert("Copied", "Plan copied to clipboard.");
        } catch {
          Alert.alert("Clipboard not available", "Install expo-clipboard in a dev build to enable copy.");
        }
      }}>
        <Text style={styles.buttonText}>Copy to clipboard</Text>
      </Pressable>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 20, fontWeight: "700", color: palette.text, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: palette.text, marginBottom: 8 },
    preview: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: "center", marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
  });
}


