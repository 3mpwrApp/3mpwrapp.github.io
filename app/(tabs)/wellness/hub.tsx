import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DyslexiaText } from '../../../components/DyslexiaText';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';

export default function WellnessHub() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Wellness & Recovery Hub');
  useFocusOnRefOnMount(titleRef);

  const betaFeatures = [
    { href: '/wellness/ai-companion', title: t('wellness.companion.title','AI Wellness Companion'), desc: t('wellness.companion.desc','Track moods and schedule wellness check-ins.'), icon: '🤖', isBeta: true },
    { href: '/wellness/pain-forecast', title: t('wellness.painForecast.title','Pain Forecast'), desc: t('wellness.painForecast.desc','AI-powered pain trend analysis and suggestions.'), icon: '📊', isBeta: true },
    { href: '/wellness/adaptive-meditation', title: t('wellness.meditation.title','Adaptive Meditation'), desc: t('wellness.meditation.desc','Guided meditations for chronic pain and mobility.'), icon: '🧘', isBeta: true },
    { href: '/wellness/work-balance-ai', title: t('wellness.workBalance.title','Work-Balance AI'), desc: t('wellness.workBalance.desc','Personalized pacing and work-rest recommendations.'), icon: '⚖️', isBeta: true },
    { href: '/wellness/cbt-coach', title: t('wellness.cbt.title','CBT Virtual Coach'), desc: t('wellness.cbt.desc','Cognitive reframing with evidence-based guidance.'), icon: '💭', isBeta: true },
  ];

  const coreFeatures = [
    { href: '/wellness/resilience', title: t('wellness.resilience.title','Resilience Points'), desc: t('wellness.resilience.desc','Gamified micro-wins for therapy and life steps.'), icon: '⭐' },
    { href: '/wellness/dbt', title: t('wellness.dbt.title','DBT Skill Matcher'), desc: t('wellness.dbt.desc','Instant skill suggestions for current emotion.'), icon: '🎯' },
    { href: '/wellness/dreams', title: t('wellness.dreams.title','Dream Tracker & Interpreter'), desc: t('wellness.dreams.desc','Log dreams and get symbolic interpretations.'), icon: '🌙' },
    { href: '/wellness/ambience', title: t('wellness.ambience.title','Ambience Sync AI'), desc: t('wellness.ambience.desc','Match background, color, soundscape to your mood.'), icon: '🎨' },
    { href: '/wellness/opposite-action', title: t('wellness.opposite.title','Opposite Action Companion'), desc: t('wellness.opposite.desc','Try small, safe opposite actions.'), icon: '🔄' },
    { href: '/wellness/radical-acceptance', title: t('wellness.acceptance.title','Radical Acceptance'), desc: t('wellness.acceptance.desc','Reduce suffering; take wise action.'), icon: '🕊️' },
    { href: '/wellness/sleep-reframe', title: t('wellness.sleepReframe.title','Sleep Reframe'), desc: t('wellness.sleepReframe.desc','Kind reframes and routines for better sleep.'), icon: '😴' },
    { href: '/wellness/micro-movement', title: t('wellness.micro.title','Micro-Movement Coach'), desc: t('wellness.micro.desc','Gentle, chair-friendly movement ideas.'), icon: '🪑' },
    { href: '/wellness/energy-coins', title: t('wellness.energy.title','Daily Energy Coins'), desc: t('wellness.energy.desc','Set a budget and spend coins on tasks.'), icon: '🪙' },
    { href: '/wellness/distress-tolerance', title: t('wellness.distress.title','Distress Tolerance'), desc: t('wellness.distress.desc','Brief skills to reduce crisis intensity.'), icon: '🛡️' },
    { href: '/wellness/belief-meter', title: t('wellness.belief.title','Belief Strength Meter'), desc: t('wellness.belief.desc','Rate belief strength and track change.'), icon: '📏' },
    { href: '/wellness/cbt-mini-games', title: t('wellness.mini.title','CBT Mini-Games'), desc: t('wellness.mini.desc','Quick grounding games to calm.'), icon: '🎮' },
    { href: '/wellness/trigger-detector', title: t('wellness.triggers.title','Trigger Detector'), desc: t('wellness.triggers.desc','Suggest correlations from logs.'), icon: '🔍' },
    { href: '/wellness/harm-reduction', title: t('wellness.harm.title','Harm Reduction Guide'), desc: t('wellness.harm.desc','Practical steps to increase safety.'), icon: '🆘' },
    { href: '/wellness/acceptance-function', title: t('wellness.acceptFn.title','Acceptance & Function'), desc: t('wellness.acceptFn.desc','Track acceptance and function.'), icon: '📈' },
    { href: '/wellness/grief-support', title: t('wellness.grief.title','Grief Support'), desc: t('wellness.grief.desc','Resources and tools for processing grief.'), icon: '💚' },
    { href: '/wellness/symptom-tracker', title: t('wellness.symptom.title','Symptom Tracker'), desc: t('wellness.symptom.desc','Track and monitor your symptoms over time.'), icon: '📋' },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding:16 }}>
      <Text 
        ref={titleRef}
        accessibilityRole="header" 
        style={s.header}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('wellness.hub.title','Wellness & Recovery')}
      </Text>
      <DyslexiaText style={s.subtitle}>{t('wellness.hub.subtitle','Evidence-based tools for mood, pain, resilience, and recovery.')}</DyslexiaText>
      
      {/* Beta Features Section */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>🚀 Beta Features</Text>
        <View style={s.betaBadge}>
          <Text style={s.betaBadgeText}>NEW</Text>
        </View>
      </View>
      <DyslexiaText style={s.sectionDesc}>
        Try our latest AI-powered wellness tools. Your feedback helps us improve!
      </DyslexiaText>
      <GapView gap={12}>
        {betaFeatures.map(feature => (
          <Card key={feature.href} {...feature} palette={palette} />
        ))}
      </GapView>

      {/* Core Features Section */}
      <Text style={[s.sectionTitle, { marginTop: 24 }]}>🔧 Core Tools</Text>
      <DyslexiaText style={s.sectionDesc}>
        Proven wellness and recovery tools used by the 3mpwr community.
      </DyslexiaText>
      <GapView gap={12}>
        {coreFeatures.map(feature => (
          <Card key={feature.href} {...feature} palette={palette} />
        ))}
      </GapView>
    </ScrollView>
  );
}

