import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import AIDisclaimer from '../../../components/AIDisclaimer';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { aiAccountabilityPlan } from '../../../services/aiAccountability';
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

  const run = async () => {
    if (!issue.trim()) return;
    setLoading(true);
    try {
      const plan = await aiAccountabilityPlan(issue, target, jurisdiction?.code);
      setOutput(plan);
    } catch (e) {
      Alert.alert(t('common.errorTitle', 'Error'), t('accountability.generateError'));
    } finally {
      setLoading(false);
    }
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
