/**
 * Home Screen - Evidence-First Design
 * 
 * Features:
 * - Document What Happened hero section
 * - Evidence Timeline Widget
 * - Next Best Action recommendations
 * - Quick actions
 * - Complexity Mode support
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import ComplexityModeIndicator from '../../components/ComplexityModeIndicator';
import DisclaimerBanner from '../../components/DisclaimerBanner';
import { type EvidenceEntry } from '../../components/EvidenceTimeline';
import GapView from '../../components/GapView';
import ResponsiveScreenWrapper from '../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../store/auth';
import { useComplexityMode } from '../../store/complexityMode';
import { useTextScale } from '../../theme/typography';
import { createTextStyles } from '../../theme/typography.enhanced';
import { useAppPalette } from '../../theme/usePalette';
import { createShadow } from '../../utils/shadow';

export default function HomeScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const router = useRouter();
  const { user: _user, isGuest: _isGuest } = useAuth();
  const { mode: _mode, isFeatureVisible } = useComplexityMode();
  const textStyles = createTextStyles(palette, factor);
  const styles = createStyles(palette, factor);
  
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [_recentEvidence, setRecentEvidence] = useState<EvidenceEntry[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvidenceData();
  }, []);

  const loadEvidenceData = async () => {
    try {
      // TODO: Load actual evidence from storage/firestore
      setIsLoading(false);
      // Mock data for now
      setEvidenceCount(0);
      setRecentEvidence([]);
    } catch (error) {
      console.error('Failed to load evidence:', error);
      setIsLoading(false);
    }
  };

  const _handleHeroPress = () => {
    router.push('/(tabs)/advocacy/evidence-command-center' as any);
  };

  const _handleViewAll = () => {
    router.push('/(tabs)/advocacy/evidence-command-center' as any);
  };

  const getNextBestAction = () => {
    if (evidenceCount === 0) {
      return {
        title: t('home.nextAction.start', 'Start with Quick Evidence Capture'),
        description: t('home.nextAction.startDesc', 'Document what happened in 30 seconds'),
        icon: '📝' as const,
        action: () => router.push('/(tabs)/advocacy/evidence-command-center' as any),
      };
    }
    if (evidenceCount <= 2) {
      return {
        title: t('home.nextAction.build', 'Add 2-3 More Evidence Notes'),
        description: t('home.nextAction.buildDesc', 'Strengthen your case with more documentation'),
        icon: '📋' as const,
        action: () => router.push('/(tabs)/advocacy/evidence-command-center' as any),
      };
    }
    return {
      title: t('home.nextAction.generate', 'Generate Your First Letter'),
        description: t('home.nextAction.generateDesc', 'Turn your evidence into action'),
      icon: '✉️' as const,
      action: () => router.push('/(tabs)/resources/letter-factory' as any),
    };
  };

  const _nextAction = getNextBestAction();

  return (
    <ResponsiveScreenWrapper>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[textStyles.h1, styles.title]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('home.title', '3mpwr')}
          </Text>
          <GapView gap={8} style={{ flexDirection: 'row', marginLeft: 'auto' }}>
            <ComplexityModeIndicator variant="minimal" />
          </GapView>
        </View>

        <Text style={[textStyles.body, styles.subtitle]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('home.subtitle', 'Evidence, Wellness & Community')}
        </Text>

        <DisclaimerBanner type="legal" compact={true} />

        <GapView gap={16} style={{ marginTop: 20 }}>
          {/* Hero Card 1: Evidence Vault */}
          <A11yPressable
            onPress={() => router.push('/(tabs)/advocacy/evidence-command-center' as any)}
            accessibilityRole="button"
            accessibilityLabel="Evidence Vault - Build your disability case"
            hitSlop={HIT_SLOP_8}
            style={[styles.heroCard, { backgroundColor: palette.primary, borderColor: palette.primary }]}
          >
            <View style={styles.heroCardContent}>
              <Text style={styles.heroCardIcon}>📸</Text>
              <View style={styles.heroCardText}>
                <Text style={[styles.heroCardTitle, { color: palette.onPrimary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  Evidence Vault
                </Text>
                <Text style={[styles.heroCardSubtitle, { color: palette.onPrimary, opacity: 0.9 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  Build your disability case
                </Text>
                <View style={[styles.heroCardBadge, { backgroundColor: palette.onPrimary + '20' }]}>
                  <Text style={[styles.heroCardBadgeText, { color: palette.onPrimary }]}>
                    {evidenceCount} items this week
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={28} color={palette.onPrimary} />
            </View>
          </A11yPressable>

          {/* Hero Card 2: Wellness Command */}
          <A11yPressable
            onPress={() => router.push('/(tabs)/wellness/command-center' as any)}
            accessibilityRole="button"
            accessibilityLabel="Wellness Command - Track health and manage energy"
            hitSlop={HIT_SLOP_8}
            style={[styles.heroCard, { backgroundColor: palette.success, borderColor: palette.success }]}
          >
            <View style={styles.heroCardContent}>
              <Text style={styles.heroCardIcon}>⚡</Text>
              <View style={styles.heroCardText}>
                <Text style={[styles.heroCardTitle, { color: '#fff' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  Wellness Command
                </Text>
                <Text style={[styles.heroCardSubtitle, { color: '#fff', opacity: 0.9 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  Track health & manage energy
                </Text>
                <View style={[styles.heroCardBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={[styles.heroCardBadgeText, { color: '#fff' }]}>
                    Energy, mood, symptoms, more
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={28} color="#fff" />
            </View>
          </A11yPressable>

          {/* Hero Card 3: Community Hub */}
          <A11yPressable
            onPress={() => router.push('/(tabs)/community/index' as any)}
            accessibilityRole="button"
            accessibilityLabel="Community Hub - Connect with disability advocates"
            hitSlop={HIT_SLOP_8}
            style={[styles.heroCard, { backgroundColor: palette.info, borderColor: palette.info }]}
          >
            <View style={styles.heroCardContent}>
              <Text style={styles.heroCardIcon}>💬</Text>
              <View style={styles.heroCardText}>
                <Text style={[styles.heroCardTitle, { color: '#fff' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  Community Hub
                </Text>
                <Text style={[styles.heroCardSubtitle, { color: '#fff', opacity: 0.9 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  Connect with allies & advocates
                </Text>
                <View style={[styles.heroCardBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={[styles.heroCardBadgeText, { color: '#fff' }]}>
                    Peer support, campaigns, events
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={28} color="#fff" />
            </View>
          </A11yPressable>

          {/* Quick Actions (Standard Mode) */}
          {isFeatureVisible('standard') && (
            <View style={styles.card}>
              <Text style={[textStyles.h3, { marginBottom: 12 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Quick Access
              </Text>
              <GapView gap={8}>
                <A11yPressable
                  onPress={() => router.push('/(tabs)/resources/index' as any)}
                  accessibilityRole="button"
                  hitSlop={HIT_SLOP_8}
                  style={styles.quickAction}
                >
                  <Text style={styles.quickActionIcon}>📚</Text>
                  <Text style={styles.quickActionText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    Resources & Guides
                  </Text>
                </A11yPressable>

                <A11yPressable
                  onPress={() => router.push('/(tabs)/campaigns' as any)}
                  accessibilityRole="button"
                  hitSlop={HIT_SLOP_8}
                  style={styles.quickAction}
                >
                  <Text style={styles.quickActionIcon}>🎯</Text>
                  <Text style={styles.quickActionText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    Active Campaigns
                  </Text>
                </A11yPressable>

                <A11yPressable
                  onPress={() => router.push('/(tabs)/wellness/index' as any)}
                  accessibilityRole="button"
                  hitSlop={HIT_SLOP_8}
                  style={styles.quickAction}
                >
                  <Text style={styles.quickActionIcon}>🧘</Text>
                  <Text style={styles.quickActionText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {t('home.actions.wellness', 'Wellness Tools')}
                  </Text>
                </A11yPressable>
              </GapView>
            </View>
          )}

          <DisclaimerBanner type="legal" compact />
        </GapView>
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 8,
    },
    title: {
      fontSize: Math.round(28 * factor),
      fontWeight: '700',
      color: palette.text,
    },
    subtitle: {
      fontSize: Math.round(16 * factor),
      color: palette.textSecondary,
      marginBottom: 24,
    },
    heroCard: {
      borderRadius: 16,
      padding: 20,
      borderWidth: 2,
      ...createShadow({
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      }),
    },
    heroCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    heroCardIcon: {
      fontSize: 48,
    },
    heroCardText: {
      flex: 1,
    },
    heroCardTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    heroCardSubtitle: {
      fontSize: 14,
      marginBottom: 8,
    },
    heroCardBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    heroCardBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    card: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: palette.border,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      backgroundColor: palette.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.border,
    },
    actionIcon: {
      fontSize: 32,
    },
    actionText: {
      flex: 1,
    },
    actionTitle: {
      fontSize: Math.round(16 * factor),
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    actionDescription: {
      fontSize: Math.round(14 * factor),
      color: palette.textSecondary,
    },
    quickAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      backgroundColor: palette.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.border,
    },
    quickActionIcon: {
      fontSize: 24,
    },
    quickActionText: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      flex: 1,
    },
  });
}
