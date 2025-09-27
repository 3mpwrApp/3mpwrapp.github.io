import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { HIT_SLOP_8 } from '../../constants/a11y';
import { useTranslation } from '../../i18n';
import { MoodProvider, useMood } from '../../store/mood';
import { useAppPalette } from '../../theme/usePalette';

const scoreKeyMap: Record<number,string> = { '-2':'mood.veryLow', '-1':'mood.low', '0':'mood.neutral', '1':'mood.good', '2':'mood.great' };

function MoodInner() {
  const { t } = useTranslation();
  const { addEntry, entries, todayEntries, recentAverage } = useMood();
  const [score, setScore] = useState<number | null>(0);
  const [note, setNote] = useState('');
  const palette = useAppPalette();

  return (
    <ThemedView style={styles.container}>
  <ThemedText style={styles.title}>{t('mood.title','Mood Tracker')}</ThemedText>
  <ThemedText style={styles.subtitle}>{t('mood.subtitle','Log how you feel to spot trends.')}</ThemedText>

      {/* Quick access wellness chips */}
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
        {[{ label: t('wellness.quick.sleep','Sleep & Energy'), href: '/(tabs)/wellness/sleep-energy-tracker' }, { label: t('wellness.quick.balance','Work/Rest Balance AI'), href: '/(tabs)/wellness/work-balance-ai' }].map((c) => (
          <Link key={c.href} href={(c.href as any)} asChild>
            <View style={{ borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderColor: palette.muted }}>
              <Text style={{ color: palette.text, fontSize: 12 }}>{c.label}</Text>
            </View>
          </Link>
        ))}
      </View>

      <View style={styles.row}>
        {[ -2,-1,0,1,2 ].map(s => (
          <Pressable hitSlop={HIT_SLOP_8} accessibilityRole="button" key={s} style={[styles.scoreBtn, { borderColor: palette.muted }, score===s && { backgroundColor: palette.primary, borderColor: palette.primary }]} onPress={() => setScore(s)} accessibilityLabel={t('mood.scoreLabel','Score {{s}}',{ s })}> 
            <Text style={[styles.scoreText, { color: score===s ? palette.onPrimary : palette.text }]}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.scoreLabel, { color: palette.text }]}>{score!=null ? t(scoreKeyMap[score]) : ''}</Text>
      <TextInput
        placeholder={t('mood.notePlaceholder','Optional note')}
        value={note}
        onChangeText={setNote}
        style={[styles.input, { borderColor: palette.muted, color: palette.text }]}
        multiline
      />
      <Pressable
        hitSlop={HIT_SLOP_8}
        style={[styles.addBtn, { backgroundColor: palette.primary }]}
        onPress={() => { if (score!=null) { addEntry(score, note || undefined); setNote(''); } }}
        accessibilityRole="button"
        accessibilityLabel={t('mood.addEntryLabel','Add mood entry')}
      >
        <Text style={[styles.addBtnText, { color: palette.onPrimary }]}>{t('mood.save','Save')}</Text>
      </Pressable>

  <ThemedText style={styles.section}>{t('mood.today','Today')}</ThemedText>
      <FlatList
        data={todayEntries}
        keyExtractor={i => i.id}
        renderItem={({item}) => (
          <View style={styles.entry}>
            <Text style={[styles.entryScore, { color: palette.text }]}>{item.score}</Text>
            {item.note ? <Text style={[styles.entryNote, { color: palette.text }]}>{item.note}</Text> : null}
          </View>
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: palette.text }]}>{t('mood.emptyToday','No entries yet today.')}</Text>}
      />
      <ThemedText style={[styles.avg, { color: palette.text }]}>{t('mood.avg7d','7d Avg:')} {recentAverage==null ? '—' : recentAverage.toFixed(2)}</ThemedText>
      <ThemedText style={[styles.total, { color: palette.text }]}>{t('mood.total','Total entries:')} {entries.length}</ThemedText>
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
  scoreBtn: { width: 48, height: 48, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontSize: 18 },
  scoreLabel: { fontSize: 14, marginBottom: 4 },
  input: { minHeight: 60, borderWidth: 1, padding: 8, borderRadius: 8 },
  addBtn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addBtnText: { fontWeight: '600' },
  section: { marginTop: 16 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  entryScore: { width: 28, textAlign: 'center', fontWeight: '700' },
  entryNote: { flex: 1 },
  empty: { fontStyle: 'italic', paddingVertical: 16 },
  avg: { marginTop: 12, fontWeight: '600' },
  total: { fontSize: 12 }
});
