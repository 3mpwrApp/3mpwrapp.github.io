import React from "react";
export const options = { href: null };
import { View, Text, StyleSheet, TextInput, Pressable, FlatList } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

let AsyncStorage: any;
try { AsyncStorage = require("@react-native-async-storage/async-storage").default; } catch {}

type Note = { id: string; text: string; date: string };

export default function EvidenceLocker() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Evidence Locker");
  useFocusOnRefOnMount(titleRef);
  const [text, setText] = React.useState("");
  const [notes, setNotes] = React.useState<Note[]>([]);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try { const raw = await AsyncStorage.getItem("evidence:notes:v1"); if (raw) setNotes(JSON.parse(raw)); } catch {}
    })();
  }, []);
  React.useEffect(() => {
    (async () => { if (AsyncStorage) await AsyncStorage.setItem("evidence:notes:v1", JSON.stringify(notes)); })();
  }, [notes]);

  return (
    <View style={styles.container} accessibilityLabel="Evidence Locker screen" accessible>
      <Text ref={titleRef} style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Evidence Locker</Text>
      <TextInput value={text} onChangeText={setText} placeholder="Add a note (date, contact, summary)" placeholderTextColor={palette.text+"77"} style={styles.input} />
      <Pressable accessibilityRole="button" accessibilityLabel="Add note" disabled={!text.trim()} onPress={() => { setNotes([{ id: String(Date.now()), text: text.trim(), date: new Date().toISOString() }, ...notes]); setText(""); }} style={({ pressed }) => [styles.button, (!text.trim() || pressed) && { opacity: 0.7 }]}>
        <Text style={styles.buttonText}>Add</Text>
      </Pressable>
      <FlatList data={notes} keyExtractor={(n) => n.id} renderItem={({ item }) => (
        <View style={styles.noteRow}><Text style={styles.noteText}>{new Date(item.date).toLocaleString()} — {item.text}</Text></View>
      )} contentContainerStyle={{ paddingTop: 12 }} />
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: palette.text, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: "center", marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    noteRow: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    noteText: { color: palette.text },
  });
}

