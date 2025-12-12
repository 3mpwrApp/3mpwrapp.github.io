import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import ComplexityModeIndicator from '../../../components/ComplexityModeIndicator';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { GapView } from '../../../components/GapView';
import JurisdictionDeadlineCalculator from '../../../components/JurisdictionDeadlineCalculator';
import JurisdictionFormHelper from '../../../components/JurisdictionFormHelper';
import { JurisdictionPanel } from '../../../components/JurisdictionPanel';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import SearchBar from '../../../components/SearchBar';
import SimpleModeWelcome from '../../../components/SimpleModeWelcome';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useComplexityMode } from '../../../store/complexityMode';
import { useAppPalette } from '../../../theme/usePalette';

// Consolidated hub structure - 4 main categories
interface FeatureHub {
  id: string;
  icon: string;
  route: string;
  titleKey: string;
  descKey: string;
  badge?: 'new' | 'beta' | 'coming';
  complexity: 'simple' | 'standard' | 'power_user';
}

// Featured consolidated hubs
const MAIN_HUBS: FeatureHub[] = [
  {
    id: 'ai-hub',
    icon: '🤖',
    route: '/(tabs)/advocacy/ai-command-center',
    titleKey: 'advocacy.hubs.ai.title',
    descKey: 'advocacy.hubs.ai.desc',
    badge: 'new',
    complexity: 'simple',
  },
  {
    id: 'network-hub',
    icon: '🤝',
    route: '/(tabs)/advocacy/lawyer-finder',
    titleKey: 'advocacy.hubs.network.title',
    descKey: 'advocacy.hubs.network.desc',
    badge: 'beta',
    complexity: 'simple',
  },
  {
    id: 'accountability-hub',
    icon: '⚖️',
    route: '/(tabs)/advocacy/accountability-hub',
    titleKey: 'advocacy.hubs.accountability.title',
    descKey: 'advocacy.hubs.accountability.desc',
    badge: 'beta',
    complexity: 'standard',
  },
  {
    id: 'evidence-hub',
    icon: '📁',
    route: '/(tabs)/advocacy/evidence-manager',
    titleKey: 'advocacy.hubs.evidence.title',
    descKey: 'advocacy.hubs.evidence.desc',
    badge: 'beta',
    complexity: 'standard',
  },
];

// Quick access tools for power users
const QUICK_TOOLS: FeatureHub[] = [
  {
    id: 'self-coach',
    icon: '🎯',
    route: '/(tabs)/advocacy/self-advocacy-coach',
    titleKey: 'advocacy.tools.self_coach',
    descKey: 'advocacy.tools.self_coach_desc',
    complexity: 'standard',
  },
  {
    id: 'ratings',
    icon: '⭐',
    route: '/(tabs)/advocacy/ratings',
    titleKey: 'advocacy.tools.ratings',
    descKey: 'advocacy.tools.ratings_desc',
    badge: 'beta',
    complexity: 'standard',
  },
  {
    id: 'ally-hub',
    icon: '💪',
    route: '/(tabs)/advocacy/ally-hub',
    titleKey: 'advocacy.tools.ally_hub',
    descKey: 'advocacy.tools.ally_hub_desc',
    badge: 'coming',
    complexity: 'power_user',
  },
  {
    id: 'collective',
    icon: '✊',
    route: '/(tabs)/advocacy/collective-legal',
    titleKey: 'advocacy.tools.collective',
    descKey: 'advocacy.tools.collective_desc',
    badge: 'coming',
    complexity: 'power_user',
  },
];

