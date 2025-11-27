import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import AIDisclaimer from '../../../components/AIDisclaimer';
import { GapView } from '../../../components/GapView';
import { JurisdictionPanel } from '../../../components/JurisdictionPanel';
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from '../../../i18n';
import { logActivity } from '../../../services/activity';
import { aiCoachPrompt } from '../../../services/aiAdvocacy';
import { useCoachInactivityReminder } from '../../../services/coachReminder';
import { useNotificationDispatcher } from '../../../services/notificationsDispatcher';
import { usage } from '../../../services/usage';
import { useCoachProgress } from '../../../store/coachProgress';
import { useJurisdiction } from '../../../store/jurisdiction';
import { useAppPalette } from "../../../theme/usePalette";
import { parseCoachOutput } from '../../../utils/coachParser';
interface LessonMeta { id: string; evidenceNeeded?: string[]; suggestedDeadlineDays?: number; }
const LESSONS_META: LessonMeta[] = [
  { id: 'conf-1', evidenceNeeded: ['timeline','policy excerpt'], suggestedDeadlineDays: 3 },
  { id: 'speak-1', evidenceNeeded: ['example scenario notes'], suggestedDeadlineDays: 5 },
  { id: 'assert-1', evidenceNeeded: ['accommodation request email','response letter'] },
  { id: 'docs-1', evidenceNeeded: ['medical summary','supporting emails','decision letter'], suggestedDeadlineDays: 7 }
] as const;
type LessonId = typeof LESSONS_META[number]['id'];

function useLessons() {
  const { t } = useTranslation();
  return LESSONS_META.map(meta => ({
    id: meta.id as LessonId,
    title: t(`advocacy.coach.lesson.${meta.id}.title`),
    bullets: [1,2,3].map(i => t(`advocacy.coach.lesson.${meta.id}.b${i}`)).filter(Boolean),
    evidenceNeeded: meta.evidenceNeeded,
    suggestedDeadlineDays: meta.suggestedDeadlineDays
  }));
}

export const options = { href: null };

export default function SelfAdvocacyCoach() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('advocacy.tools.self_coach'));
  useFocusOnRefOnMount(titleRef);
  const lessons = useLessons();
  const [active, setActive] = React.useState<LessonId | null>(lessons[0].id as LessonId);
  const { markViewed, percentComplete } = useCoachProgress();
  useCoachInactivityReminder();
  const startedRef = React.useRef(false);
  React.useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      import('../../../services/activity').then(m => m.logActivity?.({ type:'coach.start', summaryKey:'coach.start', payload:{ lessonCount: lessons.length }})).catch(()=>{});
      usage.start('coach','/coach',{ lessonCount: lessons.length });
    }
  }, [lessons.length]);
  const completedStepsRef = React.useRef<Set<string>>(new Set());
  const onViewLesson = React.useCallback((id: LessonId) => {
    setActive(id);
    if (!completedStepsRef.current.has(id)) {
      completedStepsRef.current.add(id);
      try { markViewed(id); } catch {}
      import('../../../services/activity').then(m => m.logActivity?.({ type:'coach.stepComplete', summaryKey:'coach.stepComplete', payload:{ lessonId: id, completed: completedStepsRef.current.size, total: lessons.length }})).catch(()=>{});
      usage.complete('coach','/coach',undefined,{ lessonId: id, completed: completedStepsRef.current.size, total: lessons.length });
      if (completedStepsRef.current.size === lessons.length) {
        import('../../../services/activity').then(m => m.logActivity?.({ type:'coach.complete', summaryKey:'coach.complete', payload:{ total: lessons.length }})).catch(()=>{});
      }
    }
  }, [lessons.length]);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('advocacy.tools.self_coach')}
      </Text>
      <Text style={s.subtitle}>{t('advocacy.coach.subtitle')}</Text>
    <Text style={[s.subtitle,{ marginTop:4, fontSize:12 }]}>{percentComplete}% {t('advocacy.coach.complete','complete')}</Text>
  <JurisdictionPanel />
      <GapView
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 8,
        }}
        gap={8}
      >
        {lessons.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => onViewLesson(l.id)}
            style={[s.chip, active === l.id && s.chipActive]}
            accessibilityRole="button"
          >
            <Text style={[s.chipText, active === l.id && s.chipTextActive]}>
              {l.title}
            </Text>
          </Pressable>
        ))}
      </GapView>
      {lessons.filter((l) => l.id === active).map((l) => {
        const deadlineLabel = l.suggestedDeadlineDays ? t('advocacy.coach.deadlineInDays','Complete within {{d}} days',{ d: l.suggestedDeadlineDays }) : null;
        return (
          <View key={l.id} style={s.card}>
            <Text style={s.cardTitle}>{l.title}</Text>
            {deadlineLabel && <Text style={[s.cardText,{ fontStyle:'italic', color: palette.primary }]}>{deadlineLabel}</Text>}
            {l.bullets.map((b, i) => (
              <Text key={i} style={s.cardText}>• {b}</Text>
            ))}
            {!!l.evidenceNeeded?.length && (
              <View style={{ marginTop:8 }}>
                <Text style={[s.cardText,{ fontWeight:'600' }]}>{t('advocacy.coach.evidenceNeeded','Evidence needed')}:</Text>
                {l.evidenceNeeded.map(ev => (
                  <Text key={ev} style={[s.cardText,{ fontSize:13, color: palette.text, opacity:0.85 }]}>• {ev}</Text>
                ))}
              </View>
            )}
          </View>
        );
      })}
      <PracticeCoach />
      <AIDisclaimer />
    </ScrollView>
  );
}

