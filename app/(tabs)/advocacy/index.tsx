import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import JurisdictionDeadlineCalculator from '../../../components/JurisdictionDeadlineCalculator';
import JurisdictionFormHelper from '../../../components/JurisdictionFormHelper';
import { JurisdictionPanel } from '../../../components/JurisdictionPanel';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import SearchBar from '../../../components/SearchBar';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';

type Feature = { route: string; key: keyof typeof featureKeyMap; };
// Map feature keys to translation keys under advocacy.tools.*
const featureKeyMap = {
  ai_translator: 'advocacy.tools.ai_translator',
  ai_case: 'advocacy.tools.ai_case',
  ai_gov: 'advocacy.tools.ai_gov',
  ally_hub: 'advocacy.tools.ally_hub',
  collective: 'advocacy.tools.collective',
  finder: 'advocacy.tools.finder',
  policy_simple: 'advocacy.tools.policy_simple',
  ratings: 'advocacy.tools.ratings',
  self_coach: 'advocacy.tools.self_coach',
  accountability: 'advocacy.tools.accountability',
  accountability_cases: 'advocacy.tools.accountability_cases',
} as const;

const FEATURES: Feature[] = [
  { route: '/(tabs)/advocacy/ai-advocate-translator', key: 'ai_translator' },
  { route: '/(tabs)/advocacy/ai-case-interpreter', key: 'ai_case' },
  { route: '/(tabs)/advocacy/ai-gov-navigator', key: 'ai_gov' },
  { route: '/(tabs)/advocacy/self-advocacy-coach', key: 'self_coach' },
  { route: '/(tabs)/advocacy/policy-simple', key: 'policy_simple' },
  { route: '/(tabs)/advocacy/lawyer-finder', key: 'finder' },
  { route: '/(tabs)/advocacy/ratings', key: 'ratings' },
  { route: '/(tabs)/advocacy/ally-hub', key: 'ally_hub' },
  { route: '/(tabs)/advocacy/collective-legal', key: 'collective' },
  { route: '/(tabs)/advocacy/accountability-coach', key: 'accountability' },
  { route: '/(tabs)/advocacy/accountability-cases', key: 'accountability_cases' },
];

export default function AdvocacyHub() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t('advocacy.hub.title','Advocacy Hub'));
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState('');
  const norm = (v: string) => v.toLowerCase().replace(/\s+/g,'-');
  const matches = (href: string) => {
    if (!query.trim()) return true;
    const q = norm(query.trim());
    const h = norm(href);
    return h.includes(q);
  };
  // Features flagged as placeholders/incomplete today
  const BETA: Array<Feature['key']> = [
    // High-priority items now available for early testing
    'ai_translator',
    'ai_case',
    'ai_gov',
    'policy_simple',
    'finder',
    'ratings',
  ];
  const COMING_SOON: Array<Feature['key']> = [
    // Still staging / design phase
    'ally_hub',
    'collective',
    'accountability',
    'accountability_cases',
  ];
  return (
    <ResponsiveScreenWrapper scrollable testID="advocacy-screen">
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('advocacy.hub.title','Advocacy Hub')}</Text>
      <Text style={s.subtitle}>{t('advocacy.hub.subtitle','Unified access to AI tools, directories, coaching, ratings, ally resources, and collective action features. Choose a tool below.')}</Text>
  
  <DisclaimerBanner type="legal" compact />
  
  <JurisdictionPanel />
  <JurisdictionDeadlineCalculator />
  <JurisdictionFormHelper />

      <SearchBar value={query} onChangeText={setQuery} placeholder={t('advocacy.search','Search advocacy tools...')} />

      <Text style={s.sectionHeader}>{t('advocacy.sections.ai','AI Tools')}</Text>
      {FEATURES.filter(f => ['ai_translator','ai_case','ai_gov','policy_simple'].includes(f.key)).map(f => {
        const base = t(featureKeyMap[f.key]);
        const titleText = BETA.includes(f.key)
          ? `${base} (Beta)`
          : COMING_SOON.includes(f.key)
          ? `${base} (Coming soon)`
          : `${base}\u200B`;
        return matches(f.route) ? (
          <Link key={f.route} href={f.route as any} asChild>
            <View style={s.card} accessibilityRole="button">
              <Text style={s.cardTitle}>{titleText}</Text>
            </View>
          </Link>
        ) : null;
      })}

      <Text style={s.sectionHeader}>{t('advocacy.sections.coaching','Coaching')}</Text>
      {FEATURES.filter(f => ['self_coach'].includes(f.key)).map(f => {
        const base = t(featureKeyMap[f.key]);
        const titleText = BETA.includes(f.key)
          ? `${base} (Beta)`
          : COMING_SOON.includes(f.key)
          ? `${base} (Coming soon)`
          : `${base}\u200B`;
        return matches(f.route) ? (
          <Link key={f.route} href={f.route as any} asChild>
            <View style={s.card} accessibilityRole="button">
              <Text style={s.cardTitle}>{titleText}</Text>
            </View>
          </Link>
        ) : null;
      })}

      <Text style={s.sectionHeader}>{t('advocacy.sections.directories','Directories & Ratings')}</Text>
      {FEATURES.filter(f => ['finder','ratings','ally_hub'].includes(f.key)).map(f => {
        const base = t(featureKeyMap[f.key]);
        const titleText = BETA.includes(f.key)
          ? `${base} (Beta)`
          : COMING_SOON.includes(f.key)
          ? `${base} (Coming soon)`
          : `${base}\u200B`;
        return matches(f.route) ? (
          <Link key={f.route} href={f.route as any} asChild>
            <View style={s.card} accessibilityRole="button">
              <Text style={s.cardTitle}>{titleText}</Text>
            </View>
          </Link>
        ) : null;
      })}

      <Text style={s.sectionHeader}>{t('advocacy.sections.collective','Collective & Accountability')}</Text>
      {FEATURES.filter(f => ['collective','accountability','accountability_cases'].includes(f.key)).map(f => {
        const base = t(featureKeyMap[f.key]);
        const titleText = BETA.includes(f.key)
          ? `${base} (Beta)`
          : COMING_SOON.includes(f.key)
          ? `${base} (Coming soon)`
          : `${base}\u200B`;
        return matches(f.route) ? (
          <Link key={f.route} href={f.route as any} asChild>
            <View style={s.card} accessibilityRole="button">
              <Text style={s.cardTitle}>{titleText}</Text>
            </View>
          </Link>
        ) : null;
      })}
    </ResponsiveScreenWrapper>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    title: { fontSize:24, fontWeight:'700', color: palette.text, marginBottom: 8 },
    subtitle: { color: palette.text, opacity:0.9, marginBottom: 16 },
    sectionHeader: { color: palette.text, opacity:0.9, marginTop: 16, marginBottom: 8, fontWeight: '700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 10, padding: 14, backgroundColor: palette.surface, marginBottom: 12 },
    cardTitle: { color: palette.text, fontWeight:'700', marginBottom: 4 },
    comingSoon: { color: palette.text, opacity: 0.7 },
    padZWS: { color: 'transparent' },
    cardDesc: { color: palette.text, opacity:0.85, fontSize: 13 },
  });
}
