import React from "react";
export const options = { href: null };
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Share } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export default function RTWPlanLetter() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Return to Work plan");
  useFocusOnRefOnMount(titleRef);
  const [name, setName] = React.useState("");
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
      <Pressable accessibilityRole="button" accessibilityLabel="Share plan" style={styles.button} onPress={() => Share.share({ message: preview, title: "Return-to-Work Plan" })}>
        <Text style={styles.buttonText}>Share</Text>
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

