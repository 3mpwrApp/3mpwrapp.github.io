import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import A11yTextInput from '../../components/A11yTextInput';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { HIT_SLOP_8 } from '../../constants/a11y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { MoodProvider, useMood } from '../../store/mood';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';
import { useAccessibilityAnnouncements, useAccessibilityLabels } from '../../utils/i18nA11y';

const scoreKeyMap: Record<number,string> = { '-2':'mood.veryLow', '-1':'mood.low', '0':'mood.neutral', '1':'mood.good', '2':'mood.great' };

function MoodInner() {
  const { t } = useTranslation();
  const { addEntry, entries, todayEntries, recentAverage } = useMood();
  const [score, setScore] = useState<number | null>(0);
  const [note, setNote] = useState('');
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const titleRef = useRef<Text>(null);
  
  // Enhanced internationalization accessibility utilities
  const { generateLabel } = useAccessibilityLabels();
  const { announceContentChange } = useAccessibilityAnnouncements();
  
  // Announce screen load and focus management
  useAnnounceOnMount(t('mood.screenAnnouncement', 'Mood tracker loaded. Select a score and add optional note.'));
  useFocusOnRefOnMount(titleRef);

  // Handle mood score selection with accessibility announcement
  const handleScoreSelection = (selectedScore: number) => {
    setScore(selectedScore);
    
    // Announce the selection with proper internationalization
    announceContentChange(
      'mood.scoreSelected',
      'Selected mood: {{description}}',
      { description: t(scoreKeyMap[selectedScore]) }
    );
  };

  // Handle mood entry saving with accessibility feedback
  const handleSaveMood = () => {
    if (score !== null) {
      addEntry(score, note || undefined);
      setNote('');
      
      // Announce successful save
      announceContentChange(
        'mood.entrySaved',
        'Mood entry saved successfully',
        { mood: t(scoreKeyMap[score]) }
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text 
        ref={titleRef}
        style={[styles.title, { color: palette.text, fontSize: Math.round(24 * factor) }]}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('mood.title','Mood Tracker')}
      </Text>
      <Text 
        style={[styles.subtitle, { color: palette.text, fontSize: Math.round(16 * factor) }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('mood.subtitle','Log how you feel to spot trends.')}
      </Text>

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

      {/* Mood Score Selection */}
      <View 
        style={styles.scoreSection}
        accessibilityLabel={t('mood.scoreSection', 'Mood score selection')}
        accessible
      >
        <Text 
          style={[styles.sectionLabel, { color: palette.text, fontSize: Math.round(16 * factor) }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityRole="header"
        >
          {t('mood.scoreLabel', 'Select your mood score')}
        </Text>
        <View 
          style={styles.row}
          accessibilityLabel={t('mood.scoreButtons', 'Mood score buttons from -2 to 2')}
          accessibilityRole="radiogroup"
        >
          {[ -2,-1,0,1,2 ].map(s => (
            <Pressable 
              hitSlop={HIT_SLOP_8} 
              accessibilityRole="radio" 
              key={s} 
              style={[
                styles.scoreBtn, 
                { borderColor: palette.muted }, 
                score===s && { backgroundColor: palette.primary, borderColor: palette.primary }
              ]} 
              onPress={() => handleScoreSelection(s)} 
              accessibilityLabel={generateLabel(
                'mood.scoreOption',
                '{{score}}: {{description}}',
                {
                  role: 'radio',
                  state: score === s ? 'selected' : 'unselected',
                  value: `${s}: ${t(scoreKeyMap[s])}`
                }
              )}
              accessibilityState={{ selected: score === s }}
              accessibilityHint={t('mood.scoreHint', 'Double tap to select this mood score')}
            > 
              <Text style={[styles.scoreText, { color: score===s ? palette.onPrimary : palette.text }]}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <Text 
          style={[styles.scoreLabel, { color: palette.text, fontSize: Math.round(14 * factor) }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityLiveRegion="polite"
          accessibilityLabel={score != null ? t('mood.selectedScore', 'Selected: {{description}}', { description: t(scoreKeyMap[score]) }) : ''}
        >
          {score!=null ? t(scoreKeyMap[score]) : ''}
        </Text>
      </View>

      {/* Note Input */}
      <A11yTextInput
        label={t('mood.noteLabel', 'Optional note')}
        helperText={t('mood.noteHelper', 'Add any additional details about your mood')}
        value={note}
        onChangeText={setNote}
        inputType="text"
        maxLength={500}
        showCharacterCount
        containerStyle={{ marginVertical: 16 }}
        accessibilityLabel={t('mood.noteAccessibility', 'Mood note text input')}
        accessibilityHint={t('mood.noteHint', 'Optional field to add context about your mood')}
      />
      <Pressable
        hitSlop={HIT_SLOP_8}
        style={[styles.addBtn, { backgroundColor: palette.primary }]}
        onPress={handleSaveMood}
        accessibilityRole="button"
        accessibilityLabel={generateLabel(
          'mood.addEntryLabel',
          'Add mood entry',
          {
            role: 'button',
            state: score !== null ? 'enabled' : 'disabled'
          }
        )}
        accessibilityHint={t('mood.saveHint', 'Saves your mood score and optional note')}
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
  scoreSection: { marginVertical: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  scoreBtn: { 
    width: 48, 
    height: 48, 
    borderRadius: 8, 
    borderWidth: 2, 
    alignItems: 'center', 
    justifyContent: 'center',
    minWidth: 48, // WCAG AAA touch target
    minHeight: 48,
  },
  scoreText: { fontSize: 18, fontWeight: '600' },
  scoreLabel: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  input: { minHeight: 60, borderWidth: 1, padding: 8, borderRadius: 8 },
  addBtn: { 
    paddingVertical: 16, 
    borderRadius: 8, 
    alignItems: 'center',
    minHeight: 48, // WCAG AAA touch target
  },
  addBtnText: { fontWeight: '600', fontSize: 16 },
  section: { marginTop: 16 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  entryScore: { width: 28, textAlign: 'center', fontWeight: '700' },
  entryNote: { flex: 1 },
  empty: { fontStyle: 'italic', paddingVertical: 16 },
  avg: { marginTop: 12, fontWeight: '600' },
  total: { fontSize: 12 }
});
