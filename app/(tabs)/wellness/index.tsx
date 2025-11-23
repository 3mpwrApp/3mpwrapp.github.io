import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import SearchBar from '../../../components/SearchBar';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { CONSOLIDATION_FLAGS, isConsolidationFeatureEnabled } from '../../../services/consolidationFlags';
import { useComplexityMode } from '../../../store/complexityMode';
import { createTextStyles } from '../../../theme/typography.enhanced';
import { useAppPalette } from '../../../theme/usePalette';

// Memoized Card component for better performance
const Card = React.memo<{ href: string; title: string; desc: string }>(
  ({ href, title, desc }) => {
    const palette = useAppPalette();
    return (
      <Link href={href as any} asChild={true}>
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
  const { isFeatureVisible } = useComplexityMode();
  
  const [query, setQuery] = React.useState('');
  const [unifiedHealthTrackerEnabled, setUnifiedHealthTrackerEnabled] = React.useState(false);

  // Check feature flag on mount
  React.useEffect(() => {
    isConsolidationFeatureEnabled(CONSOLIDATION_FLAGS.UNIFIED_HEALTH_TRACKER)
      .then(setUnifiedHealthTrackerEnabled)
      .catch(() => setUnifiedHealthTrackerEnabled(false));
  }, []);
  
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
        '/wellness/health-tracker',
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
      
      <DisclaimerBanner type="medical" compact={true} />
      
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('wellness.search', 'Search wellness tools...')}
      />

      {/* Featured: Consolidated Hubs */}
      <Text style={[textStyles.h3, { marginTop: 16, marginBottom: 8 }]}>
        {t('wellness.sections.featured', '⭐ Featured Hubs')}
      </Text>
      <GapView gap={12}>
        {matches('/wellness/energy-hub') && (
          <Link href="/wellness/energy-hub" asChild={true}>
            <Pressable
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel="Energy and Mood Hub - Track energy, mood, sleep, and pacing in one place"
              style={({ pressed }) => [
                {
                  borderWidth: 2,
                  borderColor: palette.primary,
                  borderRadius: 12,
                  padding: 16,
                  backgroundColor: palette.primary + '10',
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={{ color: palette.primary, fontWeight: 'bold', fontSize: 18, lineHeight: 24 }}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                ⚡ Energy & Mood Hub
              </Text>
              <Text
                style={{ color: palette.text, marginTop: 6, fontSize: 15, lineHeight: 22 }}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                Track energy (spoons), mood, sleep, and pacing. Includes forecasting and community features.
              </Text>
              <Text
                style={{ color: palette.primary, marginTop: 8, fontSize: 13, fontWeight: '600' }}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                Consolidates 6 tools: Spoons, Mood, Sleep, Pacing & More
              </Text>
            </Pressable>
          </Link>
        )}
        {unifiedHealthTrackerEnabled && matches('/wellness/health-tracker') && (
          <Card
            href="/wellness/health-tracker"
            title="🏥 Unified Health Tracker"
            desc="Track symptoms, pain, chronic conditions, rehab, and pacing in one place. Consolidates 5 tracking tools."
          />
        )}
        {matches('/wellness/mental-wellness-toolkit') && (
          <Card
            href="/wellness/mental-wellness-toolkit"
            title="🧠 Mental Wellness Toolkit"
            desc="All CBT/DBT tools in one place: thought reframing, emotion skills, grounding, and crisis tools. Consolidates 8 cognitive tools."
          />
        )}
        {matches('/wellness/movement-rehab-hub') && (
          <Card
            href="/wellness/movement-rehab-hub"
            title="💪 Movement & Rehab Hub"
            desc="Gentle exercises, micro-movements, rehab games, and nutrition guides. Consolidates 4 movement tools."
          />
        )}
      </GapView>

      {/* Additional Tools */}
      <Text style={[textStyles.h3, { marginTop: 16, marginBottom: 8 }]}>
        {t('wellness.sections.additional', 'Additional Tools')}
      </Text>
      <GapView gap={12}>
        {matches('/wellness/work-balance-ai') && (
          <Card
            href="/wellness/work-balance-ai"
            title={t('wellness.workBalance.title', 'Work-Balance AI')}
            desc={t('wellness.workBalance.desc', 'Balance work demands with health.')}
          />
        )}
        {matches('/wellness/functional-capacity') && (
          <Card
            href="/wellness/functional-capacity"
            title="Functional Capacity Assessment"
            desc="WHO ICF-based disability documentation and tracking."
          />
        )}
      </GapView>



      {/* Miscellaneous */}
      <Text style={[textStyles.h3, { marginTop: 16, marginBottom: 8 }]}>
        {t('wellness.sections.misc', 'Miscellaneous')}
      </Text>
      <GapView gap={12}>
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
        {matches('/wellness/reminders') && (
          <Card
            href="/wellness/reminders"
            title={t('wellness.reminders.title', 'Wellness Reminders')}
            desc={t('wellness.reminders.desc', 'Customize notifications for your wellness routine.')}
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
        {matches('/wellness/daily-planner') && (
          <Card
            href="/wellness/daily-planner"
            title={label('/wellness/daily-planner', t('wellness.dailyPlanner.title', 'Daily Planner'))}
            desc={t('wellness.dailyPlanner.desc', 'Plan tasks with your energy in mind.')}
          />
        )}
        {matches('/wellness/self-care-library') && (
          <Card
            href="/wellness/self-care-library"
            title={label('/wellness/self-care-library', t('wellness.selfCare.title', 'Self-Care Library'))}
            desc={t('wellness.selfCare.desc', 'Curated self-care practices.')}
          />
        )}
        {matches('/wellness/trigger-detector') && (
          <Card
            href="/wellness/trigger-detector"
            title={t('wellness.triggers.title', 'Trigger Detector')}
            desc={t('wellness.triggers.desc', 'Suggest correlations from logs.')}
          />
        )}
        {matches('/wellness/harm-reduction') && (
          <Card
            href="/wellness/harm-reduction"
            title={t('wellness.harm.title', 'Harm Reduction Guide')}
            desc={t('wellness.harm.desc', 'Practical steps to increase safety.')}
          />
        )}
      </GapView>


    </ResponsiveScreenWrapper>
  );
}
