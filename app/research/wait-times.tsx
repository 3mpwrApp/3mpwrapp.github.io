import { collection, getDocs } from 'firebase/firestore';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import SimpleBarChart from '../../components/SimpleBarChart';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { waitTimes } from '../../data/wait-times';
import { db } from '../../firebase/config';
import { submitWaitTime } from '../../services/waits';
import { useAppPalette } from '../../theme/usePalette';

export const options = { href: null };

export default function WaitTimes() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [prov, setProv] = React.useState('');
  const [days, setDays] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [submissions, setSubmissions] = React.useState<{ province: string; days: number }[]>([]);
  React.useEffect(()=>{ 
    let mounted = true;
    (async()=>{ 
      try { 
        const snap = await getDocs(collection(db,'public_wait_times')); 
        if (mounted) setSubmissions(snap.docs.map(d=>d.data() as any)); 
      } catch {} 
    })();
    return () => { mounted = false; };
  },[]);
  function aggregate(list: { province: string; days: number }[]) {
    const m = new Map<string, number[]>();
    list.forEach(r => { if (!m.has(r.province)) m.set(r.province, []); m.get(r.province)!.push(Number(r.days)||0); });
    const agg = Array.from(m.entries()).map(([province, arr]) => {
      const sorted = arr.slice().sort((a,b)=>a-b);
      const median = sorted.length ? (sorted.length%2? sorted[(sorted.length-1)/2] : (sorted[sorted.length/2-1]+sorted[sorted.length/2])/2) : 0;
      const p90 = sorted.length ? sorted[Math.min(sorted.length-1, Math.floor(0.9*sorted.length))] : 0;
      return { province, medianDays: median, p90Days: p90 };
    });
    return agg;
  }
  const merged = React.useMemo(()=>{
    const agg = aggregate(submissions);
    const map = new Map(agg.map(a=>[a.province,a]));
    // merge seed defaults
    waitTimes.forEach(s => { if (!map.has(s.province)) map.set(s.province, s); });
    return Array.from(map.values());
  },[submissions]);
  const data = filter==='all'? merged : merged.filter(w => w.province === filter);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={s.title}>Compensation Wait-Time Tracker</Text>
      <Text style={s.text}>Anonymized community-reported timelines by province (seed data shown).</Text>
      <View style={{ flexDirection:'row', gap:8, marginTop: 8, flexWrap:'wrap' }}>
  <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('all')} style={[s.chip, filter==='all'&&s.chipActive]}><Text style={{ color: filter==='all'? palette.onPrimary: palette.text, fontWeight:'700' }}>All</Text></A11yPressable>
        {merged.map(w => w.province).map(p => (
          <A11yPressable hitSlop={HIT_SLOP_8} key={p} onPress={()=>setFilter(p)} style={[s.chip, filter===p&&s.chipActive]}><Text style={{ color: filter===p? palette.onPrimary: palette.text, fontWeight:'700' }}>{p}</Text></A11yPressable>
        ))}
      </View>
      <View style={{ marginTop: 8 }}>
        <SimpleBarChart data={data} labelKey="province" valueKey="medianDays" />
      </View>
      <Text style={[s.title,{ fontSize:18, marginTop: 12 }]}>Submit your wait</Text>
      <TextInput placeholder="Province (e.g., ON)" placeholderTextColor={palette.text+'77'} value={prov} onChangeText={setProv} style={s.input} />
      <TextInput placeholder="Days waited (number)" placeholderTextColor={palette.text+'77'} value={days} onChangeText={setDays} style={s.input} />
  <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try { await submitWaitTime(prov.trim().toUpperCase(), Number(days)||0); Alert.alert('Thanks','Submission received'); setProv(''); setDays(''); } catch { Alert.alert('Failed','Could not submit'); } }} style={s.button}><Text style={s.buttonText}>Submit</Text></A11yPressable>
  <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try { const rows = submissions; const csvRows = [['province','days'], ...rows.map(r => [r.province, String(r.days)])]; const csv = csvRows.map(r => r.map(x=> '"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n'); const FS = await import('expo-file-system'); const path = FS.cacheDirectory + `wait_times_${Date.now()}.csv`; await FS.writeAsStringAsync(path, csv, { encoding: FS.EncodingType.UTF8 }); const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path); else Alert.alert('Saved','CSV saved to cache.'); } catch { Alert.alert('Export failed','Could not export CSV'); } }} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={{ color: palette.text, fontWeight:'700' }}>Export CSV</Text></A11yPressable>
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
