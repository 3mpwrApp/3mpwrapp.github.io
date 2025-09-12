import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { waitTimes } from '../../../data/wait-times';
import { useAppPalette } from '../../../theme/usePalette';
import { submitWaitTime } from '../../../services/waits';
import SimpleBarChart from '../../../components/SimpleBarChart';

export const options = { href: null };

export default function WaitTimes() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [prov, setProv] = React.useState('');
  const [days, setDays] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const data = filter==='all'? waitTimes : waitTimes.filter(w => w.province === filter);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={s.title}>Compensation Wait-Time Tracker</Text>
      <Text style={s.text}>Anonymized community-reported timelines by province (seed data shown).</Text>
      <View style={{ flexDirection:'row', gap:8, marginTop: 8, flexWrap:'wrap' }}>
        <Pressable onPress={()=>setFilter('all')} style={[s.chip, filter==='all'&&s.chipActive]}><Text style={{ color: filter==='all'? palette.onPrimary: palette.text, fontWeight:'700' }}>All</Text></Pressable>
        {waitTimes.map(w => w.province).map(p => (
          <Pressable key={p} onPress={()=>setFilter(p)} style={[s.chip, filter===p&&s.chipActive]}><Text style={{ color: filter===p? palette.onPrimary: palette.text, fontWeight:'700' }}>{p}</Text></Pressable>
        ))}
      </View>
      <View style={{ marginTop: 8 }}>
        <SimpleBarChart data={data} labelKey="province" valueKey="medianDays" />
      </View>
      <Text style={[s.title,{ fontSize:18, marginTop: 12 }]}>Submit your wait</Text>
      <TextInput placeholder="Province (e.g., ON)" placeholderTextColor={palette.text+'77'} value={prov} onChangeText={setProv} style={s.input} />
      <TextInput placeholder="Days waited (number)" placeholderTextColor={palette.text+'77'} value={days} onChangeText={setDays} style={s.input} />
      <Pressable onPress={async()=>{ try { await submitWaitTime(prov.trim().toUpperCase(), Number(days)||0); Alert.alert('Thanks','Submission received'); setProv(''); setDays(''); } catch { Alert.alert('Failed','Could not submit'); } }} style={s.button}><Text style={s.buttonText}>Submit</Text></Pressable>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
  });
}
