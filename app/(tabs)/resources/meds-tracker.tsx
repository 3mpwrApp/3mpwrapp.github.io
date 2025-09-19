import React from 'react';
import { View, Text, StyleSheet, TextInput, Alert, FlatList } from 'react-native';
import A11yPressable from '../../../components/A11yPressable';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { addMedication, listMedications, deleteMedication, addMedLog, listLogs, type Medication, type MedLog } from '../../../services/meds';
import * as Notifier from '../../../services/notifications';
import DateTimeField from '../../../components/DateTimeField';

export const options = { href: null };

export default function MedsTracker() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Medication & Treatment Tracker');
  useFocusOnRefOnMount(titleRef);
  const [name, setName] = React.useState('');
  const [dose, setDose] = React.useState('');
  const [schedule, setSchedule] = React.useState('');
  const [items, setItems] = React.useState<Medication[]>([]);
  const [selectedMed, setSelectedMed] = React.useState<string>('');
  const [sideEffects, setSideEffects] = React.useState('');
  const [eff, setEff] = React.useState('');
  const [logs, setLogs] = React.useState<MedLog[]>([]);
  const [remind, setRemind] = React.useState('');
  const [refill, setRefill] = React.useState('');

  const load = React.useCallback(async () => {
    try { setItems(await listMedications()); } catch {}
  }, []);
  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => { (async () => { try { setLogs(await listLogs(selectedMed || undefined)); } catch {} })(); }, [selectedMed]);

  const exportCSV = async () => {
    try {
      const rows = [['date','med','dose','schedule','sideEffects','effectiveness'], ...logs.map(l => [l.date, (items.find(m=>m.id===l.medId)?.name)||'', (items.find(m=>m.id===l.medId)?.dose)||'', (items.find(m=>m.id===l.medId)?.schedule)||'', l.sideEffects||'', String(l.effectiveness??'')])];
      const csv = rows.map(r=> r.map(x=> '"' + String(x||'').replace(/"/g,'""') + '"').join(',')).join('\n');
      const FS = await import('expo-file-system');
      const path = FS.cacheDirectory + `meds_${Date.now()}.csv`;
      await FS.writeAsStringAsync(path, csv, { encoding: FS.EncodingType.UTF8 });
      try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path); else Alert.alert('Saved','CSV saved to cache.'); }
      catch { Alert.alert('Saved','CSV saved to cache (sharing unavailable).'); }
    } catch { Alert.alert('Export failed','Could not create CSV.'); }
  };
  const exportJSON = async () => {
    try {
      const payload = { medications: items, logs };
      const FS = await import('expo-file-system');
      const path = FS.cacheDirectory + `meds_${Date.now()}.json`;
      await FS.writeAsStringAsync(path, JSON.stringify(payload, null, 2));
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
      const json = JSON.parse(raw);
      const meds = Array.isArray(json?.medications) ? json.medications : Array.isArray(json) ? json : [];
      for (const m of meds.slice(0, 50)) {
        await addMedication({ name: m.name||'Medication', dose: m.dose||'', schedule: m.schedule||'', reminderTime: m.reminderTime||undefined, refillAt: m.refillAt||undefined });
      }
      load();
      Alert.alert('Imported','Template medications added.');
    } catch { Alert.alert('Import failed','Could not import template.'); }
  };

  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Medication & Treatment Tracker</Text>
      <TextInput placeholder="Medication name" placeholderTextColor={palette.text+"77"} value={name} onChangeText={setName} style={s.input} />
      <TextInput placeholder="Dose (e.g., 10mg)" placeholderTextColor={palette.text+"77"} value={dose} onChangeText={setDose} style={s.input} />
      <TextInput placeholder="Schedule (e.g., 2x daily)" placeholderTextColor={palette.text+"77"} value={schedule} onChangeText={setSchedule} style={s.input} />
      <DateTimeField label="Reminder time (optional)" mode="time" value={remind} onChange={setRemind} />
      <DateTimeField label="Refill date (optional)" mode="date" value={refill} onChange={setRefill} />
      <A11yPressable onPress={async()=>{ try { await addMedication({ name: name.trim(), dose, schedule, reminderTime: remind || undefined, refillAt: refill || undefined }); setName(''); setDose(''); setSchedule(''); setRemind(''); setRefill(''); load(); } catch { Alert.alert('Add failed','Unable to add med'); } }} style={s.button}><Text style={s.buttonText}>Add Medication</Text></A11yPressable>

      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 6 }}>
        <A11yPressable onPress={exportCSV} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={{ color: palette.text, fontWeight:'700' }}>Export CSV</Text></A11yPressable>
        <A11yPressable onPress={exportJSON} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={{ color: palette.text, fontWeight:'700' }}>Export JSON</Text></A11yPressable>
        <A11yPressable onPress={importTemplate} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={{ color: palette.text, fontWeight:'700' }}>Import Template</Text></A11yPressable>
      </View>
      <FlatList data={items} keyExtractor={m=>m.id!} renderItem={({item}) => (
        <View style={s.card}>
          <Text style={s.cardTitle}>{item.name}</Text>
          <Text style={s.cardText}>Dose: {item.dose || '-'}</Text>
          <Text style={s.cardText}>Schedule: {item.schedule || '-'}</Text>
          <Text style={s.cardText}>Reminder: {item.reminderTime || '-'}</Text>
          <Text style={s.cardText}>Refill: {item.refillAt ? new Date(item.refillAt).toLocaleDateString() : '-'}</Text>
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
            <A11yPressable onPress={()=> setSelectedMed(item.id!)} style={s.smallBtn}><Text style={s.smallBtnText}>Logs</Text></A11yPressable>
            <A11yPressable onPress={async()=>{
              // Schedule 7 days of daily reminders at given HH:MM
              try {
                const [hh,mm] = (item.reminderTime || '09:00').split(':').map(x=>Number(x));
                for (let i=0;i<7;i++) {
                  const d = new Date(); d.setHours(hh, mm, 0, 0); d.setDate(d.getDate()+i);
                  await Notifier.scheduleAt(d, 'Medication', `Time to take ${item.name}`);
                }
                Alert.alert('Scheduled','Reminders for the next 7 days.');
              } catch { Alert.alert('Failed','Could not schedule reminders'); }
            }} style={s.smallBtn}><Text style={s.smallBtnText}>Remind daily</Text></A11yPressable>
            <A11yPressable onPress={async()=>{
              try {
                if (!item.refillAt) { Alert.alert('Set refill','No refill date set.'); return; }
                await Notifier.scheduleAt(new Date(item.refillAt), 'Refill reminder', `Refill ${item.name}`);
                Alert.alert('Scheduled','Refill reminder set.');
              } catch { Alert.alert('Failed','Could not schedule refill'); }
            }} style={s.smallBtn}><Text style={s.smallBtnText}>Refill alert</Text></A11yPressable>
            <A11yPressable onPress={async()=>{ try { await deleteMedication(item.id!); setItems(prev=>prev.filter(x=>x.id!==item.id)); if (selectedMed===item.id) setSelectedMed(''); } catch {} }} style={s.smallBtn}><Text style={s.smallBtnText}>Delete</Text></A11yPressable>
          </View>
        </View>
      )} />

      {!!selectedMed && (
        <View style={{ marginTop: 12 }}>
          <Text style={s.cardTitle}>Logs for {items.find(m=>m.id===selectedMed)?.name}</Text>
          <TextInput placeholder="Side effects" placeholderTextColor={palette.text+"77"} value={sideEffects} onChangeText={setSideEffects} style={s.input} />
          <TextInput placeholder="Effectiveness 1-5" placeholderTextColor={palette.text+"77"} value={eff} onChangeText={setEff} style={s.input} />
          <A11yPressable onPress={async()=>{ try { await addMedLog({ medId: selectedMed, date: new Date().toISOString(), sideEffects, effectiveness: Number(eff)||undefined }); setSideEffects(''); setEff(''); setLogs(await listLogs(selectedMed)); } catch { Alert.alert('Add failed','Unable to add log'); } }} style={s.button}><Text style={s.buttonText}>Add Log</Text></A11yPressable>
          <A11yPressable onPress={exportCSV} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={{ color: palette.text, fontWeight:'700' }}>Export CSV</Text></A11yPressable>
          {logs.map(l => (
            <View key={l.id} style={s.card}><Text style={s.cardText}>{new Date(l.date).toLocaleString()} — Eff: {l.effectiveness ?? '-'} — {l.sideEffects || '-'}</Text></View>
          ))}
        </View>
      )}
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
    smallBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    smallBtnText: { color: palette.text, fontWeight: '700' },
  });
}
