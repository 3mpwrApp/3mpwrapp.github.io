/**
 * Analytics Platforms Stats Component
 *
 * Displays benefits and real-time statistics for:
 * - Firebase Analytics
 * - Sentry Performance Monitoring
 * - Vexo Analytics
 *
 * Only visible in Admin Panel for power users
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../A11yPressable';
import GapView from '../GapView';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { isSentryEnabled } from '../../services/sentryLabeling';
import { useAppPalette } from '../../theme/usePalette';

type PlatformStats = {
  name: string;
  icon: string;
  status: 'active' | 'inactive' | 'loading';
  benefits: string[];
  stats?: {
    label: string;
    value: string;
    description?: string;
  }[];
  dashboardUrl?: string;
  color: string;
};

export default function AnalyticsPlatformsStats() {
  const palette = useAppPalette();
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<PlatformStats[]>([]);

  const styles = createStyles(palette);

  useEffect(() => {
    loadPlatformStats();
  }, []);

  const loadPlatformStats = async () => {
    setLoading(true);

    const platformsData: PlatformStats[] = [];

    // Firebase Analytics
    try {
      let firebaseStatus: 'active' | 'inactive' = 'inactive';

      try {
        const { getFirebaseAnalytics } = await import('../../firebase/config');
        const analytics = await getFirebaseAnalytics();
        firebaseStatus = analytics ? 'active' : 'inactive';
      } catch {
        firebaseStatus = 'inactive';
      }

      platformsData.push({
        name: 'Firebase Analytics',
        icon: 'flame',
        status: firebaseStatus,
        color: '#FFCA28',
        benefits: [
          '📊 Real-time user behavior tracking',
          '🎯 Audience segmentation & insights',
          '📱 Mobile-optimized analytics',
          '🔗 Google Analytics integration',
          '📈 Conversion funnel analysis',
          '🌍 Geographic & demographic data',
        ],
        stats: firebaseStatus === 'active' ? [
          { label: 'Status', value: 'Active', description: 'Tracking user events' },
          { label: 'Platform', value: 'Web Only', description: 'Firebase web SDK' },
          { label: 'Privacy', value: 'Compliant', description: 'Respects user settings' },
        ] : [
          { label: 'Status', value: 'Not Active', description: 'Not configured' },
        ],
        dashboardUrl: 'https://console.firebase.google.com/',
      });
    } catch (error) {
      platformsData.push({
        name: 'Firebase Analytics',
        icon: 'flame',
        status: 'inactive',
        color: '#FFCA28',
        benefits: ['Not configured'],
      });
    }

    // Sentry Performance Monitoring
    try {
      const sentryStatus = isSentryEnabled() ? 'active' : 'inactive';

      platformsData.push({
        name: 'Sentry Performance',
        icon: 'flash',
        status: sentryStatus,
        color: '#362D59',
        benefits: [
          '⚡ Real-time performance monitoring',
          '🔍 Error tracking & debugging',
          '📉 Transaction performance (P50/P95/P99)',
          '🎯 Automatic issue categorization',
          '🔄 Breadcrumbs for error context',
          '📊 Release health tracking',
          '🌐 Distributed tracing (API→Backend)',
          '💾 Session replay capabilities',
        ],
        stats: sentryStatus === 'active' ? [
          { label: 'Status', value: 'Active', description: 'Monitoring performance' },
          { label: 'Sample Rate', value: '20%', description: 'Production trace sampling' },
          { label: 'Profiling', value: 'Enabled', description: '20% profile rate' },
          { label: 'Integrations', value: 'React Navigation + HTTP', description: 'Auto-instrumentation' },
          { label: 'Privacy', value: 'PII Filtered', description: 'No personal data sent' },
        ] : [
          { label: 'Status', value: 'Not Active', description: 'Not initialized' },
        ],
        dashboardUrl: 'https://sentry.io/',
      });
    } catch (error) {
      platformsData.push({
        name: 'Sentry Performance',
        icon: 'flash',
        status: 'inactive',
        color: '#362D59',
        benefits: ['Not configured'],
      });
    }

    // Vexo Analytics
    try {
      let vexoStatus: 'active' | 'inactive' = 'inactive';

      try {
        const vexoModule = await import('vexo-analytics');
        // If module loaded successfully, assume it's configured
        vexoStatus = vexoModule ? 'active' : 'inactive';
      } catch {
        vexoStatus = 'inactive';
      }

      platformsData.push({
        name: 'Vexo Analytics',
        icon: 'analytics',
        status: vexoStatus,
        color: '#7C3AED',
        benefits: [
          '📱 Device-level user tracking',
          '🔄 Cross-platform analytics',
          '📊 Custom event tracking',
          '🎯 User journey mapping',
          '📈 Engagement metrics',
          '🌐 Multi-app analytics',
          '⚡ Lightweight & fast',
        ],
        stats: vexoStatus === 'active' ? [
          { label: 'Status', value: 'Active', description: 'Tracking user devices' },
          { label: 'App ID', value: '3mpwrApp', description: 'Project identifier' },
          { label: 'Privacy', value: 'Opt-in', description: 'Requires analytics consent' },
          { label: 'Features', value: 'Device ID + Events', description: 'User identification enabled' },
        ] : [
          { label: 'Status', value: 'Not Active', description: 'Not initialized' },
        ],
        dashboardUrl: 'https://www.vexo.co/',
      });
    } catch (error) {
      platformsData.push({
        name: 'Vexo Analytics',
        icon: 'analytics',
        status: 'inactive',
        color: '#7C3AED',
        benefits: ['Not configured'],
      });
    }

    setPlatforms(platformsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Loading analytics platforms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Analytics Platforms</Text>
        <Text style={styles.subtitle}>
          Enterprise-grade analytics stack for data-driven decisions
        </Text>
      </View>

      <GapView style={{ height: 16 }} />

      {platforms.map((platform, index) => (
        <PlatformCard key={index} platform={platform} palette={palette} styles={styles} />
      ))}

      <GapView style={{ height: 16 }} />

      {/* Summary Section */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>🎯 Combined Benefits</Text>
        <GapView style={{ height: 8 }} />
        <BenefitRow icon="checkmark-circle" text="Complete visibility into user behavior" palette={palette} />
        <BenefitRow icon="checkmark-circle" text="Real-time performance monitoring" palette={palette} />
        <BenefitRow icon="checkmark-circle" text="Error tracking with full context" palette={palette} />
        <BenefitRow icon="checkmark-circle" text="Privacy-first data collection" palette={palette} />
        <BenefitRow icon="checkmark-circle" text="Cross-platform analytics" palette={palette} />
        <BenefitRow icon="checkmark-circle" text="Proactive issue detection" palette={palette} />
      </View>

      <GapView style={{ height: 16 }} />

      {/* Refresh Button */}
      <A11yPressable
        onPress={loadPlatformStats}
        accessibilityRole="button"
        accessibilityLabel="Refresh analytics platforms status"
        hitSlop={HIT_SLOP_8}
        style={styles.refreshButton}
      >
        <Ionicons name="refresh-outline" size={18} color={palette.primary} />
        <Text style={styles.refreshButtonText}>Refresh Status</Text>
      </A11yPressable>
    </View>
  );
}

