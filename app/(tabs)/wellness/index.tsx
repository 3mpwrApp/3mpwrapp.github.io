import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import SearchBar from '../../../components/SearchBar';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { createTextStyles } from '../../../theme/typography.enhanced';
import { useAppPalette } from '../../../theme/usePalette';

// Memoized Card component for better performance
const Card = React.memo<{ href: string; title: string; desc: string }>(
  ({ href, title, desc }) => {
    const palette = useAppPalette();
    return (
      <Link href={href as any} asChild>
        <Pressable
          hitSlop={HIT_SLOP_8}
          accessibilityRole="button"
          accessibilityLabel={`${title}. ${desc}`}
          style={({ pressed }) => [
            {
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: palette.muted,
              borderRadius: 8,
              padding: 12,
              backgroundColor: palette.card,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text
            style={{ color: palette.text, fontWeight: '700', fontSize: 16, lineHeight: 24 }}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {title}
          </Text>
          <Text
            style={{ color: palette.text, opacity: 0.9, marginTop: 4, fontSize: 14, lineHeight: 21 }}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {desc}
          </Text>
        </Pressable>
      </Link>
    );
  }
);
Card.displayName = 'Card';

export default function WellnessHub() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const textStyles = React.useMemo(() => createTextStyles(palette), [palette]);
  
  const [query, setQuery] = React.useState('');
  
  // Memoize helper functions
  const norm = React.useCallback((v: string) => v.toLowerCase().replace(/\s+/g, '-'), []);
  const matches = React.useCallback(
    (href: string) => {
      if (!query.trim()) return true;
      const q = norm(query.trim());
      const h = norm(href);
      return h.includes(q);
    },
    [query, norm]
  );
  
  // Memoize static sets
  const COMING_SOON = React.useMemo(
    () =>
      new Set<string>([
        '/wellness/self-care-library',
        '/wellness/resilience',
      ]),
    []
  );
  
  const BETA = React.useMemo(
    () =>
      new Set<string>([
        '/wellness/ai-companion',
        '/wellness/micro-movement',
        '/wellness/pacing-partner',
        '/wellness/work-balance-ai',
        '/wellness/self-care-library',
        '/wellness/ambience',
        '/wellness/grief-support',
        '/wellness/symptom-tracker',
        '/wellness/pain-forecast',
        '/wellness/sleep-energy-tracker',
        '/wellness/energy-coins',
        '/wellness/daily-planner',
        '/wellness/exercise-hub',
        '/wellness/reflections-calendar',
        '/wellness/rehab-games',
        '/wellness/nutrition-guides',
        '/wellness/sleep-reframe',
        '/wellness/cbt-mini-games',
        '/wellness/dbt',
        '/wellness/opposite-action',
        '/wellness/radical-acceptance',
        '/wellness/acceptance-function',
        '/wellness/distress-tolerance',
        '/wellness/belief-meter',
        '/wellness/adaptive-meditation',
        '/wellness/dreams',
      ]),
    []
  );
  
  const label = React.useCallback(
    (href: string, title: string) =>
      BETA.has(href)
        ? `${title} (Beta)`
        : COMING_SOON.has(href)
          ? `${title} (Coming soon)`
          : title,
    [BETA, COMING_SOON]
  );
  
  return (
    <ResponsiveScreenWrapper>
      <Text accessibilityRole="header" style={textStyles.h1}>
        {t('wellness.hub.title', 'Wellness & Recovery')}
      </Text>
      <Text style={textStyles.body} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wellness.hub.subtitle', 'Evidence-based tools for mood, pain, resilience, and recovery.')}
      </Text>
      
      <DisclaimerBanner type="medical" compact />
      
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('wellness.search', 'Search wellness tools...')}
      />

      {/* Movement */}
      <Text style={[textStyles.h3, { marginTop: 16, marginBottom: 8 }]}>
        {t('wellness.sections.movement', 'Movement')}
      </Text>
      <View style={{ gap: 12 }}>
        {matches('/wellness/micro-movement') && (
          <Card
            href="/wellness/micro-movement"
            title={t('wellness.micro.title', 'Micro-Movements Coach')}
            desc={t('wellness.micro.desc', 'Gentle, chair-friendly movement ideas.')}
          />
        )}
        {matches('/wellness/exercise-hub') && (
          <Card
            href="/wellness/exercise-hub"
            title={label('/wellness/exercise-hub', t('wellness.exerciseHub.title', 'Exercise Hub'))}
            desc={t('wellness.exerciseHub.desc', 'Discover gentle routines and videos.')}
          />
        )}
        {matches('/wellness/rehab-games') && (
          <Card
            href="/wellness/rehab-games"
            title={label('/wellness/rehab-games', t('wellness.rehabGames.title', 'Rehab Games'))}
            desc={t('wellness.rehabGames.desc', 'Light, recovery-friendly activities.')}
          />
        )}
        {matches('/wellness/pacing-partner') && (
          <Card
            href="/wellness/pacing-partner"
            title={t('wellness.pacingPartner.title', 'Pacing Partner')}
            desc={t('wellness.pacingPartner.desc', 'Right-size activities to avoid crashes.')}
          />
        )}
        {matches('/wellness/nutrition-guides') && (
          <Card
            href="/wellness/nutrition-guides"
            title={label('/wellness/nutrition-guides', t('wellness.nutrition.title', 'Diet & Nutrition Guides'))}
            desc={t('wellness.nutrition.desc', 'Eating ideas tailored to symptoms.')}
          />
        )}
        {matches('/wellness/work-balance-ai') && (
          <Card
            href="/wellness/work-balance-ai"
            title={t('wellness.workBalance.title', 'Work-Balance AI')}
            desc={t('wellness.workBalance.desc', 'Balance work demands with health.')}
          />
        )}
      </View>

      {/* Sleep */}
      <Text style={[textStyles.h3, { marginTop: 16, marginBottom: 8 }]}>
        {t('wellness.sections.sleep', 'Sleep')}
      </Text>
      <View style={{ gap: 12 }}>
        {matches('/wellness/sleep-reframe') && (
          <Card
            href="/wellness/sleep-reframe"
            title={label('/wellness/sleep-reframe', t('wellness.sleepReframe.title', 'Sleep Reframe'))}
            desc={t('wellness.sleepReframe.desc', 'Kind reframes and routines for better sleep.')}
          />
        )}
        {matches('/wellness/sleep-energy-tracker') && (
          <Card
            href="/wellness/sleep-energy-tracker"
            title={t('wellness.sleepEnergy.title', 'Sleep & Energy Tracker')}
            desc={t('wellness.sleepEnergy.desc', 'Track rest, energy, and patterns.')}
          />
        )}
      </View>

      {/* Cognitive */}
      <Text style={[textStyles.h3, { marginTop: 16, marginBottom: 8 }]}>
        {t('wellness.sections.cognitive', 'Cognitive')}
      </Text>
      <View style={{ gap: 12 }}>
        {matches('/wellness/cbt-coach') && (
          <Card
            href="/wellness/cbt-coach"
            title={label('/wellness/cbt-coach', t('wellness.cbt.title', 'CBT Virtual Coach'))}
            desc={t('wellness.cbt.desc', 'Reframe thoughts with evidence.')}
          />
        )}
        {matches('/wellness/cbt-mini-games') && (
          <Card
            href="/wellness/cbt-mini-games"
            title={label('/wellness/cbt-mini-games', t('wellness.mini.title', 'CBT Mini-Games'))}
            desc={t('wellness.mini.desc', 'Quick grounding games to calm.')}
          />
        )}
        {matches('/wellness/dbt') && (
          <Card
            href="/wellness/dbt"
            title={label('/wellness/dbt', t('wellness.dbt.title', 'DBT Skill Matcher'))}
            desc={t('wellness.dbt.desc', 'Instant skill suggestions for current emotion.')}
          />
        )}
        {matches('/wellness/opposite-action') && (
          <Card
            href="/wellness/opposite-action"
            title={label('/wellness/opposite-action', t('wellness.opposite.title', 'Opposite Action Companion'))}
            desc={t('wellness.opposite.desc', 'Try small, safe opposite actions.')}
          />
        )}
        {matches('/wellness/radical-acceptance') && (
          <Card
            href="/wellness/radical-acceptance"
            title={label('/wellness/radical-acceptance', t('wellness.acceptance.title', 'Radical Acceptance'))}
            desc={t('wellness.acceptance.desc', 'Reduce suffering; take wise action.')}
          />
        )}
        {matches('/wellness/acceptance-function') && (
          <Card
            href="/wellness/acceptance-function"
            title={label('/wellness/acceptance-function', t('wellness.acceptFn.title', 'Acceptance & Function'))}
            desc={t('wellness.acceptFn.desc', 'Track acceptance and function.')}
          />
        )}
        {matches('/wellness/distress-tolerance') && (
          <Card
            href="/wellness/distress-tolerance"
            title={label('/wellness/distress-tolerance', t('wellness.distress.title', 'Distress Tolerance'))}
            desc={t('wellness.distress.desc', 'Brief skills to reduce crisis intensity.')}
          />
        )}
        {matches('/wellness/belief-meter') && (
          <Card
            href="/wellness/belief-meter"
            title={label('/wellness/belief-meter', t('wellness.belief.title', 'Belief Strength Meter'))}
            desc={t('wellness.belief.desc', 'Rate belief strength and track change.')}
          />
        )}
        {matches('/wellness/adaptive-meditation') && (
          <Card
            href="/wellness/adaptive-meditation"
            title={label('/wellness/adaptive-meditation', t('wellness.adaptiveMeditation.title', 'Adaptive Meditation'))}
            desc={t('wellness.adaptiveMeditation.desc', 'Meditations tuned to your state.')}
          />
        )}
        {matches('/wellness/ai-companion') && (
          <Card
            href="/wellness/ai-companion"
            title={label('/wellness/ai-companion', t('wellness.aiCompanion.title', 'AI Companion'))}
            desc={t('wellness.aiCompanion.desc', 'A gentle assistant for wellness.')}
          />
        )}
        {matches('/wellness/ambience') && (
          <Card
            href="/wellness/ambience"
            title={label('/wellness/ambience', t('wellness.ambience.title', 'Ambience Sync AI'))}
            desc={t('wellness.ambience.desc', 'Match background, color, soundscape to your mood.')}
          />
        )}
        {matches('/wellness/grief-support') && (
          <Card
            href="/wellness/grief-support"
            title={label('/wellness/grief-support', t('wellness.griefSupport.title', 'Grief Support'))}
            desc={t('wellness.griefSupport.desc', 'Compassionate prompts and resources.')}
          />
        )}
        {matches('/wellness/resilience') && (
          <Card
            href="/wellness/resilience"
            title={label('/wellness/resilience', t('wellness.resilience.title', 'Resilience Points'))}
            desc={t('wellness.resilience.desc', 'Gamified micro-wins for therapy and life steps.')}
          />
        )}
        {matches('/wellness/hub') && (
          <Card
            href="/wellness/hub"
            title={t('wellness.classicHub.title', 'Classic Wellness Hub')}
            desc={t('wellness.classicHub.desc', 'Alternate, compact entry point.')}
          />
        )}
      </View>

      {/* Tracking */}
      <Text style={[textStyles.h3, { marginTop: 16, marginBottom: 8 }]}>
        {t('wellness.sections.tracking', 'Tracking')}
      </Text>
      <View style={{ gap: 12 }}>
        {matches('/wellness/symptom-tracker') && (
          <Card
            href="/wellness/symptom-tracker"
            title={label('/wellness/symptom-tracker', t('wellness.symptomTracker.title', 'Symptom & Pain Tracker'))}
            desc={t('wellness.symptomTracker.desc', 'Log symptoms and pain trends.')}
          />
        )}
        {matches('/wellness/pain-forecast') && (
          <Card
            href="/wellness/pain-forecast"
            title={label('/wellness/pain-forecast', t('wellness.painForecast.title', 'Pain Forecast'))}
            desc={t('wellness.painForecast.desc', 'Simple trend-based suggestions for pacing.')}
          />
        )}
        {matches('/wellness/energy-coins') && (
          <Card
            href="/wellness/energy-coins"
            title={label('/wellness/energy-coins', t('wellness.energy.title', 'Daily Energy Coins'))}
            desc={t('wellness.energy.desc', 'Set a budget and spend coins on tasks.')}
          />
        )}
        {matches('/wellness/daily-planner') && (
          <Card
            href="/wellness/daily-planner"
            title={label('/wellness/daily-planner', t('wellness.dailyPlanner.title', 'Daily Planner'))}
            desc={t('wellness.dailyPlanner.desc', 'Plan tasks with your energy in mind.')}
          />
        )}
        {matches('/wellness/reflections-calendar') && (
          <Card
            href="/wellness/reflections-calendar"
            title={label('/wellness/reflections-calendar', t('wellness.reflections.title', 'Reflections Calendar'))}
            desc={t('wellness.reflections.desc', 'Daily notes, gratitude, and wins.')}
          />
        )}
        {matches('/wellness/dreams') && (
          <Card
            href="/wellness/dreams"
            title={label('/wellness/dreams', t('wellness.dreams.title', 'Dream Tracker & Interpreter'))}
            desc={t('wellness.dreams.desc', 'Log dreams and get symbolic interpretations.')}
          />
        )}
        {matches('/wellness/self-care-library') && (
          <Card
            href="/wellness/self-care-library"
            title={label('/wellness/self-care-library', t('wellness.selfCare.title', 'Self-Care Library'))}
            desc={t('wellness.selfCare.desc', 'Curated self-care practices.')}
          />
        )}
      </View>
    </ResponsiveScreenWrapper>
  );
}
