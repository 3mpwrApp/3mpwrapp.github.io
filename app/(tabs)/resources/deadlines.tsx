import React from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import DeadlinesList from './deadlines-list';
import { addDeadline, listDeadlines, type Deadline } from '../../../services/deadlines';

export const options = { href: null };

export default function DeadlinesScreen() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Deadlines');
  useFocusOnRefOnMount(titleRef);
  const [tab, setTab] = React.useState<'calendar'|'list'>('calendar');
  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Deadlines</Text>
      <View style={{ flexDirection:'row', gap:8 }}>
        <Pressable onPress={()=>setTab('calendar')} style={[s.chip, tab==='calendar'&&s.chipActive]}><Text style={{ color: tab==='calendar'? palette.onPrimary: palette.text, fontWeight:'700' }}>Calendar</Text></Pressable>
        <Pressable onPress={()=>setTab('list')} style={[s.chip, tab==='list'&&s.chipActive]}><Text style={{ color: tab==='list'? palette.onPrimary: palette.text, fontWeight:'700' }}>List</Text></Pressable>
      </View>
      {tab==='calendar'? <DeadlinesCalendar/> : <DeadlinesList/>}
      {tab==='calendar' && <RecurringBuilder/>}
    </View>
  );
}

function DeadlinesCalendar() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [month, setMonth] = React.useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [items, setItems] = React.useState<Deadline[]>([]);
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const [view, setView] = React.useState<'month'|'week'>('month');
  React.useEffect(() => { (async () => { try { setItems(await listDeadlines()); } catch {} })(); }, []);
  const monthLabel = React.useMemo(() => month.toLocaleString(undefined, { month:'long', year:'numeric' }), [month]);
  const matrix = React.useMemo(()=> buildMonthMatrix(month), [month]);
  const byDay = React.useMemo(()=> mapDeadlinesByDay(items), [items]);
  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 6 }}>
        <Pressable onPress={()=> setMonth(prev => new Date(prev.getFullYear(), prev.getMonth()-1, 1))}><Text style={{ color: palette.text }}>{'<'}</Text></Pressable>
        <Text style={{ color: palette.text, fontWeight:'700' }}>{monthLabel}</Text>
        <Pressable onPress={()=> setMonth(prev => new Date(prev.getFullYear(), prev.getMonth()+1, 1))}><Text style={{ color: palette.text }}>{'>'}</Text></Pressable>
      </View>
      <View style={{ flexDirection:'row', gap:8, marginBottom: 6 }}>
        <Pressable onPress={()=>setView('month')} style={[s.chip, view==='month'&&s.chipActive]}><Text style={{ color: view==='month'? palette.onPrimary: palette.text, fontWeight:'700' }}>Month</Text></Pressable>
        <Pressable onPress={()=>setView('week')} style={[s.chip, view==='week'&&s.chipActive]}><Text style={{ color: view==='week'? palette.onPrimary: palette.text, fontWeight:'700' }}>Week</Text></Pressable>
      </View>
      {(view==='month'? matrix : [currentWeekFromMatrix(matrix)]).map((week, wi) => (
        <View key={wi} style={{ flexDirection:'row', justifyContent:'space-between', marginBottom: 4 }}>
          {week.map((day, di) => (
            <Pressable key={di} onPress={()=> day && setSelectedDay(dayKeyFromMatrix(month, day))} style={{ width: 40, height: 40, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, alignItems:'center', justifyContent:'center', backgroundColor: selectedDay===dayKeyFromMatrix(month, day) ? palette.primary : palette.surface }}>
              <Text style={{ color: selectedDay===dayKeyFromMatrix(month, day) ? palette.onPrimary : palette.text }}>{day ?? ''}</Text>
              {!!day && !!byDay.get(dayKeyFromMatrix(month, day)) && <View style={{ width: 6, height: 6, borderRadius:3, backgroundColor: dotColor(dayKeyFromMatrix(month, day), items, palette), position:'absolute', bottom: 4 }} />}
            </Pressable>
          ))}
        </View>
      ))}
      {!!selectedDay && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ color: palette.text, fontWeight:'700' }}>Selected: {new Date(selectedDay).toLocaleDateString()}</Text>
          {items.filter(d => toDayKey(d.dueAt)===selectedDay).map(d => (
            <Text key={d.id} style={{ color: palette.text }}>• {new Date(d.dueAt).toLocaleTimeString()} — {d.title}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

function RecurringBuilder() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [title, setTitle] = React.useState('Follow-up');
  const [start, setStart] = React.useState(new Date().toISOString().slice(0,10));
  const [freq, setFreq] = React.useState<'weekly'|'monthly'>('weekly');
  const [count, setCount] = React.useState('4');
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={s.cardTitle}>Add Recurring</Text>
      <TextInput placeholder="Title prefix" placeholderTextColor={palette.text+'77'} value={title} onChangeText={setTitle} style={s.input} />
      <TextInput placeholder="Start date (YYYY-MM-DD)" placeholderTextColor={palette.text+'77'} value={start} onChangeText={setStart} style={s.input} />
      <View style={{ flexDirection:'row', gap:8, marginTop: 8 }}>
        <Pressable onPress={()=>setFreq('weekly')} style={[s.chip, freq==='weekly'&&s.chipActive]}><Text style={{ color: freq==='weekly'? palette.onPrimary: palette.text, fontWeight:'700' }}>Weekly</Text></Pressable>
        <Pressable onPress={()=>setFreq('monthly')} style={[s.chip, freq==='monthly'&&s.chipActive]}><Text style={{ color: freq==='monthly'? palette.onPrimary: palette.text, fontWeight:'700' }}>Monthly</Text></Pressable>
      </View>
      <TextInput placeholder="Count" placeholderTextColor={palette.text+'77'} value={count} onChangeText={setCount} style={s.input} />
      <Pressable onPress={async()=>{
        try {
          const n = Math.max(1, Math.min(52, Number(count)||1));
          const base = new Date(start);
          const ops: Promise<any>[] = [];
          for (let i=0;i<n;i++) {
            const dt = new Date(base);
            if (freq==='weekly') dt.setDate(dt.getDate() + i*7);
            else dt.setMonth(dt.getMonth() + i);
            ops.push(addDeadline({ title: `${title} ${freq==='weekly'? `Week ${i+1}` : `Month ${i+1}`}`, dueAt: dt.toISOString(), notes: '' }));
          }
          await Promise.all(ops);
          Alert.alert('Added', `${n} recurring deadlines added.`);
        } catch { Alert.alert('Failed','Could not add recurring deadlines'); }
      }} style={[s.button,{ marginTop: 8 }]}><Text style={s.buttonText}>Create</Text></Pressable>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center' },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    cardTitle: { color: palette.text, fontWeight: '700', marginTop: 10 },
  });
}

