import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import SimpleBarChart from '../../components/SimpleBarChart';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { addEntry, listEntries } from '../../services/timeline';
import { useAppPalette } from '../../theme/usePalette';

export const options = { href: null };

export default function HistoryTimeline() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [title, setTitle] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().slice(0,10));
  const [description, setDescription] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);
  const load = React.useCallback(async()=>{ try{ setItems(await listEntries()); } catch{} },[]);
  React.useEffect(()=>{ load(); },[load]);
  const perYear = React.useMemo(()=>{
    const m = new Map<string, number>();
    items.forEach(i=>{ const y = String(new Date(i.date).getFullYear()); m.set(y, (m.get(y)||0)+1); });
    return Array.from(m.entries()).map(([year,count])=>({ year, count })).sort((a,b)=> a.year.localeCompare(b.year));
  },[items]);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={s.title}>Living Disability History Timeline</Text>
      {!!perYear.length && (
        <View style={{ marginTop: 8 }}>
          <SimpleBarChart data={perYear} labelKey="year" valueKey="count" />
        </View>
      )}
      <TextInput placeholder="Title" placeholderTextColor={palette.text+'77'} value={title} onChangeText={setTitle} style={s.input} />
      <TextInput placeholder="Date YYYY-MM-DD" placeholderTextColor={palette.text+'77'} value={date} onChangeText={setDate} style={s.input} />
      <TextInput placeholder="Description" placeholderTextColor={palette.text+'77'} value={description} onChangeText={setDescription} style={s.input} />
  <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try { await addEntry({ title, date, description }); setTitle(''); setDescription(''); load(); } catch { Alert.alert('Failed','Could not add'); } }} style={s.button}><Text style={s.buttonText}>Add Entry</Text></A11yPressable>
      {items.map(i => (
        <View key={i.id} style={s.card}>
          <Text style={s.cardTitle}>{i.date} — {i.title}</Text>
          {!!i.description && <Text style={s.text}>{i.description}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700', marginBottom: 4 },
    text: { color: palette.text, opacity: 0.95 },
  });
}
