/**
 * Collective Evidence Dashboard
 *
 * Shows aggregated insights from anonymized evidence contributions
 * Privacy-first: 50-user threshold, PII removed, easy opt-out
 *
 * NETWORK EFFECTS:
 * More users → Better patterns → Stronger advocacy
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import {
  getCollectiveInsights,
  getUserContributionStats,
  optOut,
  type CollectiveInsights,
  type DetectedPattern,
} from '../../../services/collectiveEvidence';
import { useTextScale } from '../../../theme/typography';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

export default function CollectiveEvidenceScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette);

  const [insights, setInsights] = useState<CollectiveInsights | null>(null);
  const [userStats, setUserStats] = useState<{ optedIn: boolean; contributionCount: number; lastContribution?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOptOutConfirm, setShowOptOutConfirm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [insightsData, statsData] = await Promise.all([
        getCollectiveInsights(true),
        getUserContributionStats(),
      ]);
      setInsights(insightsData);
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading collective evidence:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
  }, [loadData]);

  const handleOptOut = useCallback(async () => {
    try {
      await optOut();
      router.back();
    } catch (error) {
      console.error('Error opting out:', error);
    }
  }, [router]);

  const handlePatternPress = useCallback((_pattern: DetectedPattern) => {
    // Could navigate to detailed view or show modal
    // TODO: Implement pattern detail view
  }, []);

  const renderPattern = useCallback(
    (pattern: DetectedPattern) => {
      const getPatternIcon = (): string => {
        switch (pattern.type) {
          case 'denial_reason':
            return 'close-circle';
          case 'timeline_delay':
            return 'time';
          case 'missing_docs':
            return 'document-text';
          case 'insurance_pattern':
            return 'business';
          case 'condition_pattern':
            return 'fitness';
          case 'geographic_trend':
            return 'location';
          default:
            return 'analytics';
        }
      };

      const getPatternColor = (): string => {
        switch (pattern.type) {
          case 'denial_reason':
            return palette.error;
          case 'timeline_delay':
            return palette.warning;
          case 'missing_docs':
            return palette.info;
          default:
            return palette.primary;
        }
      };

      return (
        <A11yPressable
          key={pattern.id}
          onPress={() => handlePatternPress(pattern)}
          style={[styles.patternCard, { backgroundColor: palette.card }]}
          accessibilityLabel={`${pattern.title}. ${pattern.insight}. ${pattern.solidarityMessage}`}
          accessibilityHint={t('collective.pattern.tapHint', 'Double tap for more details')}
          hitSlop={HIT_SLOP_8}
        >
          {/* Pattern Icon */}
          <View style={[styles.patternIconContainer, { backgroundColor: getPatternColor() + '20' }]}>
            <Ionicons name={getPatternIcon() as any} size={24} color={getPatternColor()} />
          </View>

          {/* Pattern Content */}
          <View style={styles.patternContent}>
            <Text
              style={[styles.patternTitle, { fontSize: Math.round(16 * factor), color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {pattern.title}
            </Text>
            <Text
              style={[styles.patternInsight, { fontSize: Math.round(14 * factor), color: palette.textSecondary }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {pattern.insight}
            </Text>
            <Text
              style={[styles.patternStatistic, { fontSize: Math.round(18 * factor), color: getPatternColor() }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {pattern.statistic}
            </Text>
            <View style={[styles.solidarityBadge, { backgroundColor: palette.primary + '10' }]}>
              <Ionicons name="people" size={14} color={palette.primary} />
              <Text
                style={[styles.solidarityText, { fontSize: Math.round(12 * factor), color: palette.primary }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {pattern.solidarityMessage}
              </Text>
            </View>
            {pattern.actionLabel && (
              <Text
                style={[styles.actionText, { fontSize: Math.round(13 * factor), color: palette.primary }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {pattern.actionLabel} →
              </Text>
            )}
          </View>

          <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
        </A11yPressable>
      );
    },
    [palette, factor, t, handlePatternPress, styles]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { fontSize: Math.round(14 * factor), color: palette.textSecondary }]}>
            {t('collective.loading', 'Loading collective insights...')}
          </Text>
        </View>
      </View>
    );
  }

  const belowThreshold = insights === null || insights.patterns.length === 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={palette.primary}
          colors={[palette.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[styles.headerTitle, { fontSize: Math.round(24 * factor), color: palette.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t('collective.title', 'Collective Evidence')}
        </Text>
        <Text
          style={[styles.headerSubtitle, { fontSize: Math.round(14 * factor), color: palette.textSecondary }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t('collective.subtitle', 'Strength in numbers, patterns in solidarity')}
        </Text>
      </View>

      {/* Privacy Notice */}
      <View style={[styles.privacyNotice, { backgroundColor: palette.success + '10', borderLeftColor: palette.success }]}>
        <Ionicons name="shield-checkmark" size={20} color={palette.success} />
        <Text
          style={[styles.privacyText, { fontSize: Math.round(12 * factor), color: palette.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t(
            'collective.privacyNotice',
            'All data is anonymized. Names, dates & locations removed. Only shown when 50+ users contribute.'
          )}
        </Text>
      </View>

      {/* User Stats Card */}
      {userStats && (
        <View style={[styles.statsCard, { backgroundColor: palette.card }]}>
          <View style={styles.statsHeader}>
            <Text
              style={[styles.statsTitle, { fontSize: Math.round(16 * factor), color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.yourContributions', 'Your Contributions')}
            </Text>
          </View>
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text
                style={[styles.statValue, { fontSize: Math.round(32 * factor), color: palette.primary }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {userStats.contributionCount}
              </Text>
              <Text
                style={[styles.statLabel, { fontSize: Math.round(12 * factor), color: palette.textSecondary }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t('collective.evidenceShared', 'Evidence Shared')}
              </Text>
            </View>
            {userStats.lastContribution && (
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { fontSize: Math.round(14 * factor), color: palette.text }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {new Date(userStats.lastContribution).toLocaleDateString()}
                </Text>
                <Text
                  style={[styles.statLabel, { fontSize: Math.round(12 * factor), color: palette.textSecondary }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {t('collective.lastShared', 'Last Shared')}
                </Text>
              </View>
            )}
          </View>
          <A11yPressable
            onPress={() => setShowOptOutConfirm(true)}
            style={styles.optOutButton}
            accessibilityRole="button"
            accessibilityLabel={t('collective.optOut', 'Opt out of collective evidence')}
            hitSlop={HIT_SLOP_8}
          >
            <Text
              style={[styles.optOutText, { fontSize: Math.round(13 * factor), color: palette.error }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.optOut', 'Opt Out & Delete My Data')}
            </Text>
          </A11yPressable>
        </View>
      )}

      {/* Below Threshold Message */}
      {belowThreshold && (
        <View style={[styles.thresholdCard, { backgroundColor: palette.card }]}>
          <View style={[styles.thresholdIconContainer, { backgroundColor: palette.warning + '20' }]}>
            <Ionicons name="hourglass" size={32} color={palette.warning} />
          </View>
          <Text
            style={[styles.thresholdTitle, { fontSize: Math.round(18 * factor), color: palette.text }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t('collective.belowThreshold.title', 'Building Our Database')}
          </Text>
          <Text
            style={[styles.thresholdText, { fontSize: Math.round(14 * factor), color: palette.textSecondary }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t(
              'collective.belowThreshold.text',
              'We need at least 50 users to contribute before showing patterns. This protects everyone\'s privacy by preventing re-identification from small sample sizes.'
            )}
          </Text>
          <Text
            style={[styles.thresholdCta, { fontSize: Math.round(14 * factor), color: palette.primary }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t('collective.belowThreshold.cta', 'Share 3MPWR with others to unlock collective insights faster!')} 💪
          </Text>
        </View>
      )}

      {/* Patterns Section */}
      {!belowThreshold && insights && (
        <GapView gap={16} style={styles.patternsSection}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { fontSize: Math.round(20 * factor), color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.patterns.title', 'Detected Patterns')}
            </Text>
            <Text
              style={[styles.sectionSubtitle, { fontSize: Math.round(13 * factor), color: palette.textSecondary }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.patterns.subtitle', 'Based on {{count}} contributions', {
                count: insights.totalContributions,
              })}
            </Text>
          </View>

          {insights.patterns.map(renderPattern)}

          {insights.patterns.length === 0 && (
            <Text
              style={[styles.noPatterns, { fontSize: Math.round(14 * factor), color: palette.textSecondary }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.patterns.none', 'No clear patterns detected yet. Keep contributing!')}
            </Text>
          )}
        </GapView>
      )}

      {/* Opt-Out Confirmation Modal */}
      {showOptOutConfirm && (
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModal, { backgroundColor: palette.card }]}>
            <Text
              style={[styles.confirmTitle, { fontSize: Math.round(18 * factor), color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.optOutConfirm.title', 'Opt Out of Collective Evidence?')}
            </Text>
            <Text
              style={[styles.confirmText, { fontSize: Math.round(14 * factor), color: palette.textSecondary }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t(
                'collective.optOutConfirm.text',
                'Your contributions will be immediately deleted from the collective pool. Your private evidence notes will remain safe on your device. You can opt back in anytime.'
              )}
            </Text>
            <GapView gap={12} style={styles.confirmActions}>
              <A11yPressable
                onPress={handleOptOut}
                style={[styles.confirmButton, { backgroundColor: palette.error }]}
                accessibilityRole="button"
                accessibilityLabel={t('collective.optOutConfirm.confirm', 'Confirm opt out')}
                hitSlop={HIT_SLOP_8}
              >
                <Text
                  style={[styles.confirmButtonText, { fontSize: Math.round(14 * factor), color: palette.onPrimary }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {t('collective.optOutConfirm.confirm', 'Yes, Opt Out')}
                </Text>
              </A11yPressable>
              <A11yPressable
                onPress={() => setShowOptOutConfirm(false)}
                style={[styles.cancelButton, { borderColor: palette.muted }]}
                accessibilityRole="button"
                accessibilityLabel={t('collective.optOutConfirm.cancel', 'Cancel')}
                hitSlop={HIT_SLOP_8}
              >
                <Text
                  style={[styles.cancelButtonText, { fontSize: Math.round(14 * factor), color: palette.text }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {t('collective.optOutConfirm.cancel', 'Cancel')}
                </Text>
              </A11yPressable>
            </GapView>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(_palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
    },
    loadingText: {
      fontWeight: '500',
    },
    header: {
      marginBottom: 16,
    },
    headerTitle: {
      fontWeight: '700',
      marginBottom: 4,
      lineHeight: 32,
    },
    headerSubtitle: {
      lineHeight: 20,
    },
    privacyNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderLeftWidth: 3,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    privacyText: {
      flex: 1,
      marginLeft: 8,
      lineHeight: 18,
    },
    statsCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...createShadow({
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    statsHeader: {
      marginBottom: 12,
    },
    statsTitle: {
      fontWeight: '700',
      lineHeight: 22,
    },
    statsContent: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontWeight: '700',
      marginBottom: 4,
    },
    statLabel: {
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    optOutButton: {
      paddingVertical: 8,
      alignItems: 'center',
    },
    optOutText: {
      fontWeight: '600',
    },
    thresholdCard: {
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      ...createShadow({
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    thresholdIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    thresholdTitle: {
      fontWeight: '700',
      marginBottom: 12,
      textAlign: 'center',
      lineHeight: 24,
    },
    thresholdText: {
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 16,
    },
    thresholdCta: {
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 20,
    },
    patternsSection: {
      marginTop: 8,
    },
    sectionHeader: {
      marginBottom: 8,
    },
    sectionTitle: {
      fontWeight: '700',
      marginBottom: 4,
      lineHeight: 26,
    },
    sectionSubtitle: {
      lineHeight: 18,
    },
    patternCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: 12,
      padding: 16,
      ...createShadow({
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    patternIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    patternContent: {
      flex: 1,
    },
    patternTitle: {
      fontWeight: '700',
      marginBottom: 4,
      lineHeight: 22,
    },
    patternInsight: {
      marginBottom: 8,
      lineHeight: 20,
    },
    patternStatistic: {
      fontWeight: '700',
      marginBottom: 8,
      lineHeight: 24,
    },
    solidarityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginBottom: 8,
    },
    solidarityText: {
      marginLeft: 4,
      fontWeight: '600',
    },
    actionText: {
      fontWeight: '600',
    },
    noPatterns: {
      textAlign: 'center',
      paddingVertical: 24,
      lineHeight: 20,
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    confirmModal: {
      borderRadius: 12,
      padding: 24,
      maxWidth: 400,
      width: '100%',
      ...createShadow({
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      }),
    },
    confirmTitle: {
      fontWeight: '700',
      marginBottom: 12,
      textAlign: 'center',
      lineHeight: 24,
    },
    confirmText: {
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    confirmActions: {
      width: '100%',
    },
    confirmButton: {
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      minHeight: 48,
    },
    confirmButtonText: {
      fontWeight: '600',
    },
    cancelButton: {
      borderRadius: 8,
      borderWidth: 1.5,
      paddingVertical: 12,
      alignItems: 'center',
      minHeight: 48,
    },
    cancelButtonText: {
      fontWeight: '600',
    },
  });
}
