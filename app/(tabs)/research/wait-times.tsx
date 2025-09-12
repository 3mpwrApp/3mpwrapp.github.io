import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { waitTimes } from '../../../data/wait-times';
import { useAppPalette } from '../../../theme/usePalette';
import { submitWaitTime } from '../../../services/waits';

export const options = { href: null };

export default function WaitTimes() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [prov, setProv] = React.useState('');
  const [days, setDays] = React.useState('');
  return (
    <View style={s.container}>
      <Text style={s.title}>Compensation Wait-Time Tracker</Text>
      <Text style={s.text}>Anonymized community-reported timelines by province (seed data shown).</Text>
      {waitTimes.map(w => (
        <Text key={w.province} style={s.text}>• {w.province}: median {w.medianDays}d, p90 {w.p90Days}d</Text>
      ))}
      <Text style={[s.title,{ fontSize:18, marginTop: 12 }]}>Submit your wait</Text>
      <TextInput placeholder="Province (e.g., ON)" placeholderTextColor={palette.text+'77'} value={prov} onChangeText={setProv} style={s.input} />
      <TextInput placeholder="Days waited (number)" placeholderTextColor={palette.text+'77'} value={days} onChangeText={setDays} style={s.input} />
      <Pressable onPress={async()=>{ try { await submitWaitTime(prov.trim().toUpperCase(), Number(days)||0); Alert.alert('Thanks','Submission received'); setProv(''); setDays(''); } catch { Alert.alert('Failed','Could not submit'); } }} style={s.button}><Text style={s.buttonText}>Submit</Text></Pressable>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
  });
}

