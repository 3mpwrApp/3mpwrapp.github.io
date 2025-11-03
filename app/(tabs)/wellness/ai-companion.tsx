import React from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { addMood, listMoods } from '../../../services/companion';
import * as Notifier from '../../../services/notifications';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function AICompanion() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Adaptive AI Companion');
  useFocusOnRefOnMount(titleRef);
  const [notes, setNotes] = React.useState('');
  const [moods, setMoods] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [selectedMood, setSelectedMood] = React.useState<string | null>(null);

  React.useEffect(() => { 
    (async () => { 
      try { 
        setIsLoading(true);
        setMoods(await listMoods()); 
      } catch (err) {
        console.error('Error loading moods:', err);
      } finally {
        setIsLoading(false);
      }
    })(); 
  }, []);

  const handleMoodLog = async (mood: string) => {
    try {
      setIsSaving(true);
      setSelectedMood(mood);
      await addMood(mood as any, notes);
      setNotes('');
      const updatedMoods = await listMoods();
      setMoods(updatedMoods);
      setSelectedMood(null);
      // Brief success feedback
      setTimeout(() => setIsSaving(false), 300);
    } catch (err) {
      console.error('Error saving mood:', err);
      Alert.alert('Error', 'Failed to save mood. Please try again.');
      setIsSaving(false);
      setSelectedMood(null);
    }
  };

  const scheduleChecks = async () => {
    try {
      const now = new Date();
      const times = [9, 12, 15, 18]; // morning, lunch, afternoon, evening
      let scheduled = 0;
      for (const h of times) { 
        const d = new Date(now); 
        d.setHours(h, 0, 0, 0); 
        if (d.getTime() < now.getTime()) d.setDate(d.getDate()+1); 
        await Notifier.scheduleAt(d, 'Check-in', 'How are you feeling? Time to rest, stretch, hydrate.');
        scheduled++;
      }
      Alert.alert('Success', `Scheduled ${scheduled} daily check-ins at 9am, 12pm, 3pm, and 6pm.`);
    } catch (err) { 
      console.error('Error scheduling notifications:', err);
      Alert.alert('Failed','Unable to schedule notifications. Please check app permissions.'); 
    }
  };

  const exportMoods = async () => {
    if (moods.length === 0) {
      Alert.alert('No Data', 'No mood entries to export yet. Log some moods first!');
      return;
    }
    
    try {
      const rows = [
        ["date", "mood", "notes"],
        ...moods.map((m) => [
          new Date(m.createdAt?.toDate?.() || Date.now()).toLocaleString(),
          m.mood,
          m.notes || "",
        ]),
      ];
      const csv = rows.map(r => r.map(x => `"${(x || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
      if (!baseDir) {
        Alert.alert('Error', 'File system not available.');
        return;
      }
      const path = `${baseDir}mood_log_${Date.now()}.csv`;
      await (FileSystem as any).writeAsStringAsync(path, csv, { encoding: (FileSystem as any).EncodingType?.UTF8 });
      if (Sharing?.isAvailableAsync && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Mood Log CSV' });
      } else {
        Alert.alert('Export Complete', `CSV saved with ${moods.length} entries.`);
      }
    } catch (err) {
      console.error('Error exporting moods:', err);
      Alert.alert("Export Failed", "Could not export mood log. Please try again.");
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityLabel="Adaptive AI Companion screen">
        Adaptive AI Companion
      </Text>
      <DisclaimerBanner type="medical" compact={true} />
      <DisclaimerBanner type="ai" compact={true} />
      
      <View style={s.card}>
        <Text style={s.sectionTitle} accessibilityLabel="Quick check-in prompt">
          Quick check-in: How are you today?
        </Text>
        <GapView style={{ flexDirection:'row', marginTop: 12 }} gap={8}>
          {[['good','😊', palette.success],['ok','😐', palette.warning],['bad','😔', palette.error]].map(([m, emoji, color]) => (
            <A11yPressable
              key={m}
              onPress={() => handleMoodLog(m as string)}
              style={[
                s.chip, 
                selectedMood === m && s.chipSelected,
                { borderColor: selectedMood === m ? color : palette.muted }
              ]}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel={`Log mood: ${m}`}
              disabled={isSaving}
            >
              {isSaving && selectedMood === m ? (
                <ActivityIndicator size="small" color={palette.text} />
              ) : (
                <Text style={{ color: palette.text, fontWeight:'700', fontSize: 16 }}>
                  {emoji} {m}
                </Text>
              )}
            </A11yPressable>
          ))}
        </GapView>
        <TextInput
          placeholder="Notes (optional)"
          placeholderTextColor={palette.text+'77'}
          value={notes}
          onChangeText={setNotes}
          style={s.input}
          accessibilityLabel="Mood notes input"
          multiline
          numberOfLines={2}
          editable={!isSaving}
        />
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Reminders & Export</Text>
        <GapView style={{ marginTop: 8 }} gap={8}>
          <A11yPressable
            onPress={scheduleChecks}
            style={s.button}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel="Schedule daily check-ins"
          >
            <Text style={s.buttonText}>📅 Schedule Daily Check-ins</Text>
          </A11yPressable>
          <A11yPressable
            onPress={async()=>{ 
              try { 
                const d=new Date(); 
                d.setMinutes(d.getMinutes()+1); 
                await Notifier.scheduleAt(d, 'Hydrate', '💧 Time to sip water and stretch.'); 
                Alert.alert('Scheduled','Hydration reminder in 1 minute.'); 
              } catch (err) {
                console.error('Error scheduling hydration:', err);
                Alert.alert('Error', 'Failed to schedule reminder.');
              }
            }}
            style={s.secondary}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel="Schedule hydration reminder"
          >
            <Text style={s.secondaryText}>💧 Hydration Reminder (1 min)</Text>
          </A11yPressable>
          <A11yPressable
            onPress={exportMoods}
            style={s.secondary}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel="Export mood log as CSV"
            disabled={moods.length === 0}
          >
            <Text style={[s.secondaryText, moods.length === 0 && { opacity: 0.5 }]}>
              📊 Export Moods ({moods.length})
            </Text>
          </A11yPressable>
        </GapView>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle} accessibilityLabel="Recent moods">
          Recent Moods
        </Text>
        {isLoading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={[s.text, { marginTop: 8 }]}>Loading your mood history...</Text>
          </View>
        ) : moods.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>😊</Text>
            <Text style={s.text}>No mood entries yet.</Text>
            <Text style={[s.text, { fontSize: 12, opacity: 0.7 }]}>
              Log your first mood above to start tracking!
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 8 }}>
            {moods.slice(0,10).map((m, idx) => (
              <View 
                key={m.id || idx} 
                style={s.moodEntry}
                accessibilityLabel={`Mood entry: ${m.mood}${m.notes? `, notes: ${m.notes}`:''}`}
              >
                <Text style={s.moodEmoji}>
                  {m.mood === 'good' ? '😊' : m.mood === 'ok' ? '😐' : '😔'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.moodText}>
                    <Text style={{ fontWeight: '700' }}>{m.mood}</Text>
                    {m.notes ? `: ${m.notes}` : ''}
                  </Text>
                  <Text style={s.moodDate}>
                    {new Date(m.createdAt?.toDate?.()||Date.now()).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
            {moods.length > 10 && (
              <Text style={[s.text, { fontStyle: 'italic', textAlign: 'center', marginTop: 8 }]}>
                Showing 10 of {moods.length} entries. Export to see all.
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: palette.background 
    },
    title: { 
      fontSize: 24, 
      fontWeight: '700', 
      color: palette.text,
      marginBottom: 12
    },
    card: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    text: { 
      color: palette.text, 
      opacity: 0.95, 
      marginTop: 6,
      fontSize: 14,
      lineHeight: 20,
    },
    chip: { 
      flex: 1,
      borderWidth: 2, 
      borderColor: palette.muted, 
      borderRadius: 12, 
      paddingHorizontal: 12, 
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 60,
    },
    chipSelected: {
      borderWidth: 2,
      backgroundColor: palette.surface + '88',
    },
    input: { 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      color: palette.text, 
      padding: 12, 
      borderRadius: 8, 
      marginTop: 12,
      fontSize: 14,
      minHeight: 60,
    },
    button: { 
      backgroundColor: palette.primary, 
      paddingVertical: 14, 
      paddingHorizontal: 16,
      borderRadius: 10, 
      alignItems:'center',
    },
    buttonText: { 
      color: palette.onPrimary, 
      fontWeight:'700',
      fontSize: 15,
    },
    secondary: { 
      backgroundColor: palette.surface, 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      borderRadius: 10, 
      paddingVertical: 14, 
      paddingHorizontal: 16, 
      alignItems:'center',
    },
    secondaryText: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 14,
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 48,
      marginBottom: 12,
    },
    moodEntry: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    moodEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    moodText: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
    },
    moodDate: {
      color: palette.text,
      opacity: 0.6,
      fontSize: 12,
      marginTop: 2,
    },
  });
}

