import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { JurisdictionPanel } from '../../../components/JurisdictionPanel';
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
} as const;

const FEATURES: Feature[] = [
  { route: '/(tabs)/advocacy/ai-advocate-translator', key: 'ai_translator' },
  { route: '/(tabs)/advocacy/ai-case-interpreter', key: 'ai_case' },
  { route: '/(tabs)/advocacy/ai-gov-navigator', key: 'ai_gov' },
  { route: '/(tabs)/advocacy/ally-hub', key: 'ally_hub' },
  { route: '/(tabs)/advocacy/collective-legal', key: 'collective' },
  { route: '/(tabs)/advocacy/lawyer-finder', key: 'finder' },
  { route: '/(tabs)/advocacy/policy-simple', key: 'policy_simple' },
  { route: '/(tabs)/advocacy/ratings', key: 'ratings' },
  { route: '/(tabs)/advocacy/self-advocacy-coach', key: 'self_coach' },
];

export default function AdvocacyHub() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Advocacy Hub');
  useFocusOnRefOnMount(titleRef);
  const { t } = useTranslation();
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Advocacy Hub</Text>
  <Text style={s.subtitle}>Unified access to AI tools, directories, coaching, ratings, ally resources, and collective action features. Choose a tool below.</Text>
  <JurisdictionPanel />
      {FEATURES.map(f => {
        const title = t(featureKeyMap[f.key]);
        return (
          <Link key={f.route} href={f.route as any} asChild>
            <View style={s.card} accessibilityRole="button" accessibilityLabel={title}> 
              <Text style={s.cardTitle}>{title}</Text>
            </View>
          </Link>
        );
      })}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background },
    title: { fontSize:24, fontWeight:'700', color: palette.text, marginBottom: 8 },
    subtitle: { color: palette.text, opacity:0.9, marginBottom: 16 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 10, padding: 14, backgroundColor: palette.surface, marginBottom: 12 },
    cardTitle: { color: palette.text, fontWeight:'700', marginBottom: 4 },
    cardDesc: { color: palette.text, opacity:0.85, fontSize: 13 },
  });
}
