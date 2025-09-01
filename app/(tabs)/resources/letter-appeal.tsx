import React from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Share, Alert } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export default function AppealLetter() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Appeal letter");
  useFocusOnRefOnMount(titleRef);

  const [name, setName] = React.useState("");
  const [claim, setClaim] = React.useState("");
  const [decisionDate, setDecisionDate] = React.useState("");
  const [reasons, setReasons] = React.useState("");
  const [arguments, setArguments] = React.useState("");
  const [contact, setContact] = React.useState("");

  const preview = React.useMemo(() => {
    return `Re: Appeal of Decision (Claim ${claim || "[number]"})\n\n` +
      `Dear Appeals Officer,\n\n` +
      `I am appealing the decision dated ${decisionDate || "[date]"} regarding my workers' compensation/disability claim. ` +
      `The decision states: ${reasons || "[summarize reasons]"}. I believe this is incorrect because: ${arguments || "[state key arguments and evidence]"}.\n\n` +
      `I request that this decision be reconsidered and overturned. I can provide any additional documentation required. Please confirm receipt of this appeal and advise of next steps.\n\n` +
      `Sincerely,\n${name || "[Your Name]"}\n${contact || "[Phone/Email]"}`;
  }, [name, claim, decisionDate, reasons, arguments, contact]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text ref={titleRef} style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Appeal Letter</Text>
      <Text style={styles.subtitle}>Fill in your details, review the preview, then share or export.</Text>
      <Field label="Your Name" value={name} onChangeText={setName} styles={styles} />
      <Field label="Claim Number" value={claim} onChangeText={setClaim} styles={styles} />
      <Field label="Decision Date" value={decisionDate} onChangeText={setDecisionDate} styles={styles} />
      <Field label="Decision Summary" value={reasons} onChangeText={setReasons} styles={styles} multiline />
      <Field label="Your Arguments/Evidence" value={arguments} onChangeText={setArguments} styles={styles} multiline />
      <Field label="Contact (email/phone)" value={contact} onChangeText={setContact} styles={styles} />

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Preview</Text>
      <View style={styles.previewBox} accessibilityLabel="Letter preview" accessible>
        <Text style={styles.previewText}>{preview}</Text>
      </View>
      <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]} onPress={() => Share.share({ message: preview, title: "Appeal Letter" }).catch(() => {})} accessibilityRole="button" accessibilityLabel="Share letter">
        <Text style={styles.buttonText}>Share</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.button, { marginTop: 8 }, pressed && { opacity: 0.9 }]}
        accessibilityRole="button"
        accessibilityLabel="Export as PDF"
        onPress={async () => {
          try {
            const mod = await import("expo-print");
            const html = `<pre style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;\">${preview.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
            const { uri } = await mod.printToFileAsync({ html });
            await Share.share({ url: uri, title: "Appeal Letter" });
          } catch (e) {
            Alert.alert("PDF not available", "Install expo-print in a dev build to export PDFs.");
          }
        }}
      >
        <Text style={styles.buttonText}>Export as PDF</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, styles, multiline = false }: { label: string; value: string; onChangeText: (t: string) => void; styles: ReturnType<typeof createStyles>; multiline?: boolean }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholder={label}
        placeholderTextColor={styles.placeholderColor}
        multiline={multiline}
      />
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  const placeholderColor = palette.text + "88";
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    sectionTitle: { color: palette.text, fontWeight: "700" },
    label: { color: palette.text, opacity: 0.9, marginBottom: 4 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: palette.text, minHeight: 44 },
    previewBox: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 12, backgroundColor: palette.surface, marginBottom: 12 },
    previewText: { color: palette.text, opacity: 0.95, lineHeight: 20 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, alignItems: "center" },
    buttonText: { color: palette.onPrimary, fontSize: 16, fontWeight: "700" },
    placeholderColor: placeholderColor as unknown as any,
  });
}

