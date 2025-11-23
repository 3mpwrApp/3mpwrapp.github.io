import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import JurisdictionDeadlineCalculator from '../../../components/JurisdictionDeadlineCalculator';
import JurisdictionFormHelper from '../../../components/JurisdictionFormHelper';
import { JurisdictionPanel } from '../../../components/JurisdictionPanel';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import SearchBar from '../../../components/SearchBar';
import SimpleModeWelcome from '../../../components/SimpleModeWelcome';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { CONSOLIDATION_FLAGS, isConsolidationFeatureEnabled } from '../../../services/consolidationFlags';
import { useComplexityMode } from '../../../store/complexityMode';
import { useAppPalette } from '../../../theme/usePalette';

type Feature = { route: string; key: keyof typeof featureKeyMap; };
// Map feature keys to translation keys under advocacy.tools.*
const featureKeyMap = {
  ai_assistant: 'advocacy.tools.ai_assistant',
  accountability_hub: 'advocacy.tools.accountability_hub',
  evidence_manager: 'advocacy.tools.evidence_manager',
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
  negotiation_coach: 'advocacy.tools.negotiation_coach',
} as const;

const FEATURES: Feature[] = [
  { route: '/(tabs)/advocacy/ai-assistant', key: 'ai_assistant' },
  { route: '/(tabs)/advocacy/accountability-hub', key: 'accountability_hub' },
  { route: '/(tabs)/advocacy/evidence-manager', key: 'evidence_manager' },
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
  { route: '/advocacy/negotiation-coach', key: 'negotiation_coach' },
];

