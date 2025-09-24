import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import AIDisclaimer from '../../../components/AIDisclaimer';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { addEvent, upsertCase } from '../../../services/accountability.tracker';
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
      const text = items.length ? items.map((i, idx) => `${idx + 1}. ${i.type}${i.ruleHint ? ` (${i.ruleHint})` : ''} — ${(i.confidence * 100).toFixed(0)}%`).join('\n') : 'None found';
      await upsertCase({ target, issue }, { type: 'violations', text });
      Alert.alert('Detected', text);
    } catch {
      Alert.alert(t('common.errorTitle','Error'), 'Could not detect');
    } finally { setLoading(false); }
  };

  const onDraft = async () => {
    if (!issue.trim()) return;
    setLoading(true);
    try {
      const letter = await draftAccountabilityLetter({ issue, target, jurisdictionCode: jurisdiction?.code });
      await upsertCase({ target, issue }, { type: 'letter', text: letter });
      Alert.alert('Letter', letter);
    } catch { Alert.alert(t('common.errorTitle','Error'), 'Could not draft'); }
    finally { setLoading(false); }
  };

  const onTrack = async () => {
    if (!caseId) return;
    try {
      await addEvent(caseId, 'response', `Response noted at ${new Date().toLocaleString()}`);
      Alert.alert('Tracked', 'Response recorded');
    } catch {}
  };

  const onAlly = async () => {
    if (!issue.trim()) return;
    setLoading(true);
    try {
      const brief = await buildAllyBrief({ issue, target, plan: output });
      await upsertCase({ target, issue }, { type: 'ally', text: brief });
      Alert.alert('Ally Brief', brief);
    } catch { Alert.alert(t('common.errorTitle','Error'), 'Could not create brief'); }
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
        />
      </View>

      <Pressable onPress={run} style={s.button} accessibilityRole="button" disabled={loading}>
        <Text style={s.buttonText}>{loading ? t('accountability.generating') : t('accountability.generate')}</Text>
      </Pressable>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:8 }}>
        <Pressable onPress={onDetect} style={[s.button, { backgroundColor: '#444' }]} accessibilityRole="button" disabled={loading}>
          <Text style={s.buttonText}>{t('accountability.detect','Detect violations')}</Text>
        </Pressable>
        <Pressable onPress={onDraft} style={[s.button, { backgroundColor: '#555' }]} accessibilityRole="button" disabled={loading}>
          <Text style={s.buttonText}>{t('accountability.draftLetter','Draft letter')}</Text>
        </Pressable>
        <Pressable onPress={onTrack} style={[s.button, { backgroundColor: '#666' }]} accessibilityRole="button" disabled={!caseId}>
          <Text style={s.buttonText}>{t('accountability.track','Track response')}</Text>
        </Pressable>
        <Pressable onPress={onAlly} style={[s.button, { backgroundColor: '#777' }]} accessibilityRole="button" disabled={loading}>
          <Text style={s.buttonText}>{t('accountability.ally','Ally brief')}</Text>
        </Pressable>
      </View>

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
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, color: palette.text, backgroundColor: palette.surface },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
  });
}
