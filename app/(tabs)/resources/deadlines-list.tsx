import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';
import A11yPressable from '../../../components/A11yPressable';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { listDeadlines, deleteDeadline, type Deadline } from '../../../services/deadlines';
import { buildICSMany, buildICS } from '../../../services/ics';
import * as Notifier from '../../../services/notifications';
import { addEvent } from '../../../services/calendar';

export const options = { href: null };

export default function DeadlinesList() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('My Deadlines');
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState<Deadline[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const rows = await listDeadlines();
      setItems(rows);
    } catch {
      Alert.alert('Load failed', 'Unable to load deadlines.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

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
        else Alert.alert('Saved', 'ICS saved to cache.');
      } catch {
        Alert.alert('Saved', 'ICS saved to cache (sharing unavailable).');
      }
    } catch {
      Alert.alert('Export failed', 'Could not create ICS.');
    }
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
    if (due < now) return { color: '#b00020' };
    if (due - now < 7 * 86400000) return { color: palette.primary };
    return { color: palette.text };
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        My Deadlines {loading ? '(loading...)' : ''}
      </Text>
      <A11yPressable onPress={load} style={s.button}><Text style={s.buttonText}>Reload</Text></A11yPressable>
      {items.length > 0 && (
        <A11yPressable onPress={exportAll} style={[s.button, { marginTop: 8 }]}>
          <Text style={s.buttonText}>Export all as ICS</Text>
        </A11yPressable>
      )}
      {items.length === 0 ? (
        <Text style={{ color: palette.text, marginTop: 8 }}>No deadlines saved.</Text>
      ) : (
        grouped.map(([month, ds]) => (
          <View key={month}>
            <Text style={[s.cardTitle, { marginTop: 12 }]}>{month}</Text>
            {ds.map((d) => (
              <View key={d.id} style={s.card}>
                <Text style={[s.cardTitle, statusStyle(d.dueAt)]}>{new Date(d.dueAt).toLocaleString()} — {d.title}</Text>
                {d.notes ? <Text style={s.cardText}>{d.notes}</Text> : null}
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  <A11yPressable
                    onPress={async () => {
                      const ok = await Notifier.scheduleAt(new Date(Date.now() + 24*60*60*1000), 'Snoozed deadline', d.title);
                      Alert.alert(ok ? 'Snoozed' : 'Not scheduled', ok ? 'Reminder in 24 hours.' : 'Unable to schedule.');
                    }}
                    style={s.smallBtn}
                  >
                    <Text style={s.smallBtnText}>Snooze 24h</Text>
                  </A11yPressable>
                  <A11yPressable
                    onPress={async () => {
                      const ok = await addEvent({ title: d.title, notes: d.notes, startISO: d.dueAt, durationMinutes: 30 });
                      Alert.alert(ok ? 'Added' : 'Not added', ok ? 'Event added to calendar.' : 'Unable to add event.');
                    }}
                    style={s.smallBtn}
                  >
                    <Text style={s.smallBtnText}>Calendar</Text>
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
                        else Alert.alert('Saved', 'ICS saved to cache.');
                      } catch { Alert.alert('Export failed', 'Could not create ICS.'); }
                    }}
                    style={s.smallBtn}
                  >
                    <Text style={s.smallBtnText}>ICS</Text>
                  </A11yPressable>
                  <A11yPressable
                    onPress={async () => {
                      try { await deleteDeadline(d.id!); setItems((prev) => prev.filter((x) => x.id !== d.id)); }
                      catch { Alert.alert('Delete failed', 'Unable to delete.'); }
                    }}
                    style={s.smallBtn}
                  >
                    <Text style={s.smallBtnText}>Delete</Text>
                  </A11yPressable>
                </View>
              </View>
            ))}
          </View>
        ))
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
