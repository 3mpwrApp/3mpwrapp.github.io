import React from "react";
import { View, Text, StyleSheet, TextInput, FlatList, Alert } from "react-native";
import A11yPressable from "../../../components/A11yPressable";
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

type Attachment = { name: string; uri: string };
type Note = { id: string; text: string; date: string; tags?: string[]; files?: Attachment[] };

export const options = { href: null };

export default function EvidenceLocker() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Evidence Locker");
  useFocusOnRefOnMount(titleRef);
  const [text, setText] = React.useState("");
  const [tag, setTag] = React.useState("");
  const [notes, setNotes] = React.useState<Note[]>([]);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        const raw = await AsyncStorage.getItem("evidence:notes:v1");
        if (raw) setNotes(JSON.parse(raw));
      } catch {}
    })();
  }, []);
  React.useEffect(() => {
    (async () => {
      if (AsyncStorage)
        await AsyncStorage.setItem("evidence:notes:v1", JSON.stringify(notes));
    })();
  }, [notes]);

  return (
    <View
      style={styles.container}
      accessibilityLabel="Evidence Locker screen"
      accessible
    >
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Evidence Locker
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Add a note (date, contact, summary)"
        placeholderTextColor={palette.text + "77"}
        style={styles.input}
      />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {['call','letter','medical','decision','payment','email'].map((t) => (
          <A11yPressable key={t} onPress={() => setTag(t)} style={[styles.chip, tag===t && styles.chipActive]}>
            <Text style={[styles.chipText, tag===t && styles.chipTextActive]}>{t.toUpperCase()}</Text>
          </A11yPressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <A11yPressable
          accessibilityLabel="Attach file"
          onPress={async () => {
            try {
              const Doc = await import('expo-document-picker');
              const res = await Doc.getDocumentAsync({ multiple: false });
              if (res.canceled || !res.assets?.length) return;
              const file = res.assets[0];
              setNotes([{ id: String(Date.now()), text: text.trim() || file.name || 'Attachment', date: new Date().toISOString(), tags: tag? [tag]: [], files: [{ name: file.name || 'file', uri: file.uri }] }, ...notes]);
              setText(''); setTag('');
            } catch {
              Alert.alert('Attach unavailable', 'Document picker not available in this build.');
            }
          }}
          style={styles.secondary}
        >
          <Text style={styles.buttonText}>Attach file</Text>
        </A11yPressable>
        <A11yPressable
          accessibilityLabel="Add note"
          onPress={() => {
            if (!text.trim()) return;
            setNotes([{ id: String(Date.now()), text: text.trim(), date: new Date().toISOString(), tags: tag? [tag]: [] }, ...notes]);
            setText(''); setTag('');
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Add</Text>
        </A11yPressable>
        <A11yPressable
          accessibilityLabel="Export CSV"
          onPress={async () => {
            try {
              const rows = [['date','tags','text','files'], ...notes.map(n => [n.date, (n.tags||[]).join('|'), n.text.replace(/\n/g,' '), String((n.files||[]).length)])];
              const csv = rows.map(r=> r.map(x=>`"${(x||'').replace(/"/g,'""')}"`).join(',')).join('\n');
              const FS = await import('expo-file-system');
              const path = FS.cacheDirectory + `evidence_${Date.now()}.csv`;
              await FS.writeAsStringAsync(path, csv, { encoding: FS.EncodingType.UTF8 });
              try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(path); } else { Alert.alert('Saved','CSV saved to cache.'); } }
              catch { Alert.alert('Saved','CSV saved to cache (sharing unavailable).'); }
            } catch { Alert.alert('Export failed','Could not create CSV.'); }
          }}
          style={styles.secondary}
        >
          <Text style={styles.buttonText}>Export CSV</Text>
        </A11yPressable>
      </View>
      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <View style={styles.noteRow}>
            <Text style={styles.noteText}>
              {new Date(item.date).toLocaleString()} Ã¢â‚¬â€ {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingTop: 12 }}
      />
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      marginTop: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
    secondary: {
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    noteRow: {
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    noteText: { color: palette.text },
    chip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight: "700" },
  });
}


