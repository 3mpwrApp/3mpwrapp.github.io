import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useAppPalette } from "../../../theme/usePalette";
import AIDisclaimer from '../../../components/AIDisclaimer';
import { useTranslation } from '../../../i18n';

const LESSON_IDS = ["conf-1","speak-1","assert-1","docs-1"] as const;
type LessonId = typeof LESSON_IDS[number];

function useLessons() {
  const { t } = useTranslation();
  return LESSON_IDS.map(id => ({
    id,
    title: t(`advocacy.coach.lesson.${id}.title`),
    bullets: [1,2,3].map(i => t(`advocacy.coach.lesson.${id}.b${i}`)).filter(Boolean)
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
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {lessons.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => setActive(l.id)}
            style={[s.chip, active === l.id && s.chipActive]}
            accessibilityRole="button"
          >
            <Text style={[s.chipText, active === l.id && s.chipTextActive]}>
              {l.title}
            </Text>
          </Pressable>
        ))}
      </View>
      {lessons.filter((l) => l.id === active).map((l) => (
        <View key={l.id} style={s.card}>
          <Text style={s.cardTitle}>{l.title}</Text>
          {l.bullets.map((b, i) => (
            <Text key={i} style={s.cardText}>
              • {b}
            </Text>
          ))}
        </View>
      ))}
      <PracticeCoach />
      <AIDisclaimer />
    </ScrollView>
  );
}

import { aiCoachPrompt } from '../../../services/aiAdvocacy';

function PracticeCoach() {
  const { t } = useTranslation();
  const [prompt, setPrompt] = React.useState(t('advocacy.coach.defaultPrompt'));
  const [output, setOutput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const run = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try { setOutput(await aiCoachPrompt(prompt)); } catch { Alert.alert(t('common.errorTitle','Error'), t('advocacy.coach.generateError','Could not generate practice steps.')); } finally { setLoading(false); }
  };
  return (
    <View style={{ marginTop:16 }}>
      <Text style={{ fontWeight:'700', color:'#888', marginBottom:4 }}>{t('advocacy.coach.practiceHeader')}</Text>
      <Text style={{ color:'#888', marginBottom:6 }}>{t('advocacy.coach.practiceHelp')}</Text>
      <TextInput style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, minHeight:70, textAlignVertical:'top' }} multiline value={prompt} onChangeText={setPrompt} accessibilityLabel={t('advocacy.coach.practiceInputLabel','Practice prompt input')} />
      <Pressable onPress={run} style={{ backgroundColor:'#333', paddingVertical:10, borderRadius:8, alignItems:'center', marginTop:8 }} accessibilityRole="button" accessibilityLabel={t('advocacy.coach.practiceGenerateLabel','Generate practice coaching')} disabled={loading}>
        <Text style={{ color:'#fff', fontWeight:'700' }}>{loading ? t('advocacy.coach.generating') : t('advocacy.coach.generate')}</Text>
      </Pressable>
      {!!output && (
        <View style={{ marginTop:10 }} accessibilityRole="summary" accessibilityLabel={t('advocacy.coach.practiceOutputLabel','Practice coaching output')}>
          {output.split(/\n+/).map((ln,i)=>(<Text key={i} style={{ color:'#444', marginBottom:4 }}>• {ln}</Text>))}
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
