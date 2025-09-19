import React from 'react';
import { View, Text, StyleSheet, TextInput, Alert, FlatList } from 'react-native';
import A11yPressable from '../../../components/A11yPressable';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { addEntry, listEntries, deleteEntry, type ChronicEntry } from '../../../services/chronic';

export const options = { href: null };

export default function ChronicTracker() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Chronic Condition Tracker');
  useFocusOnRefOnMount(titleRef);
  const [symptom, setSymptom] = React.useState('');
  const [severity, setSeverity] = React.useState('');
  const [trigger, setTrigger] = React.useState('');
  const [accom, setAccom] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [items, setItems] = React.useState<ChronicEntry[]>([]);

  const load = React.useCallback(async () => { try { setItems(await listEntries()); } catch {} }, []);
  React.useEffect(() => { load(); }, [load]);

  const exportCSV = async () => {
    try {
      const rows = [['date','symptom','severity','trigger','accommodations','notes'], ...items.map(i => [i.date, i.symptom, String(i.severity||''), i.trigger||'', i.accommodations||'', (i.notes||'').replace(/\n/g,' ')])];
      const csv = rows.map(r=> r.map(x=> '"' + String(x||'').replace(/"/g,'""') + '"').join(',')).join('\n');
      const FS = await import('expo-file-system');
      const path = FS.cacheDirectory + `chronic_${Date.now()}.csv`;
      await FS.writeAsStringAsync(path, csv, { encoding: FS.EncodingType.UTF8 });
      try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path); else Alert.alert('Saved','CSV saved to cache.'); }
      catch { Alert.alert('Saved','CSV saved to cache (sharing unavailable).'); }
    } catch { Alert.alert('Export failed','Could not create CSV.'); }
  };
  const exportJSON = async () => {
    try {
      const FS = await import('expo-file-system');
      const path = FS.cacheDirectory + `chronic_${Date.now()}.json`;
      await FS.writeAsStringAsync(path, JSON.stringify(items, null, 2));
      try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path); else Alert.alert('Saved','JSON saved to cache.'); }
      catch { Alert.alert('Saved','JSON saved to cache (sharing unavailable).'); }
    } catch { Alert.alert('Export failed','Could not create JSON.'); }
  };
  const importTemplate = async () => {
    try {
      const DP = await import('expo-document-picker');
      const res = await DP.getDocumentAsync({ type: 'application/json' });
      const asset = res?.assets?.[0]; if (!asset?.uri) return;
      const FS = await import('expo-file-system');
      const raw = await FS.readAsStringAsync(asset.uri);
      const arr = JSON.parse(raw);
      for (const row of arr.slice(0, 50)) {
        await addEntry({ date: row.date || new Date().toISOString(), symptom: row.symptom||'Symptom', severity: Number(row.severity)||undefined, trigger: row.trigger||'', accommodations: row.accommodations||'', notes: row.notes||'' });
      }
      load();
      Alert.alert('Imported','Template entries added.');
    } catch { Alert.alert('Import failed','Could not import template.'); }
  };

  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Chronic Condition Tracker</Text>
      <TextInput placeholder="Symptom" placeholderTextColor={palette.text+"77"} value={symptom} onChangeText={setSymptom} style={s.input} />
      <TextInput placeholder="Severity 1-10" placeholderTextColor={palette.text+"77"} value={severity} onChangeText={setSeverity} style={s.input} />
      <TextInput placeholder="Trigger (optional)" placeholderTextColor={palette.text+"77"} value={trigger} onChangeText={setTrigger} style={s.input} />
      <TextInput placeholder="Accommodations needed (optional)" placeholderTextColor={palette.text+"77"} value={accom} onChangeText={setAccom} style={s.input} />
      <TextInput placeholder="Notes (optional)" placeholderTextColor={palette.text+"77"} value={notes} onChangeText={setNotes} style={s.input} />
      <A11yPressable onPress={async()=>{ try { await addEntry({ date: new Date().toISOString(), symptom: symptom.trim(), severity: Number(severity)||undefined, trigger, accommodations: accom, notes }); setSymptom(''); setSeverity(''); setTrigger(''); setAccom(''); setNotes(''); load(); } catch { Alert.alert('Add failed','Unable to save entry'); } }} style={s.button}><Text style={s.buttonText}>Add Entry</Text></A11yPressable>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
        <A11yPressable onPress={exportCSV} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={{ color: palette.text, fontWeight:'700' }}>Export CSV</Text></A11yPressable>
        <A11yPressable onPress={exportJSON} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={{ color: palette.text, fontWeight:'700' }}>Export JSON</Text></A11yPressable>
        <A11yPressable onPress={importTemplate} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={{ color: palette.text, fontWeight:'700' }}>Import Template</Text></A11yPressable>
      </View>
      <FlatList data={items} keyExtractor={i => i.id!} renderItem={({item}) => (
        <View style={s.card}>
          <Text style={s.cardTitle}>{new Date(item.date).toLocaleString()} — {item.symptom} (sev {item.severity ?? '-'})</Text>
          {!!item.trigger && <Text style={s.cardText}>Trigger: {item.trigger}</Text>}
          {!!item.accommodations && <Text style={s.cardText}>Accommodations: {item.accommodations}</Text>}
          {!!item.notes && <Text style={s.cardText}>{item.notes}</Text>}
          <A11yPressable onPress={async()=>{ try { await deleteEntry(item.id!); setItems(prev=>prev.filter(x=>x.id!==item.id)); } catch {} }} style={s.smallBtn}><Text style={s.smallBtnText}>Delete</Text></A11yPressable>
        </View>
      )} />
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 6 },
    smallBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf:'flex-start' },
    smallBtnText: { color: palette.text, fontWeight: '700' },
  });
}