function Card({ href, title, desc, icon, isBeta, palette }: { href: string; title: string; desc: string; icon: string; isBeta?: boolean; palette: any; }){
  const router = useRouter();
  const s = cardStyles(palette);
  return (
    <Pressable // a11y-scan: attributes on following lines
      onPress={() => router.push(href as any)}
      hitSlop={HIT_SLOP_8} 
      accessibilityRole="button" 
      style={[s.card, isBeta && s.betaCard]}
    >
      <View style={s.iconContainer}>
        <Text style={s.icon}>{icon}</Text>
      </View>
      <View style={s.content}>
        <View style={s.titleRow}>
          <Text style={s.title}>{title}</Text>
          {isBeta && (
            <View style={s.miniBetaBadge}>
              <Text style={s.miniBetaText}>BETA</Text>
            </View>
          )}
        </View>
        <DyslexiaText style={s.desc}>{desc}</DyslexiaText>
      </View>
    </Pressable>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container:{ 
      flex:1, 
      backgroundColor: palette.background 
    },
    header:{ 
      color: palette.text, 
      fontSize: 24, 
      fontWeight: '800',
      marginBottom: 8,
    },
    subtitle:{ 
      color: palette.text, 
      opacity: 0.9, 
      marginBottom: 16,
      fontSize: 14,
      lineHeight: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '700',
      marginRight: 8,
    },
    sectionDesc: {
      color: palette.text,
      opacity: 0.8,
      marginBottom: 12,
      fontSize: 13,
      lineHeight: 18,
    },
    betaBadge: {
      backgroundColor: palette.warning,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    betaBadgeText: {
      color: palette.onPrimary,
      fontSize: 11,
      fontWeight: '700',
    },
  });
}

function cardStyles(palette: any) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      borderRadius: 12, 
      padding: 12,
      backgroundColor: palette.surface,
      alignItems: 'flex-start',
    },
    betaCard: {
      borderColor: palette.warning + '88',
      borderWidth: 2,
      backgroundColor: palette.warning + '11',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: palette.primary + '22',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    icon: {
      fontSize: 24,
    },
    content: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    title: { 
      color: palette.text, 
      fontWeight: '700',
      fontSize: 15,
      flex: 1,
    },
    desc: { 
      color: palette.text, 
      opacity: 0.85, 
      fontSize: 13,
      lineHeight: 18,
    },
    miniBetaBadge: {
      backgroundColor: palette.warning,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 6,
    },
    miniBetaText: {
      color: palette.onPrimary,
      fontSize: 9,
      fontWeight: '700',
    },
  });
}
