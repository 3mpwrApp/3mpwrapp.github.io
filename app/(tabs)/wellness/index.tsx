import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ComplexityModeIndicator from '../../../components/ComplexityModeIndicator';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import SearchBar from '../../../components/SearchBar';
import SimpleModeWelcome from '../../../components/SimpleModeWelcome';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useComplexityMode } from '../../../store/complexityMode';
import { createTextStyles } from '../../../theme/typography.enhanced';
import { useAppPalette } from '../../../theme/usePalette';

// Memoized Card component for better performance - uses useRouter internally
const Card = React.memo<{ href: string; title: string; desc: string }>(
  ({ href, title, desc }) => {
    const palette = useAppPalette();
    const router = useRouter();
    return (
      <Pressable
        hitSlop={HIT_SLOP_8}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${desc}`}
        onPress={() => router.push(href as any)}
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
    );
  }
);
Card.displayName = 'Card';

export default function WellnessHub() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  const textStyles = React.useMemo(() => createTextStyles(palette), [palette]);
  const { isFeatureVisible } = useComplexityMode();
  
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
        '/wellness/ambience',
        '/wellness/grief-support',
        '/wellness/symptom-tracker',
        '/wellness/pain-forecast',
        '/wellness/sleep-energy-tracker',
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
  
  // Helper for labeling beta/coming soon features (kept for future use)
  const _label = React.useCallback(
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={textStyles.h1}>
            {t('wellness.hub.title', 'Wellness & Recovery')}
          </Text>
        </View>
        <ComplexityModeIndicator variant="badge" />
      </View>
      <Text style={textStyles.body} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wellness.hub.subtitle', 'Evidence-based tools for mood, pain, resilience, and recovery.')}
      </Text>
      
      <DisclaimerBanner type="medical" compact={true} />
      
      {/* Simple Mode Welcome */}
      <SimpleModeWelcome 
        tabName="Wellness"
        availableFeatures={['Mood Tracker', 'Energy & Mood Hub']}
        hiddenCount={20}
      />
      
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('wellness.search', 'Search wellness tools...')}
      />

      {/* PRIMARY: Wellness Command Center */}
      <Text style={[textStyles.h3, { marginTop: 16, marginBottom: 8 }]}>
        {t('wellness.sections.command', '🎯 Start Here')}
      </Text>
      <GapView gap={12}>
        {matches('/wellness/command-center') && (
          <Pressable
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel="Wellness Command Center - All-in-one health, energy, and wellness hub"
            onPress={() => router.push('/(tabs)/wellness/command-center' as any)}
            style={({ pressed }) => [
              {
                borderWidth: 3,
                borderColor: palette.success,
                borderRadius: 16,
                padding: 20,
                backgroundColor: palette.success + '15',
              },
              pressed && { opacity: 0.7 },
            ]}
          >
              <Text
                style={{ color: palette.success, fontWeight: 'bold', fontSize: 22, lineHeight: 28 }}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                ⚡ Wellness Command Center
              </Text>
              <Text
                style={{ color: palette.text, marginTop: 8, fontSize: 16, lineHeight: 24 }}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                All-in-one hub for energy, health, mental wellness, and movement. Consolidates 40+ features into one powerful interface.
              </Text>
              <Text
                style={{ color: palette.success, marginTop: 12, fontSize: 14, fontWeight: '700' }}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                🚀 NEW • 5 Tabs • Dashboard + Quick Log + AI Features
              </Text>
            </Pressable>
        )}
      </GapView>

      {/* Consolidated Power Hubs (Standard/Power User) */}
      {isFeatureVisible('standard') && (
        <>
          <Text style={[textStyles.h3, { marginTop: 24, marginBottom: 8 }]}>
            {t('wellness.sections.featured', 'Advanced Hubs')}
          </Text>
          <GapView gap={12}>
        {/* Power Tool 1: Energy Command Center (Legacy) - available in Simple Mode */}
        {matches('/wellness/energy-command-center') && (
          <Pressable
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel="Energy Command Center - Complete energy, pacing, mood, and sleep management"
            onPress={() => router.push('/(tabs)/wellness/energy-command-center' as any)}
            style={({ pressed }) => [
              {
                borderWidth: 1,
                borderColor: palette.muted,
                borderRadius: 12,
                padding: 16,
                backgroundColor: palette.card,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
              <Text
                style={{ color: palette.text, fontWeight: 'bold', fontSize: 16, lineHeight: 24 }}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                ⚡ Energy Command Center (Classic)
              </Text>
              <Text
                style={{ color: palette.text, marginTop: 6, fontSize: 14, lineHeight: 20 }}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                Complete energy management with spoons, pacing, mood tracking, cognitive support, and sleep optimization.
              </Text>
              <Text
                style={{ color: palette.primary, marginTop: 8, fontSize: 12, fontWeight: '600' }}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                🔧 Power Tool • 5 Tabs • Consolidates 15+ features
              </Text>
            </Pressable>
        )}
        
        {/* Power Tool 2: Unified Health Hub - available in Simple Mode for meds */}
        {matches('/wellness/health-tracker-pro') && (
          <Pressable
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel="Unified Health Hub - Symptoms, medications, doctor visits, body metrics, and self-care"
            onPress={() => router.push('/(tabs)/wellness/health-tracker-pro' as any)}
            style={({ pressed }) => [
              {
                borderWidth: 2,
                borderColor: palette.success,
                borderRadius: 12,
                padding: 16,
                backgroundColor: palette.success + '10',
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={{ color: palette.success, fontWeight: 'bold', fontSize: 18, lineHeight: 24 }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              🏥 Unified Health Hub
            </Text>
            <Text
              style={{ color: palette.text, marginTop: 6, fontSize: 15, lineHeight: 22 }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              All-in-one health management: symptoms, medications, doctor visits, body metrics, environment, nutrition, and self-care.
            </Text>
            <Text
              style={{ color: palette.success, marginTop: 8, fontSize: 13, fontWeight: '600' }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              🔧 Power Tool • 7 Tabs • Consolidates 20+ features
            </Text>
          </Pressable>
        )}
        
        {/* Power Tool 3: Mental Wellness Toolkit - Standard mode and above */}
        {isFeatureVisible('standard') && matches('/wellness/mental-wellness-toolkit') && (
          <Pressable
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel="Mental Wellness Toolkit - CBT, DBT, grounding, and crisis tools"
            onPress={() => router.push('/(tabs)/wellness/mental-wellness-toolkit' as any)}
            style={({ pressed }) => [
              {
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: palette.muted,
                borderRadius: 12,
                padding: 16,
                backgroundColor: palette.card,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={{ color: palette.text, fontWeight: 'bold', fontSize: 16, lineHeight: 24 }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              🧠 Mental Wellness Toolkit
            </Text>
            <Text
              style={{ color: palette.text, marginTop: 6, fontSize: 15, lineHeight: 22 }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              All CBT/DBT tools in one place: thought reframing, emotion skills, grounding, and crisis tools.
            </Text>
            <Text
              style={{ color: palette.primary, marginTop: 8, fontSize: 13, fontWeight: '600' }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              🔧 Power Tool • 8 Tabs • Consolidates 8 cognitive tools
            </Text>
          </Pressable>
        )}
        
        {/* Power Tool 4: Movement & Rehab Hub - Standard mode and above */}
        {isFeatureVisible('standard') && matches('/wellness/movement-power-tool') && (
          <Pressable
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel="Movement and Rehab Hub - Exercise, rehabilitation, adaptive movement, and recovery"
            onPress={() => router.push('/(tabs)/wellness/movement-power-tool' as any)}
            style={({ pressed }) => [
              {
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: palette.muted,
                borderRadius: 12,
                padding: 16,
                backgroundColor: palette.card,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={{ color: palette.text, fontWeight: 'bold', fontSize: 16, lineHeight: 24 }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              💪 Movement & Rehab Hub
            </Text>
            <Text
              style={{ color: palette.text, marginTop: 6, fontSize: 15, lineHeight: 22 }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              Exercise, rehabilitation, adaptive movement, and recovery tools.
            </Text>
            <Text
              style={{ color: palette.primary, marginTop: 8, fontSize: 13, fontWeight: '600' }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              🔧 Power Tool • 4 Tabs • Consolidates 5 movement tools
            </Text>
          </Pressable>
        )}
      </GapView>

      {/* Legacy Hub (for existing users) - shown below main hubs */}
      {isFeatureVisible('power_user') && matches('/wellness/energy-hub') && (
        <>
          <Text style={[textStyles.h3, { marginTop: 16, marginBottom: 8 }]}>
            {t('wellness.sections.legacy', 'Classic Tools')}
          </Text>
          <GapView gap={12}>
            <Card
              href="/wellness/energy-hub"
              title="⚡ Energy & Mood Hub (Classic)"
              desc="Legacy version - Track energy (spoons), mood, sleep, and pacing."
            />
          </GapView>
        </>
      )}

      {/* Additional Tools - Power User mode */}
      {isFeatureVisible('power_user') && (
        <>
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
        </>
      )}
      </>
      )}
    </ResponsiveScreenWrapper>
  );
}
