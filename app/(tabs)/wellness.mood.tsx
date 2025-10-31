import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yTextInput from '../../components/A11yTextInput';
import DisclaimerBanner from '../../components/DisclaimerBanner';
import GapView from '../../components/GapView';
import { HIT_SLOP_8 } from '../../constants/A11Y';
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
    <ScrollView style={{ flex: 1, backgroundColor: palette.background }} contentContainerStyle={{ padding: 16 }}>
      <Text 
        ref={titleRef}
        style={[styles.title, { color: palette.text, fontSize: Math.round(22 * factor) }]}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('mood.title','Mood Tracker')}
      </Text>
      <Text 
        style={[styles.subtitle, { color: palette.text, fontSize: Math.round(14 * factor) }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('mood.subtitle','Log how you feel to spot trends.')}
      </Text>

      <DisclaimerBanner type="medical" compact />

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
        <GapView 
          style={styles.row}
          gap={8}
          accessibilityLabel={t('mood.scoreButtons', 'Mood score buttons from -2 to 2')}
          accessibilityRole="radiogroup"
        >
          {[ -2,-1,0,1,2 ].map(s => (
            <Pressable // a11y-scan: accessibilityRole and hitSlop present
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
        </GapView>
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

      <Text style={[styles.section, { color: palette.text, marginTop: 12 }]}>{t('mood.today','Today')}</Text>
      {todayEntries.length > 0 ? (
        todayEntries.map((item) => (
          <View key={item.id} style={styles.entry}>
            <Text style={[styles.entryScore, { color: palette.text }]}>{item.score}</Text>
            {item.note ? <Text style={[styles.entryNote, { color: palette.text }]}>{item.note}</Text> : null}
          </View>
        ))
      ) : (
        <Text style={[styles.empty, { color: palette.text }]}>{t('mood.emptyToday','No entries yet today.')}</Text>
      )}
      <Text style={[styles.avg, { color: palette.text }]}>{t('mood.avg7d','7d Avg:')} {recentAverage==null ? '—' : recentAverage.toFixed(2)}</Text>
      <Text style={[styles.total, { color: palette.text }]}>{t('mood.total','Total entries:')} {entries.length}</Text>
    </ScrollView>
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
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, opacity: 0.8, marginBottom: 8 },
  scoreSection: { marginVertical: 12 },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'center' },
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
  section: { marginTop: 16, fontWeight: '600' },
  entry: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  entryScore: { width: 28, textAlign: 'center', fontWeight: '700', marginRight: 8 },
  entryNote: { flex: 1 },
  empty: { fontStyle: 'italic', paddingVertical: 16 },
  avg: { marginTop: 12, fontWeight: '600' },
  total: { fontSize: 12 }
});