function toDayKey(input: string): string { const d = new Date(input); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function dayKeyFromMatrix(baseMonth: Date, day: number | null) { if (!day) return ''; const y=baseMonth.getFullYear(); const m=`${baseMonth.getMonth()+1}`.padStart(2,'0'); const dd=`${day}`.padStart(2,'0'); return `${y}-${m}-${dd}`; }
function buildMonthMatrix(firstOfMonth: Date): (number | null)[][] { const y = firstOfMonth.getFullYear(); const m = firstOfMonth.getMonth(); const first = new Date(y,m,1); const startDay = first.getDay(); const daysInMonth = new Date(y,m+1,0).getDate(); const matrix: (number|null)[][]=[]; let current = 1 - startDay; for (let w=0; w<6; w++){ const week:(number|null)[]=[]; for(let d=0; d<7; d++){ if(current<1||current>daysInMonth) week.push(null); else week.push(current); current++; } matrix.push(week); if (current>daysInMonth) break; } return matrix; }
function mapDeadlinesByDay(items: { dueAt: string }[]) { const m = new Map<string, number>(); for (const e of items) { const k = toDayKey(e.dueAt); m.set(k, (m.get(k)||0)+1); } return m; }
function currentWeekFromMatrix(matrix: (number|null)[][]) { const today = new Date().getDate(); for (const w of matrix) { if (w.includes(today)) return w; } return matrix[0]; }
function dotColor(dayKey: string, items: { dueAt: string }[], palette: any) { const d = new Date(dayKey + 'T00:00:00'); const now = new Date(); const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(); const ts = d.getTime(); if (ts < dayStart && items.some(x => toDayKey(x.dueAt)===dayKey)) return '#b00020'; if (ts - dayStart < 7*86400000) return '#f0a500'; return palette.primary; }
