import React from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Share } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export default function AccommodationLetter() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Accommodation letter");
  useFocusOnRefOnMount(titleRef);

  const [name, setName] = React.useState("");
  const [employer, setEmployer] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [limitations, setLimitations] = React.useState("");
  const [accommodations, setAccommodations] = React.useState("");
  const [date, setDate] = React.useState("");

  const preview = React.useMemo(() => {
    return `Date: ${date || new Date().toLocaleDateString()}\n\n` +
    `${employer || "[Employer Name]"}\n` +
    `Re: Workplace Accommodation Request\n\n` +
    `Dear ${employer || "Employer"},\n\n` +
    `I am writing to request reasonable workplace accommodations under applicable human rights and accessibility laws. I am employed as ${jobTitle || "[Job Title]"}. Due to disability-related limitations (${limitations || "[briefly describe limitations]"}), I am requesting the following accommodations: ${accommodations || "[list requested accommodations]"}.\n\n` +
    `These accommodations will help me perform the essential duties of my role. I would welcome a discussion to explore options and provide any supporting documentation if needed.\n\n` +
    `Sincerely,\n${name || "[Your Name]"}`;
  }, [name, employer, jobTitle, limitations, accommodations, date]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text ref={titleRef} style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Accommodation Request</Text>
      <Text style={styles.subtitle}>Fill in your details, review the preview, then share or copy.</Text>
      <Field label="Your Name" value={name} onChangeText={setName} styles={styles} />
      <Field label="Employer" value={employer} onChangeText={setEmployer} styles={styles} />
      <Field label="Job Title" value={jobTitle} onChangeText={setJobTitle} styles={styles} />
      <Field label="Date (optional)" value={date} onChangeText={setDate} styles={styles} />
      <Field label="Limitations (brief)" value={limitations} onChangeText={setLimitations} styles={styles} multiline />
      <Field label="Requested Accommodations" value={accommodations} onChangeText={setAccommodations} styles={styles} multiline />

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Preview</Text>
      <View style={styles.previewBox} accessibilityLabel="Letter preview" accessible>
        <Text style={styles.previewText}>{preview}</Text>
      </View>
      <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]} onPress={() => Share.share({ message: preview, title: "Accommodation Request" }).catch(() => {})} accessibilityRole="button" accessibilityLabel="Share letter">
        <Text style={styles.buttonText}>Share</Text>
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

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  const placeholderColor = palette.text + "88";
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
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