function PlatformCard({
  platform,
  palette,
  styles,
}: {
  platform: PlatformStats;
  palette: any;
  styles: any;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.platformCard}>
      {/* Header */}
      <A11yPressable
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={`${platform.name}. ${expanded ? 'Collapse' : 'Expand'}`}
        hitSlop={HIT_SLOP_8}
        style={styles.platformHeader}
      >
        <View style={styles.platformIconWrapper}>
          <Ionicons
            name={platform.icon as any}
            size={24}
            color={platform.status === 'active' ? platform.color : palette.muted}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.platformName}>{platform.name}</Text>
          <View style={styles.platformStatus}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    platform.status === 'active'
                      ? palette.success
                      : platform.status === 'loading'
                      ? palette.warning
                      : palette.muted,
                },
              ]}
            />
            <Text style={styles.platformStatusText}>
              {platform.status === 'active'
                ? 'Active'
                : platform.status === 'loading'
                ? 'Loading...'
                : 'Inactive'}
            </Text>
          </View>
        </View>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={palette.muted}
        />
      </A11yPressable>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.platformContent}>
          {/* Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionLabel}>✨ Key Benefits</Text>
            <GapView style={{ height: 8 }} />
            {platform.benefits.map((benefit, idx) => (
              <Text key={idx} style={styles.benefitText}>
                {benefit}
              </Text>
            ))}
          </View>

          {/* Stats */}
          {platform.stats && platform.stats.length > 0 && (
            <>
              <GapView style={{ height: 12 }} />
              <View style={styles.statsSection}>
                <Text style={styles.sectionLabel}>📈 Current Status</Text>
                <GapView style={{ height: 8 }} />
                {platform.stats.map((stat, idx) => (
                  <View key={idx} style={styles.statRow}>
                    <Text style={styles.statLabel}>{stat.label}:</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Dashboard Link */}
          {platform.dashboardUrl && (
            <>
              <GapView style={{ height: 12 }} />
              <A11yPressable
                onPress={() => Linking.openURL(platform.dashboardUrl!)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${platform.name} dashboard`}
                hitSlop={HIT_SLOP_8}
                style={styles.dashboardButton}
              >
                <Ionicons name="open-outline" size={16} color={palette.primary} />
                <Text style={styles.dashboardButtonText}>View Dashboard</Text>
              </A11yPressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

function BenefitRow({ icon, text, palette }: { icon: string; text: string; palette: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <Ionicons name={icon as any} size={18} color={palette.success} style={{ marginRight: 8 }} />
      <Text style={{ fontSize: 14, color: palette.text, flex: 1 }}>{text}</Text>
    </View>
  );
}

const createStyles = (palette: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      marginBottom: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: palette.textSecondary,
      lineHeight: 20,
    },
    loadingText: {
      fontSize: 14,
      color: palette.textSecondary,
      marginTop: 12,
      textAlign: 'center',
    },
    platformCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
    },
    platformHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    platformIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: palette.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    platformName: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    platformStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    platformStatusText: {
      fontSize: 12,
      color: palette.textSecondary,
    },
    platformContent: {
      padding: 16,
      paddingTop: 0,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    benefitsSection: {
      marginTop: 8,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    benefitText: {
      fontSize: 13,
      color: palette.textSecondary,
      lineHeight: 20,
      marginBottom: 4,
    },
    statsSection: {
      marginTop: 8,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    statLabel: {
      fontSize: 13,
      color: palette.textSecondary,
    },
    statValue: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.text,
      fontFamily: 'monospace',
    },
    dashboardButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: palette.background,
      borderWidth: 1,
      borderColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 4,
    },
    dashboardButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.primary,
    },
    summaryCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    refreshButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.primary,
    },
  });
