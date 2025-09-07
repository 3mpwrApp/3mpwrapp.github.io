import React from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Share, Alert } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useProfileLocal } from "../../../store/profileLocal";
import { buildSymptomSummary } from "../../../services/insights";
import { logEvent } from "../../../services/analytics";



export const options = { href: null };

export default function UnionRequestLetter() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);

  useAnnounceOnMount("Union request letter");
  useFocusOnRefOnMount(titleRef);

  const { profile } = useProfileLocal();
  const [name, setName] = React.useState(profile.name ?? "");
  const [position, setPosition] = React.useState("");
  const [workplace, setWorkplace] = React.useState("");
  const [issue, setIssue] = React.useState("");
  const [accommodation, setAccommodation] = React.useState("");
  const [evidence, setEvidence] = React.useState("");
  const [contact, setContact] = React.useState(profile.contact ?? "");

  const preview = React.useMemo(() => {
    return (
      `Re: Request for Union Support and Representation\n\n` +
      `Dear Union Representative/Steward,\n\n` +
      `My name is ${name || "[Your Name]"}, employed as ${position || "[Position]"} at ${workplace || "[Workplace]"}. ` +
      `I am requesting union support and representation regarding the following issue: ${issue || "[briefly describe issue]"}.\n\n` +
      (accommodation
        ? `I am requesting the following accommodations or remedies: ${accommodation}.\n\n`
        : "") +
      (evidence
        ? `I can provide supporting documentation, including: ${evidence}.\n\n`
        : "") +
      `Please advise next steps and any information you require.\n\n` +
      `Sincerely,\n${name || "[Your Name]"}\n${contact || "[Phone/Email]"}`
    );
  }, [name, position, workplace, issue, accommodation, evidence, contact]);

  const placeholderColor = palette.text + "88";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Union Representation/Request Letter
      </Text>
      <Text style={styles.subtitle}>Fill in details, review the preview, then share or export.</Text>

      <Field label="Your Name" value={name} onChangeText={setName} placeholderColor={placeholderColor} />
      <Field label="Position/Role" value={position} onChangeText={setPosition} placeholderColor={placeholderColor} />
      <Field label="Workplace/Department" value={workplace} onChangeText={setWorkplace} placeholderColor={placeholderColor} />
      <Field label="Issue Summary" value={issue} onChangeText={setIssue} multiline placeholderColor={placeholderColor} />
      <Field label="Requested Accommodation/Remedy" value={accommodation} onChangeText={setAccommodation} multiline placeholderColor={placeholderColor} />
      <Field label="Evidence/Docs (optional)" value={evidence} onChangeText={setEvidence} multiline placeholderColor={placeholderColor} />
      <Field label="Contact (email/phone)" value={contact} onChangeText={setContact} placeholderColor={placeholderColor} />

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Preview</Text>
      <View style={styles.previewBox}>
        <Text style={styles.previewText}>{preview}</Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => { logEvent('letter_share', { type: 'union' }); Share.share({ message: preview, title: "Union Request" }).catch(() => {}); }}
      >
        <Text style={styles.buttonText}>Share</Text>
      </Pressable>
      <Pressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          const ins = await buildSymptomSummary();
          logEvent('letter_insert_from_trackers', { type: 'union' });
          setEvidence((prev) => (prev ? prev + "\n\n" : "") + ins);
        }}
      >
        <Text style={styles.buttonText}>Insert from trackers</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const mod = await import("expo-clipboard");
            await mod.setStringAsync(preview);
            Alert.alert("Copied", "Letter copied to clipboard.");
          } catch {
            Alert.alert("Clipboard not available", "Install expo-clipboard in a dev build to enable copy.");
          }
        }}
      >
        <Text style={styles.buttonText}>Copy to clipboard</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const mod = await import("expo-print");
            const html = `<pre style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;">${preview
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")}</pre>`;
            const { uri } = await mod.printToFileAsync({ html });
            await Share.share({ url: uri, title: "Union Request" });
          } catch {
            Alert.alert("PDF not available", "Install expo-print in a dev build to export PDFs.");
          }
        }}
      >
        <Text style={styles.buttonText}>Export as PDF</Text>
      </Pressable>
      <Pressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const FS = await import("expo-file-system");
            const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${preview
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")}</pre></body></html>`;
            const path = FS.cacheDirectory + `union_request_${Date.now()}.doc`;
            await FS.writeAsStringAsync(path, html, { encoding: FS.EncodingType.UTF8 });
            await Share.share({ url: path, title: "Union Request (.doc)" });
          } catch {
            Alert.alert("Export failed", "Could not create .doc file.");
          }
        }}
      >
        <Text style={styles.buttonText}>Export as .doc</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, placeholderColor, multiline = false }: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholderColor: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: "#000", opacity: 0.9, marginBottom: 4 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: "#000",
          minHeight: 44,
        }}
        placeholder={label}
        placeholderTextColor={placeholderColor}
        multiline={multiline}
      />
    </View>
  );
}

function createStyles(palette: any, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    sectionTitle: { color: palette.text, fontWeight: "700" },
    previewBox: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 12, backgroundColor: palette.surface, marginBottom: 12 },
    previewText: { color: palette.text, opacity: 0.95, lineHeight: 20 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, alignItems: "center" },
    buttonText: { color: palette.onPrimary, fontSize: 16, fontWeight: "700" },
  });
}
