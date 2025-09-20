import React from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, View } from "react-native";
import A11yPressable from "../../../components/A11yPressable";
import DateTimeField from "../../../components/DateTimeField";
import SimpleBarChart from "../../../components/SimpleBarChart";
import { HIT_SLOP_8 } from "../../../constants/a11y";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { listReflections, type Reflection } from "../../../services/wellness";
import { useAppPalette } from "../../../theme/usePalette";

export const options = { href: null };

export default function ReflectionsCalendar() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Reflections Calendar");
  useFocusOnRefOnMount(titleRef);

  const [days, setDays] = React.useState<Array<{ date: Date; entry?: Reflection }>>([]);
  const [rangeDays, setRangeDays] = React.useState(30);
  const [loading, setLoading] = React.useState(false);
  const [entries, setEntries] = React.useState<Reflection[]>([]);
  const [view, setView] = React.useState<'list'|'grid'>('grid');
  const [monthAnchor, setMonthAnchor] = React.useState<Date>(() => { const d=new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [fromDate, setFromDate] = React.useState<string | null>(null);
  const [toDate, setToDate] = React.useState<string | null>(null);
  const [editor, setEditor] = React.useState<{
    open: boolean;
    date: Date | null;
    entry?: Reflection;
    mood: Reflection['mood'];
    note: string;
  }>({ open: false, date: null, entry: undefined, mood: 'ok', note: '' });
  const [details, setDetails] = React.useState<{ open: boolean; date: Date | null }>(()=> ({ open:false, date: null }));
  const [exportOpts, setExportOpts] = React.useState<{ includeMood: boolean; includeText: boolean }>({ includeMood: true, includeText: true });
  const [quickKey, setQuickKey] = React.useState<string | null>(null);
  const [tapAction, setTapAction] = React.useState<'details'|'editor'>('details');
  const [useServerBackdate, setUseServerBackdate] = React.useState(true);
  React.useEffect(() => {
    try {
      const A = require('@react-native-async-storage/async-storage').default;
      (async () => {
        const val = await A.getItem('reflections.tapAction'); if (val==='editor' || val==='details') setTapAction(val as any);
        const b = await A.getItem('reflections.useServerBackdate'); if (b==='0') setUseServerBackdate(false);
      })();
    } catch {}
  }, []);
  const saveTapPref = async (next: 'details'|'editor') => { setTapAction(next); try { const A = require('@react-native-async-storage/async-storage').default; await A.setItem('reflections.tapAction', next); } catch {} };

  const load = React.useCallback(async (nDays: number) => {
    try {
      setLoading(true);
      // Fetch a generous slice; we keep it client-side for simplicity
      const items = await listReflections(Math.max(nDays * 2, 120));
      setEntries(items);
      const byDay = new Map<string, Reflection>();
      for (const r of items) {
        const d = new Date(r.createdAt?.toDate?.() || Date.now());
        const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
        if (!byDay.has(key)) byDay.set(key, r); // keep most recent for the day
      }
      const out: Array<{ date: Date; entry?: Reflection }> = [];
      for (let i = 0; i < nDays; i++) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const key = d.toISOString();
        out.push({ date: new Date(d), entry: byDay.get(key) });
      }
      out.reverse();
      setDays(out);
    } catch {
      Alert.alert("Load failed", "Sign in to view reflections.");
    } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(rangeDays); }, [rangeDays, load]);

  const exportCSV = async () => {
    try {
      const header = ["date"].concat(exportOpts.includeMood? ["mood"]: []).concat(exportOpts.includeText? ["note"]: []);
      const rows = [header, ...computeActiveDates()
        .filter(d => !!d.entry)
        .map(d => [d.date.toISOString().slice(0,10)]
          .concat(exportOpts.includeMood? [String(d.entry!.mood)]: [])
          .concat(exportOpts.includeText? [(d.entry!.note||"").replace(/\n/g,' ')]: [])
        )];
      const csv = rows.map(r=> r.map(x=>`"${String(x||'').replace(/"/g,'""')}"`).join(',')).join('\n');
      const FS = await import('expo-file-system');
      const p = FS.cacheDirectory + `reflections_${Date.now()}.csv`;
      await FS.writeAsStringAsync(p, csv, { encoding: FS.EncodingType.UTF8 });
      try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(p); } else { Alert.alert('Saved', 'CSV saved to cache.'); } }
      catch { Alert.alert('Saved', 'CSV saved to cache (sharing unavailable).'); }
    } catch { Alert.alert('Export failed','Could not create CSV.'); }
  };

  const exportJSON = async () => {
    try {
      const active = computeActiveDates();
      const payload = active.filter(d=>!!d.entry).map(d=> ({
        date: d.date.toISOString(),
        ...(exportOpts.includeMood ? { mood: d.entry!.mood } : {}),
        ...(exportOpts.includeText ? { note: d.entry!.note || '' } : {}),
      }));
      const FS = await import('expo-file-system');
      const p = FS.cacheDirectory + `reflections_${Date.now()}.json`;
      await FS.writeAsStringAsync(p, JSON.stringify(payload, null, 2));
      try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(p); } else { Alert.alert('Saved', 'JSON saved to cache.'); } }
      catch { Alert.alert('Saved', 'JSON saved to cache (sharing unavailable).'); }
    } catch { Alert.alert('Export failed','Could not create JSON.'); }
  };
  const exportRangeCSV = async (daysBack: number) => {
    try {
      const today = new Date(); today.setHours(0,0,0,0);
      const minTs = today.getTime() - (daysBack-1)*86400000;
      const byDate = new Map<string, Reflection>();
      entries.forEach(r => { const d = new Date(r.createdAt?.toDate?.() || Date.now()); const floor = new Date(d.getFullYear(), d.getMonth(), d.getDate()); if (floor.getTime() >= minTs) { const key = floor.toISOString().slice(0,10); if (!byDate.has(key)) byDate.set(key, r); } });
      const header = ["date"].concat(exportOpts.includeMood? ["mood"]: []).concat(exportOpts.includeText? ["note"]: []);
      const rows = [header, ...Array.from(byDate.entries()).sort((a,b)=> a[0].localeCompare(b[0])).map(([k, r]) => [k].concat(exportOpts.includeMood? [String(r.mood)]: []).concat(exportOpts.includeText? [String((r.note||'').replace(/\n/g,' '))]: []))];
      const csv = rows.map(r=> r.map(x=>`"${String(x||'').replace(/"/g,'""')}"`).join(',')).join('\n');
      const FS = await import('expo-file-system');
      const p = FS.cacheDirectory + `reflections_${daysBack}d_${Date.now()}.csv`;
      await FS.writeAsStringAsync(p, csv, { encoding: FS.EncodingType.UTF8 });
      try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(p); } catch {}
    } catch {}
  };

  const moods: Record<NonNullable<Reflection['mood']>, string> = {
    bad: '😟', ok: '😐', good: '🙂', great: '😄'
  } as const;

  const moodColors: Record<NonNullable<Reflection['mood']>, string> = {
    bad: '#d9534f',
    ok: '#f0ad4e',
    good: '#5cb85c',
    great: palette.primary,
  } as const;

  function computeActiveDates(): Array<{ date: Date; entry?: Reflection }>{
    const startTs = fromDate ? new Date(fromDate).setHours(0,0,0,0) : null;
    const endTs = toDate ? new Date(toDate).setHours(23,59,59,999) : null;
    if (view === 'list') {
      const within = days.filter(d => {
        const t = d.date.getTime();
        if (startTs !== null && t < startTs) return false;
        if (endTs !== null && t > endTs) return false;
        return true;
      });
      return within;
    }
    // grid: compute month cells
    const first = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
    const startDow = first.getDay(); // 0-6 Sun-Sat
    const cells: Array<{ date: Date; entry?: Reflection }> = [];
    const byKey = new Map<string, Reflection>();
    for (const r of entries) {
      const d = new Date(r.createdAt?.toDate?.() || Date.now());
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!byKey.has(key)) byKey.set(key, r);
    }
    const daysInMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth()+1, 0).getDate();
    const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7; // full weeks
    for (let i=0;i<totalCells;i++) {
      const dayNum = i - startDow + 1;
      const d = new Date(first);
      d.setDate(dayNum);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const entry = byKey.get(key);
      // filter by from/to if set
      const t = d.getTime();
      if (startTs !== null && t < startTs) { cells.push({ date: d, entry: undefined }); continue; }
      if (endTs !== null && t > endTs) { cells.push({ date: d, entry: undefined }); continue; }
      cells.push({ date: d, entry });
    }
    return cells;
  }

  function computeStreak(): number {
    // Build a set of active days (yyyy-mm-dd)
    const keys = new Set<string>();
    for (const r of entries) {
      const d = new Date(r.createdAt?.toDate?.() || Date.now());
      const key = d.toISOString().slice(0,10);
      keys.add(key);
    }
    let count = 0;
    const today = new Date();
    for (let i=0; ; i++) {
      const d = new Date(today); d.setDate(d.getDate()-i);
      const key = d.toISOString().slice(0,10);
      if (keys.has(key)) count++; else break;
    }
    return count;
  }

  function computeWeeklyAverages() {
    const mapVal: Record<NonNullable<Reflection['mood']>, number> = { bad:1, ok:2, good:3, great:4 };
    const now = new Date();
    const startOfWeek = (d: Date) => { const x = new Date(d); const day = x.getDay(); x.setHours(0,0,0,0); x.setDate(x.getDate()-day); return x; };
    const currentWkStart = startOfWeek(now);
    const buckets: { label: string; value: number }[] = [];
    for (let i=3;i>=0;i--) {
      const wkStart = new Date(currentWkStart); wkStart.setDate(wkStart.getDate() - i*7);
      const wkEnd = new Date(wkStart); wkEnd.setDate(wkEnd.getDate()+6);
      let sum=0, n=0;
      for (const r of entries) {
        const d = new Date(r.createdAt?.toDate?.() || Date.now());
        if (d >= wkStart && d <= wkEnd) { sum += mapVal[r.mood]; n++; }
      }
      buckets.push({ label: wkStart.toLocaleDateString(undefined,{ month:'short', day:'numeric' }), value: n? Math.round((sum/n)*100)/100 : 0 });
    }
    return buckets;
  }

  return (
    <>
    <View style={s.container} accessibilityLabel="Reflections Calendar" accessible>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Reflections Calendar
      </Text>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
        {(['grid','list'] as const).map(v => (
          <A11yPressable
            key={v}
            onPress={()=> setView(v)}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${v} view`}
            accessibilityState={{ selected: view===v }}
            style={[s.chip, view===v && s.chipActive]}
          >
            <Text style={[s.chipText, view===v && s.chipTextActive]}>{v.toUpperCase()}</Text>
          </A11yPressable>
        ))}
        {([7,14,30,60,90] as const).map(n => (
          <A11yPressable
            key={n}
            onPress={()=> setRangeDays(n)}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel={`Show last ${n} days`}
            accessibilityState={{ selected: rangeDays===n }}
            style={[s.chip, rangeDays===n && s.chipActive]}
          >
            <Text style={[s.chipText, rangeDays===n && s.chipTextActive]}>{n}d</Text>
          </A11yPressable>
        ))}
        <A11yPressable
          onPress={()=> saveTapPref(tapAction==='details'?'editor':'details')}
          hitSlop={HIT_SLOP_8}
          accessibilityRole="button"
          accessibilityLabel={`Toggle tap action. Currently ${tapAction}.`}
          style={[s.chip, s.chipActive]}
        >
          <Text style={[s.chipText, s.chipTextActive]}>Tap: {tapAction==='details'? 'Details':'Editor'}</Text>
        </A11yPressable>
      </View>
      <View style={{ flexDirection:'row', gap:8, marginTop:8, flexWrap:'wrap' }}>
        <A11yPressable
          onPress={exportCSV}
          hitSlop={HIT_SLOP_8}
          accessibilityRole="button"
          accessibilityLabel="Export reflections as CSV"
          style={[s.button]}
        >
          <Text style={s.buttonText}>Export CSV</Text>
        </A11yPressable>
        <A11yPressable
          onPress={exportJSON}
          hitSlop={HIT_SLOP_8}
          accessibilityRole="button"
          accessibilityLabel="Export reflections as JSON"
          style={[s.secondary]}
        >
          <Text style={s.secondaryText}>Export JSON</Text>
        </A11yPressable>
        <A11yPressable
          onPress={()=> setExportOpts(o=> ({ ...o, includeMood: !o.includeMood }))}
          hitSlop={HIT_SLOP_8}
          accessibilityRole="button"
          accessibilityLabel={`Toggle include mood. Currently ${exportOpts.includeMood? 'on':'off'}.`}
          accessibilityState={{ checked: exportOpts.includeMood }}
          style={[s.secondary]}
        >
          <Text style={s.secondaryText}>{exportOpts.includeMood? 'Mood: ON':'Mood: OFF'}</Text>
        </A11yPressable>
        <A11yPressable
          onPress={()=> setExportOpts(o=> ({ ...o, includeText: !o.includeText }))}
          hitSlop={HIT_SLOP_8}
          accessibilityRole="button"
          accessibilityLabel={`Toggle include text. Currently ${exportOpts.includeText? 'on':'off'}.`}
          accessibilityState={{ checked: exportOpts.includeText }}
          style={[s.secondary]}
        >
          <Text style={s.secondaryText}>{exportOpts.includeText? 'Text: ON':'Text: OFF'}</Text>
        </A11yPressable>
      </View>

      <View style={{ flexDirection:'row', gap:8, alignItems:'center', marginTop: 8 }}>
        <DateTimeField label="From" mode="date" value={fromDate || undefined} onChange={(d)=> setFromDate(d||null)} />
        <DateTimeField label="To" mode="date" value={toDate || undefined} onChange={(d)=> setToDate(d||null)} />
      </View>

      {view === 'grid' && (
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
            <A11yPressable
              onPress={()=> setMonthAnchor(prev => new Date(prev.getFullYear(), prev.getMonth()-1, 1))}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              style={[s.secondary,{ paddingHorizontal:12 }]}
            ><Text style={s.secondaryText}>{'‹ Prev'}</Text></A11yPressable>
            <Text style={{ color: palette.text, fontWeight:'700' }}>{monthAnchor.toLocaleString(undefined,{ month:'long', year:'numeric' })}</Text>
            <A11yPressable
              onPress={()=> setMonthAnchor(prev => new Date(prev.getFullYear(), prev.getMonth()+1, 1))}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              style={[s.secondary,{ paddingHorizontal:12 }]}
            ><Text style={s.secondaryText}>{'Next ›'}</Text></A11yPressable>
          </View>
          <View style={{ flexDirection:'row', marginTop: 8 }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (<Text key={d} style={[s.dow]}>{d}</Text>))}
          </View>
          {(() => {
            const cells = computeActiveDates();
            const rows: React.ReactNode[] = [];
            for (let r=0; r<cells.length; r+=7) {
              const slice = cells.slice(r, r+7);
              rows.push(
                <View key={`r-${r}`} style={{ flexDirection:'row' }}>
                  {slice.map((it, i) => {
                    const inMonth = it.date.getMonth() === monthAnchor.getMonth();
                    const bg = it.entry ? moodColors[it.entry.mood] : 'transparent';
                    const borderColor = inMonth ? palette.muted : palette.muted + '55';
                    const key = `${it.date.getFullYear()}-${it.date.getMonth()}-${it.date.getDate()}`;
                    return (
                      <A11yPressable
                        key={`c-${r+i}`}
                        onPress={()=>{
                          if (tapAction==='details') {
                            setDetails({ open:true, date: it.date });
                          } else {
                            setEditor({
                              open: true,
                              date: it.date,
                              entry: it.entry,
                              mood: it.entry?.mood || 'ok',
                              note: it.entry?.note || '',
                            });
                          }
                        }}
                        onLongPress={()=> setQuickKey(key)}
                        hitSlop={HIT_SLOP_8}
                        accessibilityRole="button"
                        accessibilityLabel={`${it.date.toDateString()} ${it.entry? it.entry.mood: 'no entry'}`}
                        style={[s.cell,{ borderColor }]}
                      >
                        <View style={[s.dot, { backgroundColor: bg, opacity: it.entry? 1 : 0 }]} />
                        <Text style={[s.cellText, !inMonth && { opacity: 0.4 }]}>{it.date.getDate()}</Text>
                        {quickKey===key && (
                          <View style={s.quickRow}>
                            {(['bad','ok','good','great'] as const).map(m => (
                              <A11yPressable
                                key={m}
                                onPress={async(e)=>{ e.stopPropagation?.(); try { const { addReflectionAt, addReflection } = await import('../../../services/wellness'); const iso = new Date(it.date.getFullYear(), it.date.getMonth(), it.date.getDate(), 12, 0, 0).toISOString(); const today = new Date(); today.setHours(0,0,0,0); const isPast = new Date(iso).getTime() < today.getTime(); if (isPast && useServerBackdate) { await addReflectionAt(iso, m); } else { await addReflection(m); } setQuickKey(null); load(rangeDays); } catch {} }}
                                hitSlop={HIT_SLOP_8}
                                accessibilityRole="button"
                                accessibilityLabel={`Quick set mood ${m} for ${it.date.toDateString()}`}
                                style={[s.quickChip,{ backgroundColor: moodColors[m] }]}
                              >
                                <Text style={{ color: '#fff', fontSize: 10, fontWeight:'700' }}>{m.toUpperCase()}</Text>
                              </A11yPressable>
                            ))}
                            <A11yPressable
                              onPress={(e)=> { e.stopPropagation?.(); setQuickKey(null); }}
                              hitSlop={HIT_SLOP_8}
                              accessibilityRole="button"
                              accessibilityLabel="Close quick mood options"
                              style={[s.quickChip,{ backgroundColor: palette.muted }]}
                            >
                              <Text style={{ color: '#000', fontSize: 10, fontWeight:'700' }}>X</Text>
                            </A11yPressable>
                          </View>
                        )}
                      </A11yPressable>
                    );
                  })}
                </View>
              );
            }
            return <View style={{ marginTop: 4 }}>{rows}</View>;
          })()}
          <View style={{ flexDirection:'row', gap:12, marginTop: 8 }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}><View style={[s.legendSwatch,{ backgroundColor: moodColors.bad }]} /><Text style={{ color: palette.text }}>Bad</Text></View>
            <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}><View style={[s.legendSwatch,{ backgroundColor: moodColors.ok }]} /><Text style={{ color: palette.text }}>OK</Text></View>
            <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}><View style={[s.legendSwatch,{ backgroundColor: moodColors.good }]} /><Text style={{ color: palette.text }}>Good</Text></View>
            <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}><View style={[s.legendSwatch,{ backgroundColor: moodColors.great }]} /><Text style={{ color: palette.text }}>Great</Text></View>
          </View>
        </View>
      )}

      {/* Streaks and Averages */}
      <View style={{ marginTop: 12 }}>
        <Text style={{ color: palette.text, fontWeight:'700', marginBottom: 6 }}>Current Streak: {computeStreak()} day(s)</Text>
        {(() => { const data = computeWeeklyAverages(); return (
          <View>
            <Text style={{ color: palette.text, marginBottom: 4 }}>Weekly mood averages (1–4)</Text>
            <SimpleBarChart data={data} labelKey="label" valueKey="value" height={100} />
          </View>
        ); })()}
      </View>

      {view === 'list' && (
        <FlatList
          style={{ marginTop: 12 }}
          data={computeActiveDates()}
          keyExtractor={(d)=> d.date.toISOString()}
          renderItem={({ item }) => (
            <A11yPressable
              style={s.dayRow}
              onPress={()=> setDetails({ open:true, date: item.date })}
              onLongPress={()=> setQuickKey(`${item.date.getFullYear()}-${item.date.getMonth()}-${item.date.getDate()}`)}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel={`View day ${item.date.toDateString()} ${item.entry? 'with entry':'no entry'}`}
            >
              <Text style={s.dayDate}>{item.date.toDateString()}</Text>
              <Text style={s.dayMood}>{item.entry ? moods[item.entry.mood] : '—'}</Text>
              <Text style={s.dayNote} numberOfLines={1}>{item.entry?.note || ''}</Text>
            </A11yPressable>
          )}
          ListEmptyComponent={<Text style={{ color: palette.text, opacity: 0.8 }}>{loading? 'Loading…' : 'No reflections yet.'}</Text>}
        />
      )}
    </View>
    {/* Editor Modal */}
    {editor.open && (
      <Modal transparent animationType="fade" onRequestClose={()=> setEditor(prev=>({ ...prev, open:false }))}>
        <A11yPressable style={{ flex:1, backgroundColor:'#0008', alignItems:'center', justifyContent:'center' }} onPress={()=> setEditor(prev=>({ ...prev, open:false }))} accessibilityRole="button" accessibilityLabel="Close editor" hitSlop={HIT_SLOP_8}>
          <View style={{ backgroundColor: palette.surface, padding: 14, borderRadius: 10, width: '90%', maxWidth: 520 }}>
            <Text style={{ color: palette.text, fontWeight:'700', marginBottom: 8 }}>{editor.entry? 'Edit Reflection' : 'New Reflection'}</Text>
            <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginBottom: 8 }}>
              {(['bad','ok','good','great'] as Reflection['mood'][]).map(m => (
                <A11yPressable
                  key={m}
                  onPress={()=> setEditor(prev=>({ ...prev, mood:m }))}
                  hitSlop={HIT_SLOP_8}
                  accessibilityRole="button"
                  accessibilityLabel={`Set mood to ${m}`}
                  accessibilityState={{ selected: editor.mood===m }}
                  style={[s.chip, editor.mood===m && s.chipActive]}
                >
                  <Text style={[s.chipText, editor.mood===m && s.chipTextActive]}>{m.toUpperCase()}</Text>
                </A11yPressable>
              ))}
            </View>
            <TextInput value={editor.note} onChangeText={(v)=> setEditor(prev=>({ ...prev, note:v }))} placeholder="Optional note" placeholderTextColor={palette.text+"77"} style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 10, color: palette.text }} multiline />
            <View style={{ flexDirection:'row', gap:8, marginTop: 10 }}>
              <A11yPressable onPress={async()=>{
                try {
                  if (editor.entry?.id) {
                    const { updateReflection } = await import('../../../services/wellness');
                    await updateReflection(editor.entry.id, { mood: editor.mood, note: editor.note });
                  } else {
                    const { addReflection, addReflectionAt } = await import('../../../services/wellness');
                    if (editor.date) {
                      const base = new Date(editor.date.getFullYear(), editor.date.getMonth(), editor.date.getDate(), 12, 0, 0).toISOString();
                      const today = new Date(); today.setHours(0,0,0,0);
                      const isPast = new Date(base).getTime() < today.getTime();
                      if (isPast && useServerBackdate) await addReflectionAt(base, editor.mood, editor.note);
                      else await addReflection(editor.mood, editor.note);
                    } else {
                      await addReflection(editor.mood, editor.note);
                    }
                  }
                  setEditor({ open:false, date:null, entry: undefined, mood:'ok', note:'' });
                  // reload
                  load(rangeDays);
                } catch { Alert.alert('Save failed','Unable to save reflection.'); }
              }} style={[s.button,{ flex:1 }]} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Save reflection" >
                <Text style={s.buttonText}>Save</Text>
              </A11yPressable>
              <A11yPressable onPress={()=> setEditor({ open:false, date:null, entry: undefined, mood:'ok', note:'' })} style={[s.secondary,{ flex:1 }]} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Cancel editing" >
                <Text style={s.secondaryText}>Cancel</Text>
              </A11yPressable>
            </View>
          </View>
        </A11yPressable>
      </Modal>
    )}
    {/* Details Modal */}
    {details.open && (
      <Modal transparent animationType="fade" onRequestClose={()=> setDetails({ open:false, date:null })}>
        <A11yPressable style={{ flex:1, backgroundColor:'#0008', alignItems:'center', justifyContent:'center' }} onPress={()=> setDetails({ open:false, date:null })} accessibilityRole="button" accessibilityLabel="Close details" hitSlop={HIT_SLOP_8}>
          <View style={{ backgroundColor: palette.surface, padding: 14, borderRadius: 10, width: '94%', maxWidth: 560, maxHeight: '80%' }}>
            <Text style={{ color: palette.text, fontWeight:'700', marginBottom: 8 }}>{details.date?.toDateString()}</Text>
            {/* Day summary */}
            <View style={{ marginBottom: 8 }}>
              {(() => {
                const vals = entries.filter(r => { const d = new Date(r.createdAt?.toDate?.() || Date.now()); return details.date && d.toDateString() === details.date.toDateString(); });
                const mapVal: Record<NonNullable<Reflection['mood']>, number> = { bad:1, ok:2, good:3, great:4 };
                const avg = vals.length ? (vals.reduce((s,r)=> s + mapVal[r.mood], 0) / vals.length) : 0;
                return (
                  <Text style={{ color: palette.text }}>Entries: {vals.length}  •  Avg mood: {avg ? avg.toFixed(2) : '-'} (1–4)</Text>
                );
              })()}
            </View>
            <FlatList
              data={entries.filter(r => { const d = new Date(r.createdAt?.toDate?.() || Date.now()); return details.date && d.toDateString() === details.date.toDateString(); })}
              keyExtractor={(r:any)=> r.id}
              renderItem={({ item:r }) => (
                <View style={{ paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted }}>
                  <Text style={{ color: palette.text, fontWeight:'700' }}>{r.mood.toUpperCase()}</Text>
                  {!!r.note && <Text style={{ color: palette.text }}>{r.note}</Text>}
                  <View style={{ flexDirection:'row', gap:8, marginTop: 6 }}>
                    <A11yPressable onPress={async()=>{ try { const { deleteReflection } = await import('../../../services/wellness'); await deleteReflection(r.id!); load(rangeDays); } catch {} }} style={[s.secondary,{ paddingHorizontal: 12 }]} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Delete reflection" ><Text style={s.secondaryText}>Delete</Text></A11yPressable>
                    <A11yPressable onPress={()=> setEditor({ open:true, date: details.date!, entry: r, mood: r.mood, note: r.note||'' })} style={[s.secondary,{ paddingHorizontal: 12 }]} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Edit reflection" ><Text style={s.secondaryText}>Edit</Text></A11yPressable>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={{ color: palette.text, opacity: 0.9 }}>No entries this day.</Text>}
              style={{ maxHeight: 320 }}
            />
            <View style={{ flexDirection:'row', gap:8, marginTop: 10 }}>
              <A11yPressable onPress={()=> setEditor({ open:true, date: details.date!, entry: undefined, mood:'ok', note:'' })} style={[s.button,{ flex:1 }]} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Add reflection" ><Text style={s.buttonText}>Add Reflection</Text></A11yPressable>
              <A11yPressable onPress={()=> setDetails({ open:false, date:null })} style={[s.secondary,{ flex:1 }]} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Close dialog" ><Text style={s.secondaryText}>Close</Text></A11yPressable>
            </View>
          </View>
        </A11yPressable>
      </Modal>
    )}
    {/* Week/Month quick export */}
    <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
        <A11yPressable onPress={async()=>{ await exportRangeCSV(7); }} style={[s.secondary,{ paddingHorizontal:12 }]} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Export last week as CSV" ><Text style={s.secondaryText}>Export Week CSV</Text></A11yPressable>
        <A11yPressable onPress={async()=>{ await exportRangeCSV(30); }} style={[s.secondary,{ paddingHorizontal:12 }]} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Export last month as CSV" ><Text style={s.secondaryText}>Export Month CSV</Text></A11yPressable>
      </View>
    </View>
    </>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    chip: {
      marginTop: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight: '700' },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    secondary: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingVertical: 10, borderRadius: 8, alignItems: 'center', paddingHorizontal: 12 },
    secondaryText: { color: palette.text, fontWeight: '700' },
    dayRow: { flexDirection:'row', alignItems:'center', gap:8, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    dayDate: { color: palette.text, minWidth: 160 },
    dayMood: { color: palette.text, width: 28, textAlign:'center' },
    dayNote: { color: palette.text, flex: 1 },
    dow: { color: palette.text, opacity: 0.8, flex: 1, textAlign:'center', paddingVertical: 4 },
    cell: { flex: 1, aspectRatio: 1, borderWidth: StyleSheet.hairlineWidth, alignItems:'flex-start', justifyContent:'flex-start', padding: 4, marginRight: 0 },
    cellText: { color: palette.text },
    dot: { width: 14, height: 14, borderRadius: 7, marginBottom: 2 },
    legendSwatch: { width: 12, height: 12, borderRadius: 2 },
    quickRow: { position:'absolute', left: 2, right: 2, bottom: 2, flexDirection:'row', gap:4, flexWrap:'wrap' },
    quickChip: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  });
}
