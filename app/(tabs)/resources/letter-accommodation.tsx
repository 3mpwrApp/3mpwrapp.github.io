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
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useProfileLocal } from "../../../store/profileLocal";
import { buildSymptomSummary } from "../../../services/insights";
import { logEvent } from "../../../services/analytics";

export const options = { href: null };

export default function AccommodationLetter() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);

  useAnnounceOnMount("Accommodation letter");
  useFocusOnRefOnMount(titleRef);

  const { profile } = useProfileLocal();
  const [name, setName] = React.useState(profile.name ?? "");
  const [employer, setEmployer] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [limitations, setLimitations] = React.useState("");
  const [accommodations, setAccommodations] = React.useState("");
  const [date, setDate] = React.useState("");

  const preview = React.useMemo(() => {
    return (
      `Date: ${date || new Date().toLocaleDateString()}\n\n` +
      `${employer || "[Employer Name]"}\n` +
      `Re: Workplace Accommodation Request\n\n` +
      `Dear ${employer || "Employer"},\n\n` +
      `I am writing to request reasonable workplace accommodations under applicable human rights and accessibility laws. I am employed as ${
        jobTitle || "[Job Title]"
      }. Due to disability-related limitations (${
        limitations || "[briefly describe limitations]"
      }), I am requesting the following accommodations: ${
        accommodations || "[list requested accommodations]"
      }.\n\n` +
      `These accommodations will help me perform the essential duties of my role. I would welcome a discussion to explore options and provide any supporting documentation if needed.\n\n` +
      `Sincerely,\n${name || "[Your Name]"}`
    );
  }, [name, employer, jobTitle, limitations, accommodations, date]);

  const placeholderColor = palette.text + "88";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Accommodation Request
      </Text>
      <Text style={styles.subtitle}>
        Fill in your details, review the preview, then share or copy.
      </Text>

      <Field
        label="Your Name"
        value={name}
        onChangeText={setName}
        placeholderColor={placeholderColor}
      />
      <Field
        label="Employer"
        value={employer}
        onChangeText={setEmployer}
        placeholderColor={placeholderColor}
      />
      <Field
        label="Job Title"
        value={jobTitle}
        onChangeText={setJobTitle}
        placeholderColor={placeholderColor}
      />
      <Field
        label="Date (optional)"
        value={date}
        onChangeText={setDate}
        placeholderColor={placeholderColor}
      />
      <Field
        label="Limitations (brief)"
        value={limitations}
        onChangeText={setLimitations}
        multiline
        placeholderColor={placeholderColor}
      />
      <Field
        label="Requested Accommodations"
        value={accommodations}
        onChangeText={setAccommodations}
        multiline
        placeholderColor={placeholderColor}
      />

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Preview</Text>
      <View style={styles.previewBox}>
        <Text style={styles.previewText}>{preview}</Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          logEvent("letter_share", { type: "accommodation" });
          Share.share({
            message: preview,
            title: "Accommodation Request",
          }).catch(() => {});
        }}
      >
        <Text style={styles.buttonText}>Share</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          const ins = await buildSymptomSummary();
          logEvent("letter_insert_from_trackers", { type: "accommodation" });
          setLimitations((prev) => (prev ? prev + "\n\n" : "") + ins);
          Alert.alert("Inserted", "Added symptom summary to limitations.");
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
            Alert.alert(
              "Clipboard not available",
              "Install expo-clipboard in a dev build to enable copy.",
            );
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
            logEvent("letter_export_pdf", { type: "accommodation" });
            await Share.share({ url: uri, title: "Accommodation Request" });
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
        style={[styles.button, { marginTop: 8 }]}
        onPress={async () => {
          try {
            const FS = await import("expo-file-system");
            const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${preview
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")}</pre></body></html>`;
            const path = FS.cacheDirectory + `accommodation_${Date.now()}.doc`;
            await FS.writeAsStringAsync(path, html, {
              encoding: FS.EncodingType.UTF8,
            });
            await Share.share({
              url: path,
              title: "Accommodation Request (.doc)",
            });
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
      <Text style={{ color: "#000", opacity: 0.9, marginBottom: 4 }}>
        {label}
      </Text>
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

function createStyles(palette: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: {
      fontSize: 24,
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
