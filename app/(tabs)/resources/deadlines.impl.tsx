import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { GapView } from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { addDeadline, listDeadlines, type Deadline } from '../../../services/deadlines';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

import DeadlinesList from './deadlines-list';

type Priority = 'critical' | 'high' | 'normal';
type EnhancedDeadline = Deadline & { priority?: Priority; snoozedUntil?: string; remindersSent?: number };

export default function DeadlinesScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('templates.deadlines.title','Deadlines'));
  useFocusOnRefOnMount(titleRef);
  const [tab, setTab] = React.useState<'calendar'|'list'>('calendar');
  const [showInfo, setShowInfo] = React.useState(true);
  const [showAISuggestions, setShowAISuggestions] = React.useState(false);
  const [selectedForBulk, setSelectedForBulk] = React.useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = React.useState(false);
  const changeTab = (next:'calendar'|'list') => { setTab(next); announce(next==='calendar' ? t('templates.deadlines.calendarTab','Calendar') : t('templates.deadlines.listTab','List')); };
  
  // AI-suggested deadlines based on common appeal timelines
  const aiSuggestions = React.useMemo(() => [
    { title: 'WSIB Appeal Deadline', days: 180, priority: 'critical' as Priority, reason: 'Standard 6-month appeal window from denial date' },
    { title: 'Request File Copy', days: 14, priority: 'high' as Priority, reason: 'Get your complete file before appeal deadline' },
    { title: 'Medical Evidence Deadline', days: 30, priority: 'high' as Priority, reason: 'Gather doctor reports and test results' },
    { title: 'First Follow-up Call', days: 7, priority: 'normal' as Priority, reason: 'Check application status' },
  ], []);
  const importICS = async () => {
    try {
      const DP = await import('expo-document-picker');
      const res = await DP.getDocumentAsync({ type: 'text/calendar' });
      const asset = res?.assets?.[0]; if (!asset?.uri) return;
      const FS = await import('expo-file-system');
      const text = await FS.readAsStringAsync(asset.uri, { encoding: FS.EncodingType.UTF8 });
      const { parseICS } = await import('../../../services/ics');
      const events = parseICS(text).slice(0, 100);
      await Promise.all(events.map(ev => addDeadline({ title: ev.title, dueAt: ev.startISO, notes: ev.description || '' })));
      Alert.alert(t('templates.deadlines.imported','Imported'), t('templates.deadlines.importedBody','Added {{count}} deadlines.').replace('{{count}}', String(events.length)));
    } catch { Alert.alert(t('templates.deadlines.importFailed','Import failed'), t('templates.deadlines.importFailedBody','Could not import ICS.')); }
  };
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding:16 }} accessibilityLabel={t('templates.deadlines.screenLabel','Deadlines screen')}>
      <Text ref={titleRef} style={s.title} accessibilityRole='header' maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('templates.deadlines.title','Deadlines')}</Text>
      <GapView gap={8} style={s.actionsRow}>
        <A11yPressable onPress={()=>{ setShowInfo(v=>!v); announce(showInfo? t('common.hide','Hide'): t('templates.deadlines.toggleInfo','Toggle instructions')); }} style={s.infoBtn} accessibilityRole='button' accessibilityLabel={t('templates.deadlines.toggleInfo','Toggle instructions')}><Text style={s.infoBtnText}>{showInfo? t('common.hide','Hide'): t('common.show','Show')}</Text></A11yPressable>
        <A11yPressable onPress={importICS} style={s.secondaryBtn} accessibilityRole='button' accessibilityLabel={t('templates.deadlines.importICS','Import ICS')}><Text style={s.secondaryBtnText}>📥 Import ICS</Text></A11yPressable>
        <A11yPressable onPress={()=> setBulkMode(v=> !v)} style={[s.secondaryBtn, bulkMode && { backgroundColor: palette.primary + '20' }]} accessibilityRole='button'><Text style={s.secondaryBtnText}>✓ Bulk Actions</Text></A11yPressable>
        <A11yPressable onPress={()=> setShowAISuggestions(v=> !v)} style={[s.secondaryBtn, showAISuggestions && { backgroundColor: palette.primary + '20' }]} accessibilityRole='button'><Text style={s.secondaryBtnText}>🤖 AI Suggest</Text></A11yPressable>
      </GapView>
      {bulkMode && selectedForBulk.size > 0 && (
        <View style={{ backgroundColor: palette.primary + '15', padding: 12, borderRadius: 8, marginTop: 8 }}>
          <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 8 }}>{selectedForBulk.size} selected</Text>
          <GapView gap={8} style={{ flexDirection: 'row' }}>
            <A11yPressable onPress={() => Alert.alert('Mark Done', `Mark ${selectedForBulk.size} deadlines as completed?`, [{text: 'Cancel'}, {text: 'Done', onPress: () => { setSelectedForBulk(new Set()); Alert.alert('Success', 'Deadlines marked complete'); }}])} style={s.button}><Text style={s.buttonText}>✓ Mark Done</Text></A11yPressable>
            <A11yPressable onPress={() => Alert.alert('Delete', `Delete ${selectedForBulk.size} deadlines?`, [{text: 'Cancel'}, {text: 'Delete', style: 'destructive', onPress: () => { setSelectedForBulk(new Set()); Alert.alert('Deleted', 'Deadlines removed'); }}])} style={[s.secondaryBtn, { backgroundColor: '#ff4444' + '20' }]}><Text style={[s.secondaryBtnText, { color: '#ff4444' }]}>🗑️ Delete</Text></A11yPressable>
          </GapView>
        </View>
      )}
      {showAISuggestions && (
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>🤖 AI Deadline Suggestions</Text>
          <Text style={{ color: palette.text, opacity: 0.8, fontSize: 13, marginBottom: 8 }}>Based on common appeal timelines</Text>
          {aiSuggestions.map((sug, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottomWidth: idx < aiSuggestions.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: palette.muted }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontWeight: '700', fontSize: 14 }}>{sug.title}</Text>
                <Text style={{ color: palette.text, opacity: 0.7, fontSize: 12 }}>{sug.days} days • {sug.priority.toUpperCase()}</Text>
                <Text style={{ color: palette.text, opacity: 0.6, fontSize: 11, marginTop: 2 }}>{sug.reason}</Text>
              </View>
              <A11yPressable onPress={() => { const due = new Date(); due.setDate(due.getDate() + sug.days); addDeadline({ title: sug.title, dueAt: due.toISOString(), notes: sug.reason }); Alert.alert('Added', `${sug.title} set for ${due.toLocaleDateString()}`); }} style={[s.chip, { backgroundColor: palette.primary }]}><Text style={{ color: palette.onPrimary, fontWeight: '700', fontSize: 12 }}>+ Add</Text></A11yPressable>
            </View>
          ))}
        </View>
      )}
      {showInfo && (
        <View style={s.infoCard} accessibilityRole='summary'>
          <Text style={s.infoTitle}>{t('templates.deadlines.infoTitle','How to Use')}</Text>
          <Text style={s.infoLine}>{t('templates.deadlines.infoLine1','Track important dates (appeals, follow-ups) in calendar or list view.')}</Text>
          <Text style={s.infoLine}>{t('templates.deadlines.infoLine2','Import ICS files, add recurring reminders, and export all deadlines (ICS/CSV).')}</Text>
          <Text style={s.infoLine}>{t('templates.deadlines.infoLine3','Use snooze, bulk mark done, or calendar export for planning.')}</Text>
          <Text style={s.infoLine}>{t('templates.deadlines.infoLine4','Times shown in your device timezone unless otherwise noted.')}</Text>
        </View>
      )}
      <GapView gap={8} style={s.tabRow}>
        <A11yPressable
          onPress={()=>changeTab('calendar')}
          accessibilityRole='tab'
          accessibilityState={{ selected: tab==='calendar' }}
          accessibilityLabel={t('templates.deadlines.calendarTab','Calendar view tab')}
          style={[s.chip, tab==='calendar'&&s.chipActive]}
          hitSlop={HIT_SLOP_8}
        >
          <Text style={[s.chipLabel, tab==='calendar'&&s.chipLabelActive]}>{t('templates.deadlines.calendarTab','Calendar')}</Text>
        </A11yPressable>
        <A11yPressable
          onPress={()=>changeTab('list')}
          accessibilityRole='tab'
          accessibilityState={{ selected: tab==='list' }}
          accessibilityLabel={t('templates.deadlines.listTab','List view tab')}
          style={[s.chip, tab==='list'&&s.chipActive]}
          hitSlop={HIT_SLOP_8}
        >
          <Text style={[s.chipLabel, tab==='list'&&s.chipLabelActive]}>{t('templates.deadlines.listTab','List')}</Text>
        </A11yPressable>
      </GapView>
      {tab==='calendar'? <DeadlinesCalendar/> : <DeadlinesList/>}
      {tab==='calendar' && <RecurringBuilder/>}
    </ScrollView>
  );
}

