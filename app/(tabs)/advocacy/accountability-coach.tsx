import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import AIDisclaimer from '../../../components/AIDisclaimer';
import { GapView } from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { addEvent, upsertCase } from '../../../services/accountabilityTracker';
import { aiAccountabilityPlan, buildAllyBrief, detectViolations, draftAccountabilityLetter } from '../../../services/aiAccountability';
import { useJurisdiction } from '../../../store/jurisdiction';
import { useAppPalette } from '../../../theme/usePalette';
import { parseCoachOutput } from '../../../utils/coachParser';

export const options = { href: null };

export default function AccountabilityCoach() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('accountability.title'));
  useFocusOnRefOnMount(titleRef);
  const { data: jurisdiction } = useJurisdiction();

  const [target, setTarget] = React.useState('');
  const [issue, setIssue] = React.useState('');
  const [output, setOutput] = React.useState('');
  const parsed = React.useMemo(() => (output ? parseCoachOutput(output) : null), [output]);
  const [loading, setLoading] = React.useState(false);
  const [caseId, setCaseId] = React.useState<string | null>(null);

  const run = async () => {
    if (!issue.trim()) return;
    setLoading(true);
    try {
      const plan = await aiAccountabilityPlan(issue, target, jurisdiction?.code);
      setOutput(plan);
      try {
        const cs = await upsertCase({ target, issue }, { type: 'plan', text: plan });
        setCaseId(cs.id);
      } catch {}
    } catch {
      Alert.alert(t('common.errorTitle', 'Error'), t('accountability.generateError'));
    } finally {
      setLoading(false);
    }
  };

  const onDetect = async () => {
    if (!issue.trim()) return;
    setLoading(true);
    try {
      const items = await detectViolations(issue, jurisdiction?.code);
      const text = items.length ? items.map((i, idx) => `${idx + 1}. ${i.type}${i.ruleHint ? ` (${i.ruleHint})` : ''} — ${(i.confidence * 100).toFixed(0)}%`).join('\n') : t('accountability.noneFound','None found');
      await upsertCase({ target, issue }, { type: 'violations', text });
      Alert.alert(t('accountability.detected','Detected'), text);
    } catch {
      Alert.alert(t('common.errorTitle','Error'), t('accountability.detectError','Could not detect'));
    } finally { setLoading(false); }
  };

  const onDraft = async () => {
    if (!issue.trim()) return;
    setLoading(true);
    try {
      const letter = await draftAccountabilityLetter({ issue, target, jurisdictionCode: jurisdiction?.code });
      await upsertCase({ target, issue }, { type: 'letter', text: letter });
      Alert.alert(t('accountability.letter','Letter'), letter);
    } catch { Alert.alert(t('common.errorTitle','Error'), t('accountability.draftError','Could not draft')); }
    finally { setLoading(false); }
  };

  const onTrack = async () => {
    if (!caseId) return;
    try {
  await addEvent(caseId, 'response', t('accountability.responseNoted', `Response noted at ${new Date().toLocaleString()}`));
      Alert.alert(t('accountability.tracked','Tracked'), t('accountability.responseRecorded','Response recorded'));
    } catch {}
  };

  const onAlly = async () => {
    if (!issue.trim()) return;
    setLoading(true);
    try {
      const brief = await buildAllyBrief({ issue, target, plan: output });
      await upsertCase({ target, issue }, { type: 'ally', text: brief });
      Alert.alert(t('accountability.allyBrief','Ally Brief'), brief);
    } catch { Alert.alert(t('common.errorTitle','Error'), t('accountability.allyError','Could not create brief')); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('accountability.title')}
      </Text>
      <Text style={s.subtitle}>{t('accountability.subtitle')}</Text>

      <View style={s.fieldGroup}>
        <Text style={s.label}>{t('accountability.targetLabel')}</Text>
        <TextInput
          style={s.input}
          value={target}
          onChangeText={setTarget}
          placeholder={t('accountability.targetPlaceholder')}
          accessibilityLabel={t('accountability.targetLabel')}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.label}>{t('accountability.issueLabel')}</Text>
        <TextInput
          style={[s.input, { minHeight: 90, textAlignVertical: 'top' }]}
          multiline
          value={issue}
          onChangeText={setIssue}
          placeholder={t('accountability.issuePlaceholder')}
          accessibilityLabel={t('accountability.issueLabel')}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />
      </View>

  <Pressable onPress={run} style={s.button} accessibilityRole="button" accessibilityHint={t('accountability.generateHint','Generate a step-by-step plan')} disabled={loading} hitSlop={HIT_SLOP_8}>
        <Text style={s.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{loading ? t('accountability.generating') : t('accountability.generate')}</Text>
      </Pressable>
      <GapView style={{ flexDirection:'row', flexWrap:'wrap', marginTop:8 }} gap={8}>
  <Pressable onPress={onDetect} style={[s.button, { backgroundColor: palette.primary }]} accessibilityRole="button" accessibilityHint={t('accountability.detectHint','Analyze issue and list potential violations')} disabled={loading} hitSlop={HIT_SLOP_8}>
          <Text style={s.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('accountability.detect','Detect violations')}</Text>
        </Pressable>
  <Pressable onPress={onDraft} style={[s.button, { backgroundColor: palette.primary }]} accessibilityRole="button" accessibilityHint={t('accountability.draftHint','Draft a formal accountability letter')} disabled={loading} hitSlop={HIT_SLOP_8}>
          <Text style={s.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('accountability.draftLetter','Draft letter')}</Text>
        </Pressable>
  <Pressable onPress={onTrack} style={[s.button, { backgroundColor: palette.primary, opacity: caseId ? 1 : 0.5 }]} accessibilityRole="button" accessibilityHint={t('accountability.trackHint','Record and track responses you receive')} disabled={!caseId} hitSlop={HIT_SLOP_8}>
          <Text style={s.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('accountability.track','Track response')}</Text>
        </Pressable>
  <Pressable onPress={onAlly} style={[s.button, { backgroundColor: palette.primary }]} accessibilityRole="button" accessibilityHint={t('accountability.allyHint','Create a brief you can share with allies')} disabled={loading} hitSlop={HIT_SLOP_8}>
          <Text style={s.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('accountability.ally','Ally brief')}</Text>
        </Pressable>
      </GapView>

      {!!parsed && (
        <View style={{ marginTop: 12 }} accessibilityRole="summary" accessibilityLabel={t('accountability.outputLabel')}>
          {parsed.steps.map((step) => (
            <View key={step.order} style={{ marginBottom: 6 }}>
              <Text style={{ color: palette.text, fontWeight: '600' }}>{step.order}. {step.text}</Text>
              {step.tips?.map((tip) => (
                <Text key={tip} style={{ color: palette.text, opacity: 0.8, fontSize: 12 }}>• {tip}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      <AIDisclaimer />
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    fieldGroup: { marginTop: 8 },
    label: { color: palette.text, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 10, color: palette.text, backgroundColor: palette.surface },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
  });
}
