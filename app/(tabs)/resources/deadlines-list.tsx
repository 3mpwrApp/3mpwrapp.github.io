import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { GapView } from '../../../components/GapView';
import { MAX_FONT_SCALE, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { usePostLoadAnnounce } from '../../../hooks/usePostLoadAnnounce';
import { useTranslation } from '../../../i18n';
import { addEvent } from '../../../services/calendar';
import { deleteDeadline, listDeadlines, updateDeadline, type Deadline } from '../../../services/deadlines';
import { buildICS, buildICSMany, parseICS } from '../../../services/ics';
import * as Notifier from '../../../services/notifications';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

export const options = { href: null };

export default function DeadlinesList() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState<Deadline[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState<string>("");
  const [editDate, setEditDate] = React.useState<string>("");
  const [lastDeleted, setLastDeleted] = React.useState<Deadline | null>(null);
  const undoTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const rows = await listDeadlines();
      setItems(rows);
    } catch {
      Alert.alert(t('templates.deadlines.loadFailed','Load failed'), t('templates.deadlines.loadFailedBody','Unable to load deadlines.'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load(); // initial load announces count
  }, [load]);

  // One-time post-load announcement using reusable hook
  usePostLoadAnnounce({ loading, count: items.length, ns: 'templates.deadlines', emptyKey: 'templates.deadlines.empty' });

  // Updated: i18n for export alerts
  const exportAll = async () => {
    try {
      const events = items.map((d) => ({
        title: d.title,
        description: d.notes,
        startISO: d.dueAt,
        durationMinutes: 30,
      }));
      const ics = buildICSMany(events);
      const FS = await import('expo-file-system');
      const path = FS.cacheDirectory + `deadlines_${Date.now()}.ics`;
      await FS.writeAsStringAsync(path, ics, { encoding: FS.EncodingType.UTF8 });
      try {
        const Sharing = await import('expo-sharing');
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
        else Alert.alert(t('templates.deadlines.saved','Saved'), t('templates.deadlines.icsSaved','ICS saved to cache.'));
      } catch {
        Alert.alert(t('templates.deadlines.saved','Saved'), t('templates.deadlines.savedCacheShareNA','File saved to cache (sharing unavailable).'));
      }
    } catch {
      Alert.alert(t('templates.deadlines.exportFailed','Export failed'), t('templates.deadlines.exportFailedBodyIcs','Could not create ICS.'));
    }
  };
  // Updated: internationalized headers + alerts
  const exportCSV = async () => {
    try {
      const rows = [[
        t('templates.deadlines.csvHeaderDate','date'),
        t('templates.deadlines.csvHeaderTitle','title'),
        t('templates.deadlines.csvHeaderNotes','notes'),
        t('templates.deadlines.csvHeaderDone','done')
      ], ...items.map(d => [d.dueAt, d.title, (d.notes||'').replace(/\n/g,' '), String(!!d.done)])];
      const csv = rows.map(r=> r.map(x=> '"' + String(x||'').replace(/"/g,'""') + '"').join(',')).join('\n');
      const FS = await import('expo-file-system');
      const path = FS.cacheDirectory + `deadlines_${Date.now()}.csv`;
      await FS.writeAsStringAsync(path, csv, { encoding: FS.EncodingType.UTF8 });
      try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path); else Alert.alert(t('templates.deadlines.csvSaved','Saved'), t('templates.deadlines.csvSavedBody','CSV saved to cache.')); }
      catch { Alert.alert(t('templates.deadlines.csvSaved','Saved'), t('templates.deadlines.csvSavedShareNA','CSV saved to cache (sharing unavailable).')); }
    } catch { Alert.alert(t('templates.deadlines.exportFailed','Export failed'), t('templates.deadlines.exportFailedBodyCsv','Could not create CSV.')); }
  };

  const grouped = React.useMemo(() => {
    const map = new Map<string, Deadline[]>();
    items.forEach((d) => {
      const dt = new Date(d.dueAt);
      const key = dt.toLocaleString(undefined, { month: 'long', year: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    });
    return Array.from(map.entries());
  }, [items]);

  const statusStyle = (dueISO: string) => {
    const now = Date.now();
    const due = new Date(dueISO).getTime();
    if (due < now) return { color: palette.error };
    if (due - now < 7 * 86400000) return { color: palette.primary };
    return { color: palette.text };
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('templates.deadlines.myDeadlines','My Deadlines')} {loading ? t('common.loading','(loading...)') : ''}
      </Text>
      <DisclaimerBanner type="legal" compact />
  <A11yPressable onPress={() => load()} style={s.button} accessibilityLabel={t('templates.deadlines.reload','Reload deadlines')}><Text style={s.buttonText}>{t('templates.deadlines.reloadShort','Reload')}</Text></A11yPressable>
      <A11yPressable onPress={async () => {
        try {
          const DP = await import('expo-document-picker');
          const result = await DP.getDocumentAsync({ type: 'text/calendar' });
          if (result?.assets?.[0]?.uri) {
            const { uri } = result.assets[0];
            const FS = await import('expo-file-system');
            const text = await FS.readAsStringAsync(uri, { encoding: FS.EncodingType.UTF8 });
            const events = parseICS(text).slice(0, 50);
            for (const ev of events) {
              await (await import('../../../services/deadlines')).addDeadline({ title: ev.title, dueAt: ev.startISO, notes: ev.description || '' });
            }
            Alert.alert(t('templates.deadlines.imported','Imported'), t('templates.deadlines.importedBody','Added {{count}} deadlines.').replace('{{count}}', String(events.length)));
            load();
          }
        } catch { Alert.alert(t('templates.deadlines.importFailed','Import failed'), t('templates.deadlines.importFailedBody','Could not import ICS file.')); }
      }} style={[s.button, { marginTop: 8 }]}>
        <Text style={s.buttonText}>{t('templates.deadlines.importICS','Import ICS')}</Text>
      </A11yPressable>
      {items.length > 0 && (
        <A11yPressable onPress={exportAll} style={[s.button, { marginTop: 8 }]}> 
          <Text style={s.buttonText}>{t('templates.deadlines.exportAllICS','Export all as ICS')}</Text>
        </A11yPressable>
      )}
      {items.length > 0 && (
        <A11yPressable onPress={exportCSV} style={[s.button, { marginTop: 8 }]}> 
          <Text style={s.buttonText}>{t('templates.deadlines.exportAllCSV','Export all as CSV')}</Text>
        </A11yPressable>
      )}
      {items.length > 0 && (
        <GapView gap={8} style={{ flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' }}>
          <A11yPressable
            onPress={async () => {
              try {
                const { updateDeadline } = await import('../../../services/deadlines');
                await Promise.all(items.map((d) => updateDeadline(d.id!, { done: true })));
                load();
                announce(t('templates.deadlines.bulkMarkedDone','All marked done'));
              } catch { Alert.alert(t('templates.deadlines.bulkUpdateFailed','Bulk update failed'), t('templates.deadlines.bulkUpdateFailedBody','Unable to mark all done.')); }
            }}
            style={s.button}
          >
            <Text style={s.buttonText}>{t('templates.deadlines.markAllDone','Mark all done')}</Text>
          </A11yPressable>
          <A11yPressable
            onPress={async () => {
              try {
                const { updateDeadline } = await import('../../../services/deadlines');
                await Promise.all(items.map((d) => updateDeadline(d.id!, { done: false })));
                load();
                announce(t('templates.deadlines.bulkMarkedUndone','All marked not-done'));
              } catch { Alert.alert(t('templates.deadlines.bulkUpdateFailed','Bulk update failed'), t('templates.deadlines.bulkUpdateFailedBody','Unable to mark all not-done.')); }
            }}
            style={s.button}
          >
            <Text style={s.buttonText}>{t('templates.deadlines.markAllNotDone','Mark all not-done')}</Text>
          </A11yPressable>
        </GapView>
      )}
      <GapView gap={8} style={{ flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' }}>
        <A11yPressable
          onPress={async () => {
            try {
              const { addDeadline } = await import('../../../services/deadlines');
              const base = t('templates.deadlines.followUp','Follow-up');
              const now = new Date();
              const adds = Array.from({ length: 4 }, (_, i) => {
                const dt = new Date(now.getTime() + (i+1) * 7 * 86400000);
                return addDeadline({ title: `${base} (${t('templates.deadlines.weekShort','Week')} ${i+1})`, dueAt: dt.toISOString(), notes: '' });
              });
              await Promise.all(adds);
              load();
              announce(t('templates.deadlines.recurringAdded','Added'));
            } catch { Alert.alert(t('templates.deadlines.addFailed','Add failed'), t('templates.deadlines.addFailedWeeklyBody','Could not add weekly reminders.')); }
          }}
          style={s.button}
        >
          <Text style={s.buttonText}>{t('templates.deadlines.addWeekly','Add weekly x4')}</Text>
        </A11yPressable>
        <A11yPressable
          onPress={async () => {
            try {
              const { addDeadline } = await import('../../../services/deadlines');
              const base = t('templates.deadlines.followUp','Follow-up');
              const now = new Date();
              const adds = Array.from({ length: 6 }, (_, i) => {
                const dt = new Date(now);
                dt.setMonth(dt.getMonth() + (i+1));
                return addDeadline({ title: `${base} (${t('templates.deadlines.monthShort','Month')} ${i+1})`, dueAt: dt.toISOString(), notes: '' });
              });
              await Promise.all(adds);
              load();
              announce(t('templates.deadlines.recurringAdded','Added'));
            } catch { Alert.alert(t('templates.deadlines.addFailed','Add failed'), t('templates.deadlines.addFailedMonthlyBody','Could not add monthly reminders.')); }
          }}
          style={s.button}
        >
          <Text style={s.buttonText}>{t('templates.deadlines.addMonthly','Add monthly x6')}</Text>
        </A11yPressable>
      </GapView>
      {items.length === 0 ? (
        <Text style={{ color: palette.text, marginTop: 8 }}>{t('templates.deadlines.empty','No deadlines saved.')}</Text>
      ) : (
        grouped.map(([month, ds]) => (
          <View key={month}>
            <Text style={[s.cardTitle, { marginTop: 12 }]}>{month}</Text>
            {ds.map((d) => (
              <View key={d.id} style={s.card}>
                <Text style={[s.cardTitle, statusStyle(d.dueAt)]}>{new Date(d.dueAt).toLocaleString()} — {d.title}</Text>
                {d.notes ? <Text style={s.cardText}>{d.notes}</Text> : null}
                {editingId === d.id ? (
                  <View style={{ marginVertical: 8 }}>
                    <Text style={s.cardText}>{t('templates.deadlines.editTitle','Edit title')}</Text>
                    <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}>
                      <Text style={{ color: palette.text, padding: 6 }}>{editTitle}</Text>
                    </View>
                    <Text style={s.cardText}>{t('templates.deadlines.editDate','Edit date (YYYY-MM-DD)')}</Text>
                    <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6, marginBottom: 6 }}>
                      <Text style={{ color: palette.text, padding: 6 }}>{editDate}</Text>
                    </View>
                    <GapView gap={8} style={{ flexDirection: 'row' }}>
                      <A11yPressable
                        onPress={async () => {
                          try { await updateDeadline(d.id!, { title: editTitle, dueAt: new Date(editDate).toISOString() }); setEditingId(null); load(); announce(t('templates.deadlines.updated','Updated')); setTimeout(()=> titleRef.current?.focus?.(), 30); }
                          catch { Alert.alert(t('templates.deadlines.updateFailed','Update failed'), t('templates.deadlines.updateFailedBody','Check your inputs.')); }
                        }}
                        style={s.smallBtn}
                      >
                        <Text style={s.smallBtnText}>{t('common.save','Save')}</Text>
                      </A11yPressable>
                      <A11yPressable onPress={() => setEditingId(null)} style={s.smallBtn}>
                        <Text style={s.smallBtnText}>{t('common.cancel','Cancel')}</Text>
                      </A11yPressable>
                    </GapView>
                  </View>
                ) : null}
                <GapView gap={8} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <A11yPressable
                    onPress={async () => {
                      const ok = await Notifier.scheduleAt(new Date(Date.now() + 24*60*60*1000), t('templates.deadlines.snoozedDeadline','Snoozed deadline'), d.title);
                      Alert.alert(ok ? t('templates.deadlines.snoozed','Snoozed') : t('templates.deadlines.notScheduled','Not scheduled'), ok ? t('templates.deadlines.reminder24h','Reminder in 24 hours.') : t('templates.deadlines.unableSchedule','Unable to schedule.'));
                    }}
                    style={s.smallBtn}
                  >
                    <Text style={s.smallBtnText}>{t('templates.deadlines.snooze24h','Snooze 24h')}</Text>
                  </A11yPressable>
                  <A11yPressable
                    onPress={async () => {
                      try {
                        const { addDeadline } = await import('../../../services/deadlines');
                        await addDeadline({ title: d.title + ' (copy)', dueAt: new Date(d.dueAt).toISOString(), notes: d.notes||'' });
                        announce(t('templates.deadlines.duplicated','Duplicated'));
                        load();
                      } catch { Alert.alert(t('templates.deadlines.duplicateFailed','Duplicate failed'), t('templates.deadlines.duplicateFailedBody','Unable to duplicate.')); }
                    }}
                    style={s.smallBtn}
                    accessibilityLabel={t('templates.deadlines.duplicate','Duplicate deadline')}
                  >
                    <Text style={s.smallBtnText}>{t('templates.deadlines.duplicate','Duplicate')}</Text>
                  </A11yPressable>
                  <A11yPressable
                    onPress={async () => {
                      const ok = await Notifier.scheduleAt(new Date(Date.now() + 7*24*60*60*1000), t('templates.deadlines.snoozedDeadline','Snoozed deadline'), d.title);
                      Alert.alert(ok ? t('templates.deadlines.snoozed','Snoozed') : t('templates.deadlines.notScheduled','Not scheduled'), ok ? t('templates.deadlines.reminder7d','Reminder in 7 days.') : t('templates.deadlines.unableSchedule','Unable to schedule.'));
                    }}
                    style={s.smallBtn}
                  >
                    <Text style={s.smallBtnText}>{t('templates.deadlines.snooze7d','Snooze 7d')}</Text>
                  </A11yPressable>
                  <A11yPressable
                    onPress={async () => {
                      try { await updateDeadline(d.id!, { done: !d.done }); load(); announce(d.done ? t('templates.deadlines.markedUndone','Marked undone') : t('templates.deadlines.markedDone','Marked done')); }
                      catch { Alert.alert(t('templates.deadlines.updateFailed','Update failed'), t('templates.deadlines.updateFailedBody','Unable to update.')); }
                    }}
                    style={s.smallBtn}
                  >
                    <Text style={s.smallBtnText}>{d.done ? t('templates.deadlines.markUndone','Mark undone') : t('templates.deadlines.markDone','Mark done')}</Text>
                  </A11yPressable>
                  <A11yPressable
                    onPress={() => { setEditingId(d.id!); setEditTitle(d.title); setEditDate(d.dueAt.slice(0,10)); }}
                    style={s.smallBtn}
                  >
                    <Text style={s.smallBtnText}>{t('common.edit','Edit')}</Text>
                  </A11yPressable>
                  <A11yPressable
                    onPress={async () => {
                      const ok = await addEvent({ title: d.title, notes: d.notes, startISO: d.dueAt, durationMinutes: 30 });
                      Alert.alert(ok ? t('templates.deadlines.eventAdded','Added') : t('templates.deadlines.eventNotAdded','Not added'), ok ? t('templates.deadlines.eventAddedBody','Event added to calendar.') : t('templates.deadlines.eventNotAddedBody','Unable to add event.'));
                    }}
                    style={s.smallBtn}
                  >
                    <Text style={s.smallBtnText}>{t('templates.deadlines.calendarAdd','Calendar')}</Text>
                  </A11yPressable>
                  <A11yPressable
                    onPress={async () => {
                      try {
                        const ics = buildICS({ title: d.title, description: d.notes, startISO: d.dueAt, durationMinutes: 30 });
                        const FS = await import('expo-file-system');
                        const path = FS.cacheDirectory + `deadline_${d.id}.ics`;
                        await FS.writeAsStringAsync(path, ics, { encoding: FS.EncodingType.UTF8 });
                        const Sharing = await import('expo-sharing');
                        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
                        else Alert.alert(t('templates.deadlines.saved','Saved'), t('templates.deadlines.icsSaved','ICS saved to cache.'));
                      } catch { Alert.alert(t('templates.deadlines.exportFailed','Export failed'), t('templates.deadlines.exportFailedBody','Could not create ICS.')); }
                    }}
                    style={s.smallBtn}
                  >
                    <Text style={s.smallBtnText}>{t('templates.deadlines.icsBtn','ICS')}</Text>
                  </A11yPressable>
                  <A11yPressable
                    onPress={async () => {
                      try {
                        const copy: Deadline = { ...d };
                        await deleteDeadline(d.id!);
                        setItems((prev) => prev.filter((x) => x.id !== d.id));
                        setLastDeleted(copy);
                        if (undoTimer.current) clearTimeout(undoTimer.current);
                        undoTimer.current = setTimeout(() => { setLastDeleted(null); }, 6000);
                        announce(t('templates.deadlines.deleted','Deleted'));
                      } catch { Alert.alert(t('templates.deadlines.deleteFailed','Delete failed'), t('templates.deadlines.deleteFailedBody','Unable to delete.')); }
                    }}
                    style={s.smallBtn}
                  >
                    <Text style={s.smallBtnText}>{t('common.delete','Delete')}</Text>
                  </A11yPressable>
                </GapView>
              </View>
            ))}
          </View>
        ))
      )}
      {lastDeleted && (
        <View style={{ marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }} accessibilityLiveRegion="polite">
          <Text style={{ color: palette.text, marginBottom: 6 }}>{t('templates.deadlines.deleted','Deleted')} – {lastDeleted.title}</Text>
          <A11yPressable
            onPress={async () => {
              try {
                const { addDeadline } = await import('../../../services/deadlines');
                if (lastDeleted) {
                  await addDeadline({ title: lastDeleted.title, dueAt: lastDeleted.dueAt, notes: lastDeleted.notes||'' });
                  announce(t('templates.deadlines.restored','Restored'));
                }
                setLastDeleted(null);
                load();
              } catch { Alert.alert(t('templates.deadlines.undoFailed','Undo failed'), t('templates.deadlines.undoFailedBody','Could not restore.')); }
            }}
            style={s.button}
            accessibilityLabel={t('templates.deadlines.undoDelete','Undo delete')}
          >
            <Text style={s.buttonText}>{t('templates.deadlines.undoDelete','Undo delete')}</Text>
          </A11yPressable>
        </View>
      )}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 6 },
    smallBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    smallBtnText: { color: palette.text, fontWeight: '700' },
  });
}
