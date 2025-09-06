import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Share, Alert } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { getCachedJSON, setCachedJSON } from "../../../services/cache";
import { addEvent } from "../../../services/calendar";

type Appt = { id: string; time: string; title: string };

export const options = { href: null };

function makePlan(date: string, painAvg: number, energyAvg: number, appts: Appt[]) {
  const lines: string[] = [];
  lines.push(`Plan for ${date}`);
  const pace = painAvg >= 6 || energyAvg <= 2 ? '30/10' : painAvg >= 4 || energyAvg <= 3 ? '50/10' : '90/10';
  lines.push(`Pacing: work/rest ${pace}`);
  lines.push('Rest after appointments and before tasks that require focus.');
  lines.push('');
  appts.sort((a,b)=>a.time.localeCompare(b.time)).forEach(a=>lines.push(`• ${a.time} — ${a.title}`));
  lines.push('');
  lines.push('Suggested rest blocks: 11:00, 14:30');
  return lines.join('\n');
}

export default function DailyPlanner() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Adaptive Daily Planner');
  useFocusOnRefOnMount(titleRef);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0,10));
  const [appts, setAppts] = React.useState<Appt[]>([]);
  const [time, setTime] = React.useState('09:00');
  const [title, setTitle] = React.useState('');
  const [plan, setPlan] = React.useState('');

  const [painAvg, setPainAvg] = React.useState(0);
  const [energyAvg, setEnergyAvg] = React.useState(3);

  React.useEffect(() => {
    (async () => {
      const sym = (await getCachedJSON<any[]>("wellness_symptom_entries")) || [];
      const slp = (await getCachedJSON<any[]>("wellness_sleep_entries")) || [];
      const pains = sym.slice(0,7).map(e=>parseFloat(e.pain||'0')).filter(n=>!isNaN(n));
      setPainAvg(pains.length? pains.reduce((a,b)=>a+b,0)/pains.length : 0);
      const energies = slp.slice(0,7).map(e=>parseFloat(e.energy||'0')).filter(n=>!isNaN(n));
      setEnergyAvg(energies.length? energies.reduce((a,b)=>a+b,0)/energies.length : 3);
      const saved = await getCachedJSON<Appt[]>(`daily_planner_${date}`);
      if (saved) setAppts(saved);
    })();
  }, [date]);

  React.useEffect(() => { setCachedJSON(`daily_planner_${date}`, appts); }, [appts, date]);

  const addAppt = () => {
    if (!title.trim()) return;
    setAppts(prev => [...prev, { id: String(Date.now()), time, title: title.trim() }]);
    setTitle('');
  };

  const build = () => setPlan(makePlan(date, painAvg, energyAvg, appts));

  const sharePlan = () => {
    const p = plan || makePlan(date, painAvg, energyAvg, appts);
    Share.share({ message: p, title: 'Daily Plan' }).catch(()=>{});
  };

  const addRestToCalendar = async () => {
    try {
      const d = new Date(date + 'T11:00:00');
      const ok = await addEvent({ title: 'Rest break', notes: 'Adaptive Daily Planner', startISO: d.toISOString(), durationMinutes: 15 });
      Alert.alert(ok ? 'Added' : 'Not added', ok ? 'Rest break added to calendar.' : 'Unable to add event.');
    } catch { Alert.alert('Not available','Calendar permission or module missing.'); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Adaptive Daily Planner</Text>
      <Text style={s.subtitle}>Smart scheduling that factors in fatigue, pain flares, and appointments, with suggested rest breaks.</Text>
      <Text style={s.label}>Date (YYYY‑MM‑DD)</Text>
      <TextInput style={s.input} value={date} onChangeText={setDate} />
      <Text style={s.tip}>Recent averages — Pain: {painAvg.toFixed(1)} / 10; Energy: {energyAvg.toFixed(1)} / 5</Text>
      <View style={{ height: 8 }} />
      <Text style={s.label}>Add appointment</Text>
      <TextInput style={s.input} value={time} onChangeText={setTime} placeholder="09:00" />
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Physio / meeting / call" />
      <Pressable onPress={addAppt} style={s.button}><Text style={s.buttonText}>Add</Text></Pressable>
      <View style={{ height: 8 }} />
      {appts.sort((a,b)=>a.time.localeCompare(b.time)).map(a => (
        <View key={a.id} style={s.row}><Text style={s.rowText}>{a.time} — {a.title}</Text></View>
      ))}
      <View style={{ height: 8 }} />
      <Pressable onPress={build} style={s.button}><Text style={s.buttonText}>Build plan</Text></Pressable>
      {!!plan && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Plan</Text>
          <Text style={s.cardText}>{plan}</Text>
          <Pressable onPress={sharePlan} style={[s.button,{ marginTop: 8 }]}><Text style={s.buttonText}>Share</Text></Pressable>
          <Pressable onPress={addRestToCalendar} style={[s.button,{ marginTop: 8 }]}><Text style={s.buttonText}>Add rest to calendar</Text></Pressable>
        </View>
      )}
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
    tip: { color: palette.text, opacity: 0.9 },
    row: { paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    rowText: { color: palette.text },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, backgroundColor: palette.surface, marginTop: 8 },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95 },
  });
}

