import React from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ScrollView } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { getCachedJSON, setCachedJSON } from "../../../services/cache";

export const options = { href: null };

type Note = { id: string; date: string; who?: string; topic?: string; summary?: string; audioUri?: string };

export default function VoiceNotes() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Voice-to-Case Notes");
  useFocusOnRefOnMount(titleRef);

  const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0,10));
  const [who, setWho] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [recording, setRecording] = React.useState<any>(null);
  const [audioUri, setAudioUri] = React.useState<string | undefined>(undefined);

  React.useEffect(() => { (async () => { const saved = await getCachedJSON<Note[]>("voice_notes"); if (saved) setNotes(saved); })(); }, []);
  React.useEffect(() => { setCachedJSON("voice_notes", notes); }, [notes]);

  const start = async () => {
    try {
      const { Audio } = await import("expo-av");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch {
      Alert.alert("Recording unavailable", "Rebuild with expo-av to enable.");
    }
  };
  const stop = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri || undefined);
      setRecording(null);
    } catch {}
  };

  const save = () => {
    const n: Note = { id: String(Date.now()), date, who, topic, summary, audioUri };
    setNotes((prev) => [n, ...prev]);
    setWho(""); setTopic(""); setSummary(""); setAudioUri(undefined);
  };

  const caseLog = (n: Note) => (
    `Date: ${n.date}\nWho: ${n.who || '-'}\nTopic: ${n.topic || '-'}\nSummary: ${n.summary || '-'}${n.audioUri ? `\nAudio: ${n.audioUri}` : ''}`
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Voice‑to‑Case Notes</Text>
      <Text style={s.subtitle}>Record audio notes and convert them into formatted case logs for doctors or tribunals.</Text>
      <Text style={s.label}>Date</Text>
      <TextInput style={s.input} value={date} onChangeText={setDate} />
      <Text style={s.label}>Who (doctor, case mgr, HR)</Text>
      <TextInput style={s.input} value={who} onChangeText={setWho} />
      <Text style={s.label}>Topic</Text>
      <TextInput style={s.input} value={topic} onChangeText={setTopic} />
      <Text style={s.label}>Summary / Transcript</Text>
      <TextInput style={[s.input,{ minHeight: 100 }]} value={summary} onChangeText={setSummary} multiline />
      {!recording ? (
        <Pressable onPress={start} style={s.button}><Text style={s.buttonText}>Record audio</Text></Pressable>
      ) : (
        <Pressable onPress={stop} style={[s.button,{ backgroundColor: '#b00020' }]}><Text style={s.buttonText}>Stop recording</Text></Pressable>
      )}
      <Pressable onPress={save} style={[s.button,{ marginTop: 8 }]}><Text style={s.buttonText}>Save Note</Text></Pressable>

      <Text style={[s.subtitle,{ marginTop: 12 }]}>Saved notes</Text>
      {notes.length === 0 ? <Text style={s.tip}>No notes yet.</Text> : notes.map((n) => (
        <View key={n.id} style={s.card}>
          <Text style={s.cardTitle}>{n.date} — {n.topic || 'Note'}</Text>
          <Text style={s.cardText}>{caseLog(n)}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={async () => { try { const mod = await import('expo-clipboard'); await mod.setStringAsync(caseLog(n)); Alert.alert('Copied','Log copied to clipboard.'); } catch {} }} style={s.smallBtn}><Text style={s.smallBtnText}>Copy</Text></Pressable>
            <Pressable onPress={async () => { try { const Share = await import('expo-share'); await Share.share({ message: caseLog(n), title: 'Case Log' } as any); } catch {} }} style={s.smallBtn}><Text style={s.smallBtnText}>Share</Text></Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    label: { color: palette.text, opacity: 0.95, marginBottom: 4 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 10, color: palette.text, marginBottom: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    tip: { color: palette.text, opacity: 0.8 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 6 },
    smallBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    smallBtnText: { color: palette.text, fontWeight: '700' },
  });
}

