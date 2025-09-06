import React from "react";
export const options = { href: null };
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Share } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export default function ReconsiderationLetter() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Reconsideration letter");
  useFocusOnRefOnMount(titleRef);
  const [name, setName] = React.useState("");
  const [claim, setClaim] = React.useState("");
  const [points, setPoints] = React.useState("");
  const [date, setDate] = React.useState("");
  const preview = `Date: ${date || new Date().toLocaleDateString()}\n\nRe: Request for Reconsideration (Claim ${claim || "[ID]"})\n\nDear Claims Officer,\n\nI am requesting reconsideration of my claim decision. Key points: ${points || "[list facts/evidence]"}.\n\nSincerely,\n${name || "[Your Name]"}`;
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Reconsideration Letter</Text>
      <TextInput placeholder="Your name" placeholderTextColor={palette.text+"77"} value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Claim number" placeholderTextColor={palette.text+"77"} value={claim} onChangeText={setClaim} style={styles.input} />
      <TextInput placeholder="Key points / evidence" placeholderTextColor={palette.text+"77"} value={points} onChangeText={setPoints} style={styles.input} />
      <TextInput placeholder="Date" placeholderTextColor={palette.text+"77"} value={date} onChangeText={setDate} style={styles.input} />
      <View style={styles.preview}><Text style={{ color: palette.text }}>{preview}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Share letter" style={styles.button} onPress={() => Share.share({ message: preview, title: "Reconsideration Letter" })}>
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