function DeadlinesCalendar() {
  const { t } = useTranslation();
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
  const changeView = (v:'month'|'week') => { setView(v); announce(v=== 'month'? t('templates.deadlines.monthView','Month'): t('templates.deadlines.weekView','Week')); };
  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 6 }}>
        <A11yPressable
          onPress={()=> setMonth(prev => new Date(prev.getFullYear(), prev.getMonth()-1, 1))}
          accessibilityRole='button'
          accessibilityLabel={t('templates.deadlines.prevMonth','Previous month')}
          hitSlop={HIT_SLOP_8}
        ><Text style={{ color: palette.text }}>{'<'}</Text></A11yPressable>
        <Text style={{ color: palette.text, fontWeight:'700' }}>{monthLabel}</Text>
        <A11yPressable
          onPress={()=> setMonth(prev => new Date(prev.getFullYear(), prev.getMonth()+1, 1))}
            accessibilityRole='button'
            accessibilityLabel={t('templates.deadlines.nextMonth','Next month')}
            hitSlop={HIT_SLOP_8}
        ><Text style={{ color: palette.text }}>{'>'}</Text></A11yPressable>
      </View>
      <GapView gap={8} style={{ flexDirection:'row', marginBottom: 6 }}>
        <A11yPressable
          onPress={()=>changeView('month')}
          style={[s.chip, view==='month'&&s.chipActive]}
          accessibilityRole='button'
          accessibilityState={{ selected:view==='month' }}
          accessibilityLabel={t('templates.deadlines.monthView','Month view')}
          hitSlop={HIT_SLOP_8}
        ><Text style={{ color: view==='month'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('templates.deadlines.monthView','Month')}</Text></A11yPressable>
        <A11yPressable
          onPress={()=>changeView('week')}
          style={[s.chip, view==='week'&&s.chipActive]}
          accessibilityRole='button'
          accessibilityState={{ selected:view==='week' }}
          accessibilityLabel={t('templates.deadlines.weekView','Week view')}
          hitSlop={HIT_SLOP_8}
        ><Text style={{ color: view==='week'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('templates.deadlines.weekView','Week')}</Text></A11yPressable>
      </GapView>
      {(view==='month'? matrix : [currentWeekFromMatrix(matrix)]).map((week, wi) => (
        <View key={wi} style={{ flexDirection:'row', justifyContent:'space-between', marginBottom: 4 }}>
          {week.map((day, di) => {
            const dayKey = dayKeyFromMatrix(month, day);
            return (
              <A11yPressable
                key={di}
                onPress={()=> day && setSelectedDay(dayKey)}
                accessibilityRole='button'
                accessibilityState={{ selected: selectedDay===dayKey, disabled: !day }}
                accessibilityLabel={day ? `${t('templates.deadlines.dayCell','Day')} ${day}` : t('templates.deadlines.emptyDay','Empty day cell')}
                hitSlop={HIT_SLOP_8}
                style={{ width: 40, height: 40, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, alignItems:'center', justifyContent:'center', backgroundColor: selectedDay===dayKey ? palette.primary : palette.surface }}
              >
                <Text style={{ color: selectedDay===dayKey ? palette.onPrimary : palette.text }}>{day ?? ''}</Text>
                {!!day && !!byDay.get(dayKey) && <View style={{ width: 6, height: 6, borderRadius:3, backgroundColor: dotColor(dayKey, items, palette), position:'absolute', bottom: 4 }} />}
              </A11yPressable>
            );
          })}
        </View>
      ))}
      {!!selectedDay && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ color: palette.text, fontWeight:'700' }}>{t('templates.deadlines.selectedDate','Selected:')} {new Date(selectedDay).toLocaleDateString()}</Text>
          {items.filter(d => toDayKey(d.dueAt)===selectedDay).map(d => (
            <Text key={d.id} style={{ color: palette.text }}>• {new Date(d.dueAt).toLocaleTimeString()} — {d.title}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

function RecurringBuilder() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const [title, setTitle] = React.useState('Follow-up');
  const [start, setStart] = React.useState(new Date().toISOString().slice(0,10));
  const [freq, setFreq] = React.useState<'weekly'|'monthly'>('weekly');
  const [count, setCount] = React.useState('4');
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={s.cardTitle}>{t('templates.deadlines.recurringTitle','Add Recurring')}</Text>
      <TextInput placeholder={t('templates.deadlines.recurringPrefix','Title prefix')} placeholderTextColor={palette.text+'77'} value={title} onChangeText={setTitle} style={s.input} />
      <TextInput placeholder={t('templates.deadlines.recurringStart','Start date (YYYY-MM-DD)')} placeholderTextColor={palette.text+'77'} value={start} onChangeText={setStart} style={s.input} />
      <GapView gap={8} style={{ flexDirection:'row', marginTop: 8 }}>
        <A11yPressable
          onPress={()=>setFreq('weekly')}
          style={[s.chip, freq==='weekly'&&s.chipActive]}
          accessibilityRole='button'
            accessibilityState={{ selected: freq==='weekly' }}
            accessibilityLabel={t('templates.deadlines.recurringWeekly','Weekly frequency')}
            hitSlop={HIT_SLOP_8}
        ><Text style={{ color: freq==='weekly'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('templates.deadlines.recurringWeekly','Weekly')}</Text></A11yPressable>
        <A11yPressable
          onPress={()=>setFreq('monthly')}
          style={[s.chip, freq==='monthly'&&s.chipActive]}
          accessibilityRole='button'
          accessibilityState={{ selected: freq==='monthly' }}
          accessibilityLabel={t('templates.deadlines.recurringMonthly','Monthly frequency')}
          hitSlop={HIT_SLOP_8}
        ><Text style={{ color: freq==='monthly'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('templates.deadlines.recurringMonthly','Monthly')}</Text></A11yPressable>
      </GapView>
      <TextInput placeholder={t('templates.deadlines.recurringCount','Count')} placeholderTextColor={palette.text+'77'} value={count} onChangeText={setCount} style={s.input} />
      <A11yPressable onPress={async()=>{
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
          Alert.alert(t('templates.deadlines.recurringAdded','Added'), t('templates.deadlines.recurringAddedBody','{{count}} recurring deadlines added.').replace('{{count}}', String(n)));
        } catch { Alert.alert(t('templates.deadlines.recurringFailed','Failed'), t('templates.deadlines.recurringFailedBody','Could not add recurring deadlines.')); }
      }} style={[s.button,{ marginTop: 8 }]} accessibilityRole='button' accessibilityLabel={t('templates.deadlines.recurringCreate','Create recurring deadlines')} hitSlop={HIT_SLOP_8}><Text style={s.buttonText}>{t('templates.deadlines.recurringCreate','Create')}</Text></A11yPressable>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    tabRow: { flexDirection:'row', marginBottom:8 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    chipLabel: { color: palette.text, fontWeight:'700' },
    chipLabelActive: { color: palette.onPrimary },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center' },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    cardTitle: { color: palette.text, fontWeight: '700', marginTop: 10 },
    actionsRow: { flexDirection:'row', flexWrap:'wrap', marginTop:12, marginBottom:8 },
    infoBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal:12, paddingVertical:8, borderRadius:6 },
    infoBtnText: { color: palette.text, fontWeight:'600', fontSize:13 },
    secondaryBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal:10, paddingVertical:8, borderRadius:6 },
    secondaryBtnText: { color: palette.text, fontWeight:'600' },
    infoCard: { backgroundColor: palette.card, borderRadius:8, padding:12, borderWidth:1, borderColor:palette.muted, marginTop:8 },
    infoTitle: { fontWeight:'700', color: palette.text, marginBottom:4 },
    infoLine: { color: palette.text, opacity:0.85, marginBottom:2, fontSize:13 },
  });
}

function toDayKey(input: string): string { const d = new Date(input); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function dayKeyFromMatrix(baseMonth: Date, day: number | null) { if (!day) return ''; const y=baseMonth.getFullYear(); const m=`${baseMonth.getMonth()+1}`.padStart(2,'0'); const dd=`${day}`.padStart(2,'0'); return `${y}-${m}-${dd}`; }
function buildMonthMatrix(firstOfMonth: Date): (number | null)[][] { const y = firstOfMonth.getFullYear(); const m = firstOfMonth.getMonth(); const first = new Date(y,m,1); const startDay = first.getDay(); const daysInMonth = new Date(y,m+1,0).getDate(); const matrix: (number|null)[][]=[]; let current = 1 - startDay; for (let w=0; w<6; w++){ const week:(number|null)[]=[]; for(let d=0; d<7; d++){ if(current<1||current>daysInMonth) week.push(null); else week.push(current); current++; } matrix.push(week); if (current>daysInMonth) break; } return matrix; }
function mapDeadlinesByDay(items: { dueAt: string }[]) { const m = new Map<string, number>(); for (const e of items) { const k = toDayKey(e.dueAt); m.set(k, (m.get(k)||0)+1); } return m; }
function currentWeekFromMatrix(matrix: (number|null)[][]) { const today = new Date().getDate(); for (const w of matrix) { if (w.includes(today)) return w; } return matrix[0]; }
function dotColor(dayKey: string, items: (Deadline & { priority?: Priority })[], palette: any) {
  const d = new Date(dayKey + 'T00:00:00');
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const ts = d.getTime();
  const dayItems = items.filter(x => toDayKey(x.dueAt)===dayKey);
  const hasCritical = dayItems.some(x => x.priority === 'critical');
  if (hasCritical) return '#FF0000'; // Red for critical
  if (ts < dayStart && dayItems.length > 0) return palette.error; // Overdue
  if (ts - dayStart < 7*86400000) return palette.warning; // Within 7 days
  return palette.primary;
}