export default function AdvocacyHub() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  const { isFeatureVisible } = useComplexityMode();
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

  const [unifiedAIEnabled, setUnifiedAIEnabled] = React.useState(true); // Enable AI Command Center
  const [accountabilityHubEnabled, setAccountabilityHubEnabled] = React.useState(false);
  const [evidenceManagerEnabled, setEvidenceManagerEnabled] = React.useState(false);

  // Check feature flags on mount
  React.useEffect(() => {
    Promise.all([
      isConsolidationFeatureEnabled(CONSOLIDATION_FLAGS.UNIFIED_AI_ASSISTANT),
      isConsolidationFeatureEnabled(CONSOLIDATION_FLAGS.ACCOUNTABILITY_HUB),
      isConsolidationFeatureEnabled(CONSOLIDATION_FLAGS.EVIDENCE_MANAGER),
    ]).then(([aiEnabled, accountabilityEnabled, evidenceEnabled]) => {
      setUnifiedAIEnabled(aiEnabled !== undefined ? aiEnabled : true); // Default to true
      setAccountabilityHubEnabled(accountabilityEnabled);
      setEvidenceManagerEnabled(evidenceEnabled);
    }).catch(() => {
      setUnifiedAIEnabled(true); // Default to true on error
      setAccountabilityHubEnabled(false);
      setEvidenceManagerEnabled(false);
    });
  }, []);
  // Features flagged as placeholders/incomplete today
  const BETA: Array<Feature['key']> = [
    // High-priority items now available for early testing
    'ai_assistant',
    'accountability_hub',
    'evidence_manager',
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
    <ResponsiveScreenWrapper testID="advocacy-screen">
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('advocacy.hub.title','Advocacy Hub')}</Text>
      <Text style={s.subtitle}>{t('advocacy.hub.subtitle','Unified AI tools, lawyer directories, case tracking, and collective action - all in one place.')}</Text>
  
  <DisclaimerBanner type="legal" compact={true} />
  
  <JurisdictionPanel />
  <JurisdictionDeadlineCalculator />
  <JurisdictionFormHelper />

      {/* Simple Mode Welcome */}
      <SimpleModeWelcome 
        tabName="Advocacy"
        availableFeatures={['AI Advocate Translator', 'Lawyer Finder']}
        hiddenCount={13}
      />

      {/* Featured Consolidated Hubs */}
      <Text style={s.sectionHeader}>⭐ {t('advocacy.sections.featured','Featured Hubs')}</Text>
      
      <Link href="/(tabs)/advocacy/ai-command-center" asChild={true}>
        <View style={[s.card, s.featuredCard]} accessibilityRole="button">
          <Text style={s.cardTitle}>🤖 {t('advocacy.aiCommand.title','AI Command Center')} (NEW)</Text>
          <Text style={s.cardDesc}>{t('advocacy.aiCommand.hubDesc','All-in-one AI: translate legal docs, analyze strength, navigate government - 5 tools unified')}</Text>
        </View>
      </Link>

      <Link href="/(tabs)/advocacy/accountability-network" asChild={true}>
        <View style={[s.card, s.featuredCard]} accessibilityRole="button">
          <Text style={s.cardTitle}>🔍 {t('advocacy.accountabilityNetwork.title','Accountability Network')} (Coming soon)</Text>
          <Text style={s.cardDesc}>{t('advocacy.accountabilityNetwork.hubDesc','Rate lawyers, find advocates, track cases, build coalitions - never-been-done crowd-sourced accountability')}</Text>
        </View>
      </Link>

      <Link href="/(tabs)/advocacy/evidence-vault" asChild={true}>
        <View style={[s.card, s.featuredCard]} accessibilityRole="button">
          <Text style={s.cardTitle}>🔒 {t('advocacy.evidenceVault.title','Evidence Vault')} (Coming soon)</Text>
          <Text style={s.cardDesc}>{t('advocacy.evidenceVault.hubDesc','Secure storage, AI categorization, OCR, timeline builder - unified evidence management with chain of custody')}</Text>
        </View>
      </Link>

      <SearchBar value={query} onChangeText={setQuery} placeholder={t('advocacy.search','Search advocacy tools...')} />

      {/* AI Tools - Hide most in Simple mode */}
      {isFeatureVisible('standard') && (
        <>
          <Text style={s.sectionHeader}>{t('advocacy.sections.ai','AI Tools')}</Text>
          {FEATURES.filter(f => {
            if (f.key === 'ai_assistant') return unifiedAIEnabled;
            if (f.key === 'evidence_manager') return evidenceManagerEnabled;
            return ['ai_translator','ai_case','ai_gov','policy_simple'].includes(f.key);
          }).map(f => {
            const base = t(featureKeyMap[f.key]);
            const titleText = BETA.includes(f.key)
              ? `${base} (Beta)`
              : COMING_SOON.includes(f.key)
              ? `${base} (Coming soon)`
              : `${base}\u200B`;
            return matches(f.route) ? (
              <Link key={f.route} href={f.route as any} asChild={true}>
                <View style={s.card} accessibilityRole="button">
                  <Text style={s.cardTitle}>{titleText}</Text>
                </View>
              </Link>
            ) : null;
          })}
        </>
      )}

      {/* Simple mode: Show only AI Translator */}
      {isFeatureVisible('simple') && (
        <>
          <Text style={s.sectionHeader}>{t('advocacy.sections.ai','AI Tools')}</Text>
          <Link href="/(tabs)/advocacy/ai-advocate-translator" asChild={true}>
            <View style={s.card} accessibilityRole="button">
              <Text style={s.cardTitle}>{t('advocacy.tools.ai_translator')} (Beta)</Text>
            </View>
          </Link>
        </>
      )}

      <Text style={s.sectionHeader}>{t('advocacy.sections.coaching','Coaching')}</Text>
      {FEATURES.filter(f => ['self_coach', 'negotiation_coach'].includes(f.key)).map(f => {
        const base = t(featureKeyMap[f.key]);
        const titleText = BETA.includes(f.key)
          ? `${base} (Beta)`
          : COMING_SOON.includes(f.key)
          ? `${base} (Coming soon)`
          : `${base}\u200B`;
        return matches(f.route) ? (
          <Link key={f.route} href={f.route as any} asChild={true}>
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
          <Link key={f.route} href={f.route as any} asChild={true}>
            <View style={s.card} accessibilityRole="button">
              <Text style={s.cardTitle}>{titleText}</Text>
            </View>
          </Link>
        ) : null;
      })}

      <Text style={s.sectionHeader}>{t('advocacy.sections.collective','Collective & Accountability')}</Text>
      {FEATURES.filter(f => {
        if (f.key === 'accountability_hub') return accountabilityHubEnabled;
        return ['collective','accountability','accountability_cases'].includes(f.key);
      }).map(f => {
        const base = t(featureKeyMap[f.key]);
        const titleText = BETA.includes(f.key)
          ? `${base} (Beta)`
          : COMING_SOON.includes(f.key)
          ? `${base} (Coming soon)`
          : `${base}\u200B`;
        return matches(f.route) ? (
          <Link key={f.route} href={f.route as any} asChild={true}>
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
    sectionHeader: { color: palette.text, opacity:0.9, marginTop: 16, marginBottom: 8, fontWeight: '700', fontSize: 18 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 10, padding: 14, backgroundColor: palette.surface, marginBottom: 12 },
    featuredCard: { borderWidth: 2, borderColor: palette.primary, backgroundColor: palette.primary + '08' },
    cardTitle: { color: palette.text, fontWeight:'700', marginBottom: 4, fontSize: 16 },
    comingSoon: { color: palette.text, opacity: 0.7 },
    padZWS: { color: 'transparent' },
    cardDesc: { color: palette.text, opacity:0.85, fontSize: 13, lineHeight: 20, marginTop: 4 },
  });
}
