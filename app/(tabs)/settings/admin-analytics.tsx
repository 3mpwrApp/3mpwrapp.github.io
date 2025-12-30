/**
 * Admin Analytics Dashboard - Phase 2 Metrics
 *
 * Real-time metrics for evidence collection, collective evidence,
 * home screen engagement, and pattern detection.
 *
 * Design: WCAG AAA compliant with color-coded indicators
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { getSessionAnalyticsStats } from '../../../services/analytics';
import {
  getCollectiveInsights,
  getOptInState,
  getUserContributionStats,
  type CollectiveInsights,
} from '../../../services/collectiveEvidence';
import { loadEncryptedNotes } from '../../../services/evidenceCrypto';
import { useComplexityMode } from '../../../store/complexityMode';
import { useAppPalette } from '../../../theme/usePalette';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type MetricCardData = {
  label: string;
  value: string | number;
  target?: string | number;
  status: 'success' | 'warning' | 'error' | 'neutral';
  description?: string;
};

type DashboardMetrics = {
  evidenceCollection: {
    averagePerUser: number;
    timeToFirstSave: string;
    retentionRate: number;
    totalNotes: number;
  };
  collectiveEvidence: {
    optInRate: number;
    totalContributions: number;
    usersAboveThreshold: number;
    optOutRate: number;
  };
  homeScreenEngagement: {
    heroCTR: number;
    timelineCTR: number;
    nextActionCTR: number;
  };
  patternDetection: {
    patternsDetected: number;
    topDenialReasons: string[];
    avgTimelineDelay: number;
    geographicDistribution: Record<string, number>;
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminAnalyticsDashboard() {
  const { t: _t } = useTranslation();
  const palette = useAppPalette();
  const { mode } = useComplexityMode();
  const styles = createStyles(palette);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [collectiveInsights, setCollectiveInsights] = useState<CollectiveInsights | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load metrics
  const loadMetrics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Load evidence data
      const evidenceNotes = await loadEncryptedNotes();
      const totalNotes = evidenceNotes.length;

      // Load collective evidence data
      const optInState = await getOptInState();
      const contributionStats = await getUserContributionStats();
      const insights = await getCollectiveInsights(isRefresh);
      setCollectiveInsights(insights);

      // Load analytics data
      const analyticsStats = getSessionAnalyticsStats();

      // Calculate evidence collection metrics
      const averagePerUser = totalNotes > 0 ? totalNotes : 0; // In single-user context
      const timeToFirstSave = calculateTimeToFirstSave(evidenceNotes);
      const retentionRate = calculateRetentionRate(evidenceNotes);

      // Calculate collective evidence metrics
      const optInRate = optInState.optedIn ? 100 : 0; // Single user context
      const totalContributions = contributionStats.contributionCount;
      const usersAboveThreshold = insights ? insights.uniqueUsers : 0;
      const optOutRate = optInState.optedIn ? 0 : 100;

      // Calculate home screen engagement (from analytics)
      const heroCTR = calculateCTR(analyticsStats.eventCounts, 'home_hero_cta_click', 'home_screen_view');
      const timelineCTR = calculateCTR(analyticsStats.eventCounts, 'evidence_timeline_click', 'home_screen_view');
      const nextActionCTR = calculateCTR(analyticsStats.eventCounts, 'next_action_click', 'home_screen_view');

      // Calculate pattern detection metrics
      const patternsDetected = insights?.patterns.length || 0;
      const topDenialReasons = insights?.patterns
        .filter(p => p.type === 'denial_reason')
        .slice(0, 3)
        .map(p => p.insight) || [];
      const avgTimelineDelay = calculateAverageTimelineDelay(insights);
      const geographicDistribution = calculateGeographicDistribution(insights);

      setMetrics({
        evidenceCollection: {
          averagePerUser,
          timeToFirstSave,
          retentionRate,
          totalNotes,
        },
        collectiveEvidence: {
          optInRate,
          totalContributions,
          usersAboveThreshold,
          optOutRate,
        },
        homeScreenEngagement: {
          heroCTR,
          timelineCTR,
          nextActionCTR,
        },
        patternDetection: {
          patternsDetected,
          topDenialReasons,
          avgTimelineDelay,
          geographicDistribution,
        },
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics metrics:', error);
      Alert.alert('Error', 'Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleRefresh = () => {
    loadMetrics(true);
  };

  const handleExport = async () => {
    if (!metrics) return;

    const exportData = {
      generatedAt: new Date().toISOString(),
      metrics,
      collectiveInsights: collectiveInsights ? {
        totalContributions: collectiveInsights.totalContributions,
        uniqueUsers: collectiveInsights.uniqueUsers,
        patternsCount: collectiveInsights.patterns.length,
      } : null,
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    try {
      await Share.share({
        message: jsonString,
        title: 'Phase 2 Analytics Export',
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Restrict access to power users
  if (mode !== 'power_user') {
    return (
      <ResponsiveScreenWrapper>
        <Stack.Screen options={{ title: 'Analytics' }} />
        <View style={styles.restricted}>
          <Text style={styles.restrictedText}>
            Analytics Dashboard requires Power User mode
          </Text>
        </View>
      </ResponsiveScreenWrapper>
    );
  }

  if (loading) {
    return (
      <ResponsiveScreenWrapper>
        <Stack.Screen options={{ title: 'Analytics' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </ResponsiveScreenWrapper>
    );
  }

  if (!metrics) {
    return (
      <ResponsiveScreenWrapper>
        <Stack.Screen options={{ title: 'Analytics' }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={palette.error} />
          <Text style={styles.errorText}>Failed to load metrics</Text>
          <A11yPressable
            onPress={handleRefresh}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry loading metrics"
            hitSlop={HIT_SLOP_8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </A11yPressable>
        </View>
      </ResponsiveScreenWrapper>
    );
  }

  return (
    <ResponsiveScreenWrapper>
      <Stack.Screen options={{ title: 'Phase 2 Analytics' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={palette.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Phase 2 Analytics
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Real-time evidence and engagement metrics
          </Text>
          <Text style={styles.lastUpdatedText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <A11yPressable
            onPress={handleRefresh}
            style={styles.refreshButton}
            accessibilityRole="button"
            accessibilityLabel="Refresh metrics"
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="refresh-outline" size={18} color={palette.primary} />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </A11yPressable>

          <A11yPressable
            onPress={handleExport}
            style={styles.exportButton}
            accessibilityRole="button"
            accessibilityLabel="Export metrics as JSON"
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="download-outline" size={18} color={palette.primary} />
            <Text style={styles.exportButtonText}>Export</Text>
          </A11yPressable>
        </View>

        {/* Evidence Collection Metrics */}
        <MetricSection title="Evidence Collection" icon="document-text-outline">
          <MetricCard
            data={{
              label: 'Average Evidence per User',
              value: metrics.evidenceCollection.averagePerUser,
              target: '5+',
              status: getStatus(metrics.evidenceCollection.averagePerUser, 5, 'gte'),
              description: 'Target: 5+ notes per user',
            }}
            palette={palette}
            styles={styles}
          />
          <MetricCard
            data={{
              label: 'Time to First Evidence Save',
              value: metrics.evidenceCollection.timeToFirstSave,
              target: '<2 min',
              status: 'neutral',
              description: 'Target: Under 2 minutes',
            }}
            palette={palette}
            styles={styles}
          />
          <MetricCard
            data={{
              label: 'Evidence Retention Rate',
              value: `${metrics.evidenceCollection.retentionRate}%`,
              target: '60%+',
              status: getStatus(metrics.evidenceCollection.retentionRate, 60, 'gte'),
              description: 'Users who return to add more evidence',
            }}
            palette={palette}
            styles={styles}
          />
          <MetricCard
            data={{
              label: 'Total Evidence Notes',
              value: metrics.evidenceCollection.totalNotes,
              status: 'neutral',
              description: 'Total notes in system',
            }}
            palette={palette}
            styles={styles}
          />
        </MetricSection>

        {/* Collective Evidence Metrics */}
        <MetricSection title="Collective Evidence" icon="people-outline">
          <MetricCard
            data={{
              label: 'Opt-in Rate',
              value: `${metrics.collectiveEvidence.optInRate}%`,
              target: '40%+',
              status: getStatus(metrics.collectiveEvidence.optInRate, 40, 'gte'),
              description: 'Target: 40%+ participation',
            }}
            palette={palette}
            styles={styles}
          />
          <MetricCard
            data={{
              label: 'Total Contributions',
              value: metrics.collectiveEvidence.totalContributions,
              status: 'neutral',
              description: 'Anonymous evidence shared',
            }}
            palette={palette}
            styles={styles}
          />
          <MetricCard
            data={{
              label: 'Users Above 50-User Threshold',
              value: metrics.collectiveEvidence.usersAboveThreshold,
              target: '50+',
              status: getStatus(metrics.collectiveEvidence.usersAboveThreshold, 50, 'gte'),
              description: 'Minimum for pattern visibility',
            }}
            palette={palette}
            styles={styles}
          />
          <MetricCard
            data={{
              label: 'Opt-out Rate',
              value: `${metrics.collectiveEvidence.optOutRate}%`,
              target: '<10%',
              status: getStatus(metrics.collectiveEvidence.optOutRate, 10, 'lte'),
              description: 'Target: Under 10%',
            }}
            palette={palette}
            styles={styles}
          />
        </MetricSection>

        {/* Home Screen Engagement */}
        <MetricSection title="Home Screen Engagement" icon="home-outline">
          <MetricCard
            data={{
              label: 'Hero CTA Click-Through Rate',
              value: `${metrics.homeScreenEngagement.heroCTR}%`,
              target: '80%+',
              status: getStatus(metrics.homeScreenEngagement.heroCTR, 80, 'gte'),
              description: 'Target: 80%+ engagement',
            }}
            palette={palette}
            styles={styles}
          />
          <MetricCard
            data={{
              label: 'Evidence Timeline Interaction',
              value: `${metrics.homeScreenEngagement.timelineCTR}%`,
              target: '50%+',
              status: getStatus(metrics.homeScreenEngagement.timelineCTR, 50, 'gte'),
              description: 'Target: 50%+ interaction',
            }}
            palette={palette}
            styles={styles}
          />
          <MetricCard
            data={{
              label: 'Next Best Action CTR',
              value: `${metrics.homeScreenEngagement.nextActionCTR}%`,
              target: '60%+',
              status: getStatus(metrics.homeScreenEngagement.nextActionCTR, 60, 'gte'),
              description: 'Target: 60%+ click-through',
            }}
            palette={palette}
            styles={styles}
          />
        </MetricSection>

        {/* Pattern Detection */}
        <MetricSection title="Pattern Detection" icon="analytics-outline">
          <MetricCard
            data={{
              label: 'Patterns Detected',
              value: metrics.patternDetection.patternsDetected,
              status: 'neutral',
              description: 'Total patterns identified',
            }}
            palette={palette}
            styles={styles}
          />

          {metrics.patternDetection.topDenialReasons.length > 0 && (
            <View style={styles.listCard}>
              <Text style={styles.listCardTitle}>Most Common Denial Reasons</Text>
              {metrics.patternDetection.topDenialReasons.map((reason, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemNumber}>{index + 1}.</Text>
                  <Text style={styles.listItemText}>{reason}</Text>
                </View>
              ))}
            </View>
          )}

          <MetricCard
            data={{
              label: 'Average Timeline Delays',
              value: metrics.patternDetection.avgTimelineDelay > 0
                ? `${metrics.patternDetection.avgTimelineDelay} days`
                : 'N/A',
              status: 'neutral',
              description: 'Avg. time from submission to decision',
            }}
            palette={palette}
            styles={styles}
          />

          {Object.keys(metrics.patternDetection.geographicDistribution).length > 0 && (
            <View style={styles.listCard}>
              <Text style={styles.listCardTitle}>Geographic Distribution</Text>
              {Object.entries(metrics.patternDetection.geographicDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([region, count], index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listItemText}>{region}</Text>
                    <Text style={styles.listItemValue}>{count}</Text>
                  </View>
                ))}
            </View>
          )}
        </MetricSection>

        <GapView style={{ height: 40 }} />
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function MetricSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  const palette = useAppPalette();
  const styles = createStyles(palette);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={24} color={palette.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function MetricCard({
  data,
  palette,
  styles,
}: {
  data: MetricCardData;
  palette: ReturnType<typeof useAppPalette>;
  styles: any;
}) {
  const getStatusColor = (status: MetricCardData['status']) => {
    switch (status) {
      case 'success':
        return palette.success;
      case 'warning':
        return palette.warning;
      case 'error':
        return palette.error;
      default:
        return palette.textSecondary;
    }
  };

  const getStatusIcon = (status: MetricCardData['status']) => {
    switch (status) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {data.label}
        </Text>
        {data.status !== 'neutral' && (
          <Ionicons
            name={getStatusIcon(data.status) as any}
            size={20}
            color={getStatusColor(data.status)}
          />
        )}
      </View>

      <View style={styles.metricValueContainer}>
        <Text style={styles.metricValue} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {data.value}
        </Text>
        {data.target && (
          <Text style={styles.metricTarget} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Target: {data.target}
          </Text>
        )}
      </View>

      {data.description && (
        <Text style={styles.metricDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {data.description}
        </Text>
      )}

      {data.status !== 'neutral' && (
        <View
          style={[
            styles.metricStatusBar,
            { backgroundColor: getStatusColor(data.status) },
          ]}
        />
      )}
    </View>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateTimeToFirstSave(notes: any[]): string {
  if (notes.length === 0) return 'N/A';
  // This is a placeholder - would need actual timing data from analytics
  return '~1 min';
}

function calculateRetentionRate(notes: any[]): number {
  if (notes.length === 0) return 0;
  // Placeholder - would need actual user return data
  return notes.length > 1 ? 100 : 0;
}

function calculateCTR(eventCounts: Record<string, number>, clickEvent: string, viewEvent: string): number {
  const clicks = eventCounts[clickEvent] || 0;
  const views = eventCounts[viewEvent] || 0;
  if (views === 0) return 0;
  return Math.round((clicks / views) * 100);
}

function calculateAverageTimelineDelay(insights: CollectiveInsights | null): number {
  if (!insights) return 0;

  const delayPatterns = insights.patterns.filter(p => p.type === 'timeline_delay');
  if (delayPatterns.length === 0) return 0;

  const totalDays = delayPatterns.reduce((sum, pattern) => {
    return sum + (pattern.metadata.avgDelay || 0);
  }, 0);

  return Math.round(totalDays / delayPatterns.length);
}

function calculateGeographicDistribution(insights: CollectiveInsights | null): Record<string, number> {
  if (!insights) return {};

  const geoPatterns = insights.patterns.filter(p => p.type === 'geographic_trend');
  const distribution: Record<string, number> = {};

  geoPatterns.forEach(pattern => {
    const region = pattern.metadata.region;
    const count = pattern.metadata.count || 0;
    if (region) {
      distribution[region] = count;
    }
  });

  return distribution;
}

function getStatus(
  value: number,
  target: number,
  comparison: 'gte' | 'lte'
): 'success' | 'warning' | 'error' {
  if (comparison === 'gte') {
    if (value >= target) return 'success';
    if (value >= target * 0.8) return 'warning';
    return 'error';
  } else {
    if (value <= target) return 'success';
    if (value <= target * 1.2) return 'warning';
    return 'error';
  }
}

// ============================================================================
// STYLES
// ============================================================================

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: palette.textSecondary,
      marginBottom: 8,
    },
    lastUpdatedText: {
      fontSize: 13,
      color: palette.muted,
      fontStyle: 'italic',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    refreshButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: palette.card,
      borderWidth: 1.5,
      borderColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      minHeight: 48,
    },
    refreshButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.primary,
    },
    exportButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: palette.card,
      borderWidth: 1.5,
      borderColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      minHeight: 48,
    },
    exportButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.primary,
    },
    section: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
    },
    sectionContent: {
      gap: 12,
    },
    metricCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      position: 'relative',
      overflow: 'hidden',
    },
    metricHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.textSecondary,
      flex: 1,
    },
    metricValueContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 12,
      marginBottom: 8,
    },
    metricValue: {
      fontSize: 28,
      fontWeight: '700',
      color: palette.text,
    },
    metricTarget: {
      fontSize: 14,
      color: palette.muted,
      fontStyle: 'italic',
    },
    metricDescription: {
      fontSize: 13,
      color: palette.textSecondary,
      lineHeight: 18,
    },
    metricStatusBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 4,
    },
    listCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
    },
    listCardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.textSecondary,
      marginBottom: 12,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.border,
    },
    listItemNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.muted,
      marginRight: 8,
      width: 20,
    },
    listItemText: {
      flex: 1,
      fontSize: 14,
      color: palette.text,
    },
    listItemValue: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.primary,
    },
    restricted: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    restrictedText: {
      fontSize: 16,
      color: palette.textSecondary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    loadingText: {
      fontSize: 16,
      color: palette.textSecondary,
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    errorText: {
      fontSize: 16,
      color: palette.error,
      marginTop: 16,
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      minHeight: 48,
      minWidth: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
    retryButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.onPrimary,
    },
  });
}