function PracticeCoach() {
  const { t } = useTranslation();
  const { data: jurisdiction } = useJurisdiction();
  const palette = useAppPalette();
  const [prompt, setPrompt] = React.useState(t('advocacy.coach.defaultPrompt'));
  const [output, setOutput] = React.useState('');
  const { dispatchDomainEvent } = useNotificationDispatcher();
  const parsed = React.useMemo(() => (output ? parseCoachOutput(output) : null), [output]);
  const [loading, setLoading] = React.useState(false);
  const run = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await aiCoachPrompt(prompt, jurisdiction?.evidenceFocus);
      setOutput(res);
      try {
        await logActivity({
          type: 'coach.generate',
          payload: {
            promptLength: prompt.length,
            jurisdiction: jurisdiction?.code,
            steps: res.split(/\n+/).length,
          },
          summaryKey: 'coach.generate',
        });
      } catch {}
      try {
        await dispatchDomainEvent({
          event: 'coach.generate.completed',
          payload: { jurisdictionName: jurisdiction?.name, coachTopic: prompt.slice(0, 40) },
        });
      } catch {}
    } catch {
      Alert.alert(
        t('common.errorTitle', 'Error'),
        t('advocacy.coach.generateError', 'Could not generate practice steps.'),
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ fontWeight: '700', color: palette.textSecondary, marginBottom: 4 }}>
        {t('advocacy.coach.practiceHeader')}
      </Text>
      <Text style={{ color: palette.textSecondary, marginBottom: 6 }}>
        {t('advocacy.coach.practiceHelp')}
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: palette.muted,
          borderRadius: 8,
          padding: 10,
          minHeight: 70,
          textAlignVertical: 'top',
        }}
        multiline={true}
        value={prompt}
        onChangeText={setPrompt}
        accessibilityLabel={t('advocacy.coach.practiceInputLabel', 'Practice prompt input')}
      />
      <Pressable
        onPress={run}
        style={{
          backgroundColor: palette.primary,
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 8,
        }}
        accessibilityRole="button"
        accessibilityLabel={t('advocacy.coach.practiceGenerateLabel', 'Generate practice coaching')}
        disabled={loading}
      >
        <Text style={{ color: palette.onPrimary, fontWeight: '700' }}>
          {loading ? t('advocacy.coach.generating') : t('advocacy.coach.generate')}
        </Text>
      </Pressable>
      {!!parsed && (
        <View
          style={{ marginTop: 10 }}
          accessibilityRole="summary"
          accessibilityLabel={t('advocacy.coach.practiceOutputLabel', 'Practice coaching output')}
        >
          {parsed.steps.map((step) => (
            <View key={step.order} style={{ marginBottom: 6 }}>
              <Text style={{ color: palette.text, fontWeight: '600' }}>
                {step.order}. {step.text}
              </Text>
              {step.tips?.map((tip) => (
                <Text key={tip} style={{ color: palette.text, opacity: 0.8, fontSize: 12 }}>
                  • {tip}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9 },
    chip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight: "700" },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      backgroundColor: palette.surface,
      marginTop: 8,
    },
    cardTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95 },
  });
}
