import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DyslexiaText } from '../../../components/DyslexiaText';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';

export default function WellnessHub() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding:16 }}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.hub.title','Wellness & Recovery')}</Text>
      <DyslexiaText style={s.subtitle}>{t('wellness.hub.subtitle','Evidence-based tools for mood, pain, resilience, and recovery.')}</DyslexiaText>
      <View style={s.grid}>
        <Card href="/wellness/resilience" title={t('wellness.resilience.title','Resilience Points')} desc={t('wellness.resilience.desc','Gamified micro-wins for therapy and life steps.')} />
        <Card href="/wellness/dbt" title={t('wellness.dbt.title','DBT Skill Matcher')} desc={t('wellness.dbt.desc','Instant skill suggestions for current emotion.')} />
        <Card href="/wellness/dreams" title={t('wellness.dreams.title','Dream Tracker & Interpreter')} desc={t('wellness.dreams.desc','Log dreams and get symbolic interpretations.')} />
        <Card href="/wellness/ambience" title={t('wellness.ambience.title','Ambience Sync AI')} desc={t('wellness.ambience.desc','Match background, color, soundscape to your mood.')} />
        <Card href="/wellness/opposite-action" title={t('wellness.opposite.title','Opposite Action Companion')} desc={t('wellness.opposite.desc','Try small, safe opposite actions.')} />
        <Card href="/wellness/radical-acceptance" title={t('wellness.acceptance.title','Radical Acceptance')} desc={t('wellness.acceptance.desc','Reduce suffering; take wise action.')} />
        <Card href="/wellness/cbt-coach" title={t('wellness.cbt.title','CBT Virtual Coach')} desc={t('wellness.cbt.desc','Reframe thoughts with evidence.')} />
        <Card href="/wellness/sleep-reframe" title={t('wellness.sleepReframe.title','Sleep Reframe')} desc={t('wellness.sleepReframe.desc','Kind reframes and routines for better sleep.')} />
        <Card href="/wellness/pain-forecast" title={t('wellness.painForecast.title','Pain Forecast')} desc={t('wellness.painForecast.desc','Simple trend-based suggestions for pacing.')} />
        <Card href="/wellness/micro-movement" title={t('wellness.micro.title','Micro\u2011Movement Coach')} desc={t('wellness.micro.desc','Gentle, chair\u2011friendly movement ideas.')} />
        <Card href="/wellness/energy-coins" title={t('wellness.energy.title','Daily Energy Coins')} desc={t('wellness.energy.desc','Set a budget and spend coins on tasks.')} />
        <Card href="/wellness/distress-tolerance" title={t('wellness.distress.title','Distress Tolerance')} desc={t('wellness.distress.desc','Brief skills to reduce crisis intensity.')} />
        <Card href="/wellness/belief-meter" title={t('wellness.belief.title','Belief Strength Meter')} desc={t('wellness.belief.desc','Rate belief strength and track change.')} />
        <Card href="/wellness/cbt-mini-games" title={t('wellness.mini.title','CBT Mini\u2011Games')} desc={t('wellness.mini.desc','Quick grounding games to calm.')} />
        <Card href="/wellness/trigger-detector" title={t('wellness.triggers.title','Trigger Detector')} desc={t('wellness.triggers.desc','Suggest correlations from logs.')} />
        <Card href="/wellness/harm-reduction" title={t('wellness.harm.title','Harm Reduction Guide')} desc={t('wellness.harm.desc','Practical steps to increase safety.')} />
        <Card href="/wellness/acceptance-function" title={t('wellness.acceptFn.title','Acceptance & Function')} desc={t('wellness.acceptFn.desc','Track acceptance and function.')}/>
      </View>
    </ScrollView>
  );
}

function Card({ href, title, desc }: { href: string; title: string; desc: string; }){
  const palette = useAppPalette();
  return (
    <Link href={href as any} asChild>
      <Pressable hitSlop={HIT_SLOP_8} accessibilityRole="button" style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, padding:12 }}>
        <Text style={{ color: palette.text, fontWeight:'700' }}>{title}</Text>
        <DyslexiaText style={{ color: palette.text, opacity:0.9, marginTop:4 }}>{desc}</DyslexiaText>
      </Pressable>
    </Link>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background },
    header:{ color: palette.text, fontSize:22, fontWeight:'800' },
    subtitle:{ color: palette.text, opacity:0.9, marginBottom:8 },
    grid:{ gap:12 }
  });
}
