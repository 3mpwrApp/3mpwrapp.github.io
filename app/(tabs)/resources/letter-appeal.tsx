import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Alert,
} from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useProfileLocal } from "../../../store/profileLocal";
import { buildCombinedEvidenceSummary } from "../../../services/insights";
import { logEvent } from "../../../services/analytics";

export const options = { href: null };

export default function AppealLetter() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);

  useAnnounceOnMount("Appeal letter");
  useFocusOnRefOnMount(titleRef);
  const { profile } = useProfileLocal();

  const [name, setName] = React.useState(profile.name ?? "");
  const [claim, setClaim] = React.useState("");
  const [decisionDate, setDecisionDate] = React.useState("");
  const [reasons, setReasons] = React.useState("");
  const [appealArgs, setAppealArgs] = React.useState("");
  const [contact, setContact] = React.useState(profile.contact ?? "");

  const preview = React.useMemo(() => {
    return (
      `Re: Appeal of Decision (Claim ${claim || "[number]"})\n\n` +
      `Dear Appeals Officer,\n\n` +
      `I am appealing the decision dated ${
        decisionDate || "[date]"
      } regarding my workers' compensation/disability claim. ` +
      `The decision states: ${
        reasons || "[summarize reasons]"
      }. I believe this is incorrect because: ${
        appealArgs || "[state key arguments and evidence]"
      }.\n\n` +
      `I request that this decision be reconsidered and overturned. I can provide any additional documentation required. Please confirm receipt of this appeal and advise of next steps.\n\n` +
      `Sincerely,\n${name || "[Your Name]"}\n${contact || "[Phone/Email]"}`
    );
  }, [name, claim, decisionDate, reasons, appealArgs, contact]);

  const placeholderColor = palette.text + "88";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Appeal Letter
      </Text>
      <Text style={styles.subtitle}>
        Fill in your details, review the preview, then share or export.
      </Text>

      <Field label="Your Name" value={name} onChangeText={setName} placeholderColor={placeholderColor} />
      <Field label="Claim Number" value={claim} onChangeText={setClaim} placeholderColor={placeholderColor} />
      <Field label="Decision Date" value={decisionDate} onChangeText={setDecisionDate} placeholderColor={placeholderColor} />
      <Field label="Decision Summary" value={reasons} onChangeText={setReasons} multiline placeholderColor={placeholderColor} />
      <Field label="Your Arguments/Evidence" value={appealArgs} onChangeText={setAppealArgs} multiline placeholderColor={placeholderColor} />
      <Field label="Contact (email/phone)" value={contact} onChangeText={setContact} placeholderColor={placeholderColor} />

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Preview</Text>
      <View style={styles.previewBox}>
        <Text style={styles.previewText}>{preview}</Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          logEvent('letter_share', { type: 'appeal' });
          Share.share({ message: preview, title: "Appeal Letter" }).catch(() => {});
        }}
      >
        <Text style={styles.buttonText}>Share</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          const ins = await buildCombinedEvidenceSummary();
          logEvent('letter_insert_from_trackers', { type: 'appeal' });
          setAppealArgs((prev) => (prev ? prev + "\n\n" : "") + ins);
          Alert.alert("Inserted", "Added tracker summary to your arguments.");
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
            logEvent('letter_export_pdf', { type: 'appeal' });
            await Share.share({ url: uri, title: "Appeal Letter" });
          } catch {
            Alert.alert(
              "PDF not available",
              "Install expo-print in a dev build to export PDFs."
            );
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
            const path = FS.cacheDirectory + `appeal_${Date.now()}.doc`;
            await FS.writeAsStringAsync(path, html, { encoding: FS.EncodingType.UTF8 });
            await Share.share({ url: path, title: "Appeal Letter (.doc)" });
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

function Field({
  label,
  value,
  onChangeText,
  placeholderColor,
  multiline = false,
}: {
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
    title: {
      fontSize: Math.round(24 * factor),
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    sectionTitle: { color: palette.text, fontWeight: "700" },
    previewBox: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      backgroundColor: palette.surface,
      marginBottom: 12,
    },
    previewText: { color: palette.text, opacity: 0.95, lineHeight: 20 },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontSize: 16, fontWeight: "700" },
  });
}