export default function AdvocacyHub() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  const router = useRouter();
  const { mode, isFeatureVisible } = useComplexityMode();
  
  useAnnounceOnMount(t('advocacy.hub.title', 'Advocacy Hub'));
  useFocusOnRefOnMount(titleRef);
  
  const [query, setQuery] = React.useState('');

  // Filter hubs based on complexity mode
  const visibleHubs = MAIN_HUBS.filter(hub => {
    if (mode === 'simple') return hub.complexity === 'simple';
    if (mode === 'standard') return hub.complexity !== 'power_user';
    return true;
  });

  const visibleTools = QUICK_TOOLS.filter(tool => {
    if (mode === 'simple') return false; // Hide all quick tools in simple mode
    if (mode === 'standard') return tool.complexity !== 'power_user';
    return true;
  });

  // Search filter
  const matchesSearch = (titleKey: string) => {
    if (!query.trim()) return true;
    const title = t(titleKey, '').toLowerCase();
    return title.includes(query.toLowerCase());
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'new': return { bg: palette.success + '20', text: palette.success, label: 'NEW' };
      case 'beta': return { bg: palette.warning + '20', text: palette.warning, label: 'BETA' };
      case 'coming': return { bg: palette.muted + '40', text: palette.text, label: 'SOON' };
      default: return null;
    }
  };

  const renderHubCard = (hub: FeatureHub, featured = false) => {
    if (!matchesSearch(hub.titleKey)) return null;
    const badge = getBadgeStyle(hub.badge);
    
    return (
      <A11yPressable
        key={hub.id}
        style={[s.card, featured && s.featuredCard]}
        accessibilityRole="button"
        accessibilityLabel={`${t(hub.titleKey)}. ${t(hub.descKey)}`}
        hitSlop={HIT_SLOP_8}
        onPress={() => router.push(hub.route as any)}
      >
        <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={12}>
          <Text style={s.hubIcon}>{hub.icon}</Text>
          <View style={{ flex: 1 }}>
            <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
              <Text style={s.cardTitle}>{t(hub.titleKey)}</Text>
              {badge && (
                <View style={[s.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[s.badgeText, { color: badge.text }]}>{badge.label}</Text>
                </View>
              )}
            </GapView>
            <Text style={s.cardDesc} numberOfLines={2}>{t(hub.descKey)}</Text>
          </View>
          <Text style={{ color: palette.primary, fontSize: 20 }}>→</Text>
        </GapView>
      </A11yPressable>
    );
  };

  return (
    <ResponsiveScreenWrapper testID="advocacy-screen">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text ref={titleRef} accessibilityRole="header" style={[s.title, { flex: 1 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('advocacy.hub.title', 'Advocacy Hub')}
        </Text>
        <ComplexityModeIndicator variant="badge" />
      </View>
      <Text style={s.subtitle}>
        {t('advocacy.hub.subtitle', 'AI-powered tools to help you navigate legal documents, find advocates, and build your case.')}
      </Text>

      <DisclaimerBanner type="legal" compact={true} />

      {/* Jurisdiction Tools */}
      <JurisdictionPanel />
      {isFeatureVisible('standard') && (
        <>
          <JurisdictionDeadlineCalculator />
          <JurisdictionFormHelper />
        </>
      )}

      {/* Simple Mode Welcome */}
      <SimpleModeWelcome 
        tabName="Advocacy"
        availableFeatures={['AI Command Center', 'Find Advocates']}
        hiddenCount={QUICK_TOOLS.length + (MAIN_HUBS.length - visibleHubs.length)}
      />

      {/* Search */}
      <SearchBar 
        value={query} 
        onChangeText={setQuery} 
        placeholder={t('advocacy.search', 'Search advocacy tools...')} 
      />

      {/* Power Tools Section */}
      <Text style={s.sectionHeader}>
        {t('advocacy.sections.powerTools', '🔧 Power Tools')}
      </Text>
      <GapView gap={12}>
        {/* AI Advocacy Suite */}
        {matchesSearch('AI Advocacy Suite') && (
          <A11yPressable
            style={[s.card, s.featuredCard, { borderColor: palette.primary, borderWidth: 2 }]}
            accessibilityRole="button"
            accessibilityLabel="AI Advocacy Suite. AI-powered advocacy and legal interpretation tools."
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/advocacy/ai-advocacy-suite' as any)}
          >
            <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={12}>
              <Text style={s.hubIcon}>🤖</Text>
              <View style={{ flex: 1 }}>
                <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
                  <Text style={s.cardTitle}>AI Advocacy Suite</Text>
                  <View style={[s.badge, { backgroundColor: palette.primary + '20' }]}>
                    <Text style={[s.badgeText, { color: palette.primary }]}>POWER TOOL</Text>
                  </View>
                </GapView>
                <Text style={s.cardDesc} numberOfLines={2}>5 tabs: Translator, Interpreter, Assistant, Analyzer, Predictor</Text>
              </View>
              <Text style={{ color: palette.primary, fontSize: 20 }}>→</Text>
            </GapView>
          </A11yPressable>
        )}
        {/* Evidence Command Center */}
        {isFeatureVisible('standard') && matchesSearch('Evidence Command Center') && (
          <A11yPressable
            style={s.card}
            accessibilityRole="button"
            accessibilityLabel="Evidence Command Center. Secure evidence collection and management."
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/advocacy/evidence-command-center' as any)}
          >
            <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={12}>
              <Text style={s.hubIcon}>📁</Text>
              <View style={{ flex: 1 }}>
                <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
                  <Text style={s.cardTitle}>Evidence Command Center</Text>
                  <View style={[s.badge, { backgroundColor: palette.primary + '20' }]}>
                    <Text style={[s.badgeText, { color: palette.primary }]}>POWER TOOL</Text>
                  </View>
                </GapView>
                <Text style={s.cardDesc} numberOfLines={2}>4 tabs: Locker, Timeline, Voice, Checklist</Text>
              </View>
              <Text style={{ color: palette.primary, fontSize: 20 }}>→</Text>
            </GapView>
          </A11yPressable>
        )}
        {/* Legal Action Hub */}
        {isFeatureVisible('standard') && matchesSearch('Legal Action Hub') && (
          <A11yPressable
            style={s.card}
            accessibilityRole="button"
            accessibilityLabel="Legal Action Hub. Legal tools and accountability tracking."
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/advocacy/legal-action-hub' as any)}
          >
            <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={12}>
              <Text style={s.hubIcon}>⚖️</Text>
              <View style={{ flex: 1 }}>
                <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
                  <Text style={s.cardTitle}>Legal Action Hub</Text>
                  <View style={[s.badge, { backgroundColor: palette.primary + '20' }]}>
                    <Text style={[s.badgeText, { color: palette.primary }]}>POWER TOOL</Text>
                  </View>
                </GapView>
                <Text style={s.cardDesc} numberOfLines={2}>4 tabs: Accountability, Legal, Automation, Policy</Text>
              </View>
              <Text style={{ color: palette.primary, fontSize: 20 }}>→</Text>
            </GapView>
          </A11yPressable>
        )}
        {/* Ally & Support Network */}
        {isFeatureVisible('standard') && matchesSearch('Ally Support Network') && (
          <A11yPressable
            style={s.card}
            accessibilityRole="button"
            accessibilityLabel="Ally and Support Network. Build and manage your support network."
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push('/(tabs)/advocacy/ally-support-network' as any)}
          >
            <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={12}>
              <Text style={s.hubIcon}>🤝</Text>
              <View style={{ flex: 1 }}>
                <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
                  <Text style={s.cardTitle}>Ally & Support Network</Text>
                  <View style={[s.badge, { backgroundColor: palette.primary + '20' }]}>
                    <Text style={[s.badgeText, { color: palette.primary }]}>POWER TOOL</Text>
                  </View>
                </GapView>
                <Text style={s.cardDesc} numberOfLines={2}>5 tabs: Directory, Allies, Self-Coach, Ratings, World</Text>
              </View>
              <Text style={{ color: palette.primary, fontSize: 20 }}>→</Text>
            </GapView>
          </A11yPressable>
        )}
      </GapView>

      {/* Main Hubs */}
      <Text style={s.sectionHeader}>
        {t('advocacy.sections.mainHubs', '✨ Main Hubs')}
      </Text>
      <GapView gap={12}>
        {visibleHubs.map(hub => renderHubCard(hub, true))}
      </GapView>

      {/* Quick Tools - Hidden in Simple mode */}
      {visibleTools.length > 0 && (
        <>
          <Text style={s.sectionHeader}>
            {t('advocacy.sections.quickTools', '🛠️ Quick Tools')}
          </Text>
          <GapView gap={10}>
            {visibleTools.map(tool => renderHubCard(tool, false))}
          </GapView>
        </>
      )}

      {/* Power Users: Direct AI Tool Access */}
      {isFeatureVisible('power_user') && (
        <>
          <Text style={s.sectionHeader}>
            {t('advocacy.sections.directAccess', '⚡ Direct AI Access')}
          </Text>
          <Text style={s.helpText}>
            {t('advocacy.directAccess.help', 'Power users can access individual AI tools directly. These are also available in the AI Command Center.')}
          </Text>
          <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
            {[
              { id: 'translator', icon: '📝', route: '/(tabs)/advocacy/ai-advocate-translator', label: 'Translator' },
              { id: 'interpreter', icon: '📋', route: '/(tabs)/advocacy/ai-case-interpreter', label: 'Interpreter' },
              { id: 'navigator', icon: '🧭', route: '/(tabs)/advocacy/ai-gov-navigator', label: 'Gov Navigator' },
              { id: 'policy', icon: '📜', route: '/(tabs)/advocacy/policy-simple', label: 'Policy' },
            ].map(tool => (
              <A11yPressable
                key={tool.id}
                style={s.chipButton}
                accessibilityRole="button"
                accessibilityLabel={tool.label}
                hitSlop={HIT_SLOP_8}
                onPress={() => router.push(tool.route as any)}
              >
                <Text style={s.chipText}>{tool.icon} {tool.label}</Text>
              </A11yPressable>
            ))}
          </GapView>
        </>
      )}
    </ResponsiveScreenWrapper>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    title: { 
      fontSize: 24, 
      fontWeight: '700', 
      color: palette.text, 
      marginBottom: 8 
    },
    subtitle: { 
      color: palette.text, 
      opacity: 0.9, 
      marginBottom: 16,
      lineHeight: 22,
    },
    sectionHeader: { 
      color: palette.text, 
      marginTop: 20, 
      marginBottom: 12, 
      fontWeight: '700', 
      fontSize: 18 
    },
    card: { 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      borderRadius: 12, 
      padding: 16, 
      backgroundColor: palette.surface,
    },
    featuredCard: { 
      borderWidth: 2, 
      borderColor: palette.primary, 
      backgroundColor: palette.primary + '08' 
    },
    hubIcon: {
      fontSize: 32,
    },
    cardTitle: { 
      color: palette.text, 
      fontWeight: '700', 
      fontSize: 16 
    },
    cardDesc: { 
      color: palette.textSecondary, 
      fontSize: 13, 
      lineHeight: 18,
      marginTop: 2,
    },
    badge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    helpText: {
      color: palette.textSecondary,
      fontSize: 12,
      marginBottom: 12,
      fontStyle: 'italic',
    },
    chipButton: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    chipText: {
      color: palette.text,
      fontSize: 13,
    },
  });
}
