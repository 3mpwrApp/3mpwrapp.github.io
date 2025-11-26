import { Link } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../i18n';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';
import { createShadow } from '../utils/shadow';

import A11yPressable from './A11yPressable';

interface RevolutionaryFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  href: string;
  beta?: boolean;
}

const REVOLUTIONARY_FEATURES: RevolutionaryFeature[] = [
  {
    id: 'spoon-economist',
    icon: '🥄',
    title: 'Spoon Economist',
    description: 'AI-powered energy budget tracking with predictive analytics',
    href: '/(tabs)/wellness/spoon-economist',
    beta: true,
  },
  {
    id: 'legal-dna',
    icon: '🧬',
    title: 'Legal DNA Sequencer',
    description: 'Decode complex legal documents into plain language',
    href: '/(tabs)/advocacy/legal-dna',
    beta: true,
  },
  {
    id: 'energy-aware-ui',
    icon: '⚡',
    title: 'Energy-Aware UI',
    description: 'Interface adapts to your energy levels automatically',
    href: '/(tabs)/wellness/energy-aware-ui',
    beta: true,
  },
  {
    id: 'cognitive-distortion',
    icon: '🧠',
    title: 'Cognitive Distortion Scanner',
    description: 'Real-time thought pattern analysis and reframing',
    href: '/(tabs)/wellness/cognitive-distortion-scanner',
    beta: true,
  },
  {
    id: 'energy-quantum',
    icon: '🌊',
    title: 'Energy Quantum Mechanics',
    description: 'Visualize energy flow with wave-particle tracking',
    href: '/(tabs)/wellness/energy-quantum',
    beta: true,
  },
  {
    id: 'symptom-symphony',
    icon: '🎵',
    title: 'Symptom Symphony',
    description: 'Multi-modal symptom tracking with AI pattern detection',
    href: '/(tabs)/wellness/symptom-symphony',
    beta: true,
  },
];

export const RevolutionaryFeaturesSpotlight = React.memo(() => {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = React.useMemo(() => createStyles(palette, factor), [palette, factor]);

  const [dismissed, setDismissed] = React.useState(false);
  const [error, setError] = React.useState(false);

  // Catch any rendering errors
  React.useEffect(() => {
    const handleError = () => setError(true);
    if (typeof window !== 'undefined' && Platform.OS === 'web') {
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, []);

  if (dismissed || error) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            ✨ {t('revolutionaryFeatures.spotlight.title', 'Revolutionary Features')}
          </Text>
          <Text style={styles.subtitle}>
            {t('revolutionaryFeatures.spotlight.subtitle', 'Discover cutting-edge AI tools designed for disability advocacy')}
          </Text>
        </View>
        <A11yPressable
          onPress={() => setDismissed(true)}
          style={styles.dismissButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss spotlight"
        >
          <Text style={styles.dismissText}>✕</Text>
        </A11yPressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {REVOLUTIONARY_FEATURES.map((feature) => (
          <Link key={feature.id} href={feature.href as any} asChild>
            <A11yPressable
              style={styles.featureCard}
              accessibilityRole="button"
              accessibilityLabel={`${feature.title}. ${feature.description}`}
            >
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={[styles.featureContent, { marginLeft: 12 }]}>
                <View style={styles.featureTitleRow}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  {feature.beta && (
                    <View style={[styles.betaBadge, { marginLeft: 6 }]}>
                      <Text style={styles.betaText}>BETA</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.featureDescription} numberOfLines={2}>
                  {feature.description}
                </Text>
              </View>
            </A11yPressable>
          </Link>
        ))}
      </ScrollView>

      <Link href="/(tabs)/wellness/revolutionary-features" asChild>
        <A11yPressable
          style={styles.viewAllButton}
          accessibilityRole="button"
          accessibilityLabel="View all revolutionary features"
        >
          <Text style={styles.viewAllText}>
            {t('revolutionaryFeatures.spotlight.viewAll', 'View All Features')} →
          </Text>
        </A11yPressable>
      </Link>
    </View>
  );
});

RevolutionaryFeaturesSpotlight.displayName = 'RevolutionaryFeaturesSpotlight';

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: palette.primaryMuted || palette.muted,
      ...createShadow({
        shadowColor: palette.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    title: {
      fontSize: Math.round(20 * factor),
      fontWeight: '700',
      color: palette.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.8,
      lineHeight: Math.round(20 * factor),
    },
    dismissButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    dismissText: {
      fontSize: Math.round(18 * factor),
      color: palette.text,
      opacity: 0.6,
    },
    scrollContent: {
      paddingRight: 16,
    },
    featureCard: {
      width: 260,
      backgroundColor: palette.surface,
      borderRadius: 10,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      flexDirection: 'row',
      marginRight: 12,
    },
    featureIcon: {
      fontSize: Math.round(32 * factor),
      lineHeight: Math.round(38 * factor),
    },
    featureContent: {
      flex: 1,
    },
    featureTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    featureTitle: {
      fontSize: Math.round(15 * factor),
      fontWeight: '600',
      color: palette.text,
      flex: 1,
    },
    betaBadge: {
      backgroundColor: palette.primaryBackground || palette.surface,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    betaText: {
      fontSize: Math.round(9 * factor),
      fontWeight: '700',
      color: palette.primary,
      letterSpacing: 0.5,
    },
    featureDescription: {
      fontSize: Math.round(13 * factor),
      color: palette.text,
      opacity: 0.7,
      lineHeight: Math.round(18 * factor),
    },
    viewAllButton: {
      marginTop: 12,
      paddingVertical: 10,
      backgroundColor: palette.primaryBackground || palette.surface,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.primaryMuted || palette.muted,
    },
    viewAllText: {
      fontSize: Math.round(14 * factor),
      fontWeight: '600',
      color: palette.primary,
    },
  });
}
