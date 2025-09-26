import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { HIT_SLOP_8 } from '../../constants/a11y';
import { useTranslation } from '../../i18n';
import { MoodProvider, useMood } from '../../store/mood';

const scoreKeyMap: Record<number,string> = { '-2':'mood.veryLow', '-1':'mood.low', '0':'mood.neutral', '1':'mood.good', '2':'mood.great' };

function MoodInner() {
  const { t } = useTranslation();
  const { addEntry, entries, todayEntries, recentAverage } = useMood();
  const [score, setScore] = useState<number | null>(0);
  const [note, setNote] = useState('');

  return (
    <ThemedView style={styles.container}>
  <ThemedText style={styles.title}>{t('mood.title','Mood Tracker')}</ThemedText>
  <ThemedText style={styles.subtitle}>{t('mood.subtitle','Log how you feel to spot trends.')}</ThemedText>

      <View style={styles.row}>
        {[ -2,-1,0,1,2 ].map(s => (
          <Pressable hitSlop={HIT_SLOP_8} accessibilityRole="button" key={s} style={[styles.scoreBtn, score===s && styles.selected]} onPress={() => setScore(s)} accessibilityLabel={t('mood.scoreLabel','Score {{s}}',{ s })}> 
            <Text style={styles.scoreText}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.scoreLabel}>{score!=null ? t(scoreKeyMap[score]) : ''}</Text>
      <TextInput
        placeholder={t('mood.notePlaceholder','Optional note')}
        value={note}
        onChangeText={setNote}
        style={styles.input}
        multiline
      />
      <Pressable
        hitSlop={HIT_SLOP_8}
        style={styles.addBtn}
        onPress={() => { if (score!=null) { addEntry(score, note || undefined); setNote(''); } }}
        accessibilityRole="button"
        accessibilityLabel={t('mood.addEntryLabel','Add mood entry')}
      >
        <Text style={styles.addBtnText}>{t('mood.save','Save')}</Text>
      </Pressable>

  <ThemedText style={styles.section}>{t('mood.today','Today')}</ThemedText>
      <FlatList
        data={todayEntries}
        keyExtractor={i => i.id}
        renderItem={({item}) => (
          <View style={styles.entry}>
            <Text style={styles.entryScore}>{item.score}</Text>
            {item.note ? <Text style={styles.entryNote}>{item.note}</Text> : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('mood.emptyToday','No entries yet today.')}</Text>}
      />
      <ThemedText style={styles.avg}>{t('mood.avg7d','7d Avg:')} {recentAverage==null ? '—' : recentAverage.toFixed(2)}</ThemedText>
      <ThemedText style={styles.total}>{t('mood.total','Total entries:')} {entries.length}</ThemedText>
    </ThemedView>
  );
}

export default function MoodScreen() {
  return (
    <MoodProvider>
      <MoodInner />
    </MoodProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 14, opacity: 0.8 },
  row: { flexDirection: 'row', gap: 8 },
  scoreBtn: { width: 48, height: 48, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderColor: '#666' },
  // Adjusted to improve contrast (WCAG audit flagged #3478f6 at ~4.07:1). Darkened shade.
  selected: { backgroundColor: '#1d5ec2', borderColor: '#1d5ec2' },
  scoreText: { fontSize: 18, color: '#fff' },
  scoreLabel: { fontSize: 14, marginBottom: 4 },
  input: { minHeight: 60, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 8 },
  addBtn: { backgroundColor: '#222', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600' },
  section: { marginTop: 16 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  entryScore: { width: 28, textAlign: 'center', fontWeight: '700' },
  entryNote: { flex: 1 },
  empty: { fontStyle: 'italic', color: '#666', paddingVertical: 16 },
  avg: { marginTop: 12, fontWeight: '600' },
  total: { fontSize: 12, color: '#666' }
});
