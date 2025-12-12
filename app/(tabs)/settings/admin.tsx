/**
 * Admin Panel - Developer/Admin tools for managing the app
 * 
 * Features:
 * - A/B Testing management
 * - Feature flags
 * - Analytics overview
 * - Debug tools
 * 
 * Only visible to power users or when dev mode is enabled
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import {
    EXPERIMENTS,
    forceVariant,
    getVariant,
    resetAllExperiments,
    type Experiment,
    type Variant,
} from '../../../services/abTesting';
import { getSessionAnalyticsStats, resetSessionAnalytics } from '../../../services/analytics';
import { getReferralStats } from '../../../services/referral';
import { useComplexityMode } from '../../../store/complexityMode';
import { useAppPalette } from '../../../theme/usePalette';

export default function AdminPanel() {
  const { t: _t } = useTranslation();
  const palette = useAppPalette();
  const { mode } = useComplexityMode();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Record<string, Variant | null>>({});
  const [referralStats, setReferralStats] = useState<any>(null);
  const [analyticsStats, setAnalyticsStats] = useState<ReturnType<typeof getSessionAnalyticsStats> | null>(null);

  const styles = createStyles(palette);

  // Load current experiment assignments
  useEffect(() => {
    const loadData = async () => {
      try {
        const experimentIds = Object.keys(EXPERIMENTS);
        const variants: Record<string, Variant | null> = {};
        
        for (const id of experimentIds) {
          variants[id] = await getVariant(id);
        }
        
        setAssignments(variants);
        
        // Load referral stats
        const stats = await getReferralStats();
        setReferralStats(stats);
        
        // Load analytics stats
        const analytics = getSessionAnalyticsStats();
        setAnalyticsStats(analytics);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleForceVariant = async (experimentId: string, variantId: string) => {
    await forceVariant(experimentId, variantId);
    const newVariant = await getVariant(experimentId);
    setAssignments(prev => ({ ...prev, [experimentId]: newVariant }));
    Alert.alert('Variant Changed', `Now showing: ${newVariant?.name}`);
  };

  const handleResetExperiments = async () => {
    Alert.alert(
      'Reset All Experiments',
      'This will reset all A/B test assignments. You will be randomly reassigned on next app launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllExperiments();
            setAssignments({});
            Alert.alert('Reset Complete', 'Restart the app to get new assignments.');
          },
        },
      ]
    );
  };

  if (mode !== 'power_user') {
    return (
      <ResponsiveScreenWrapper>
        <Stack.Screen options={{ title: 'Admin Panel' }} />
        <View style={styles.restricted}>
          <Text style={styles.restrictedEmoji}>🔒</Text>
          <Text style={styles.restrictedText}>
            Admin Panel requires Power User mode
          </Text>
        </View>
      </ResponsiveScreenWrapper>
    );
  }

  return (
    <ResponsiveScreenWrapper>
      <Stack.Screen options={{ title: 'Admin Panel' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          ⚙️ Admin Panel
        </Text>
        <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Developer tools and experiment management
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={palette.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* A/B Testing Section */}
            <Section title="🧪 A/B Testing" styles={styles}>
              <Text style={styles.sectionDesc}>
                Manage active experiments and force specific variants for testing.
              </Text>

              <GapView style={{ height: 16 }} />

              {Object.entries(EXPERIMENTS).map(([id, experiment]) => (
                <ExperimentCard
                  key={id}
                  experiment={experiment}
                  currentVariant={assignments[id]}
                  onForceVariant={(variantId) => handleForceVariant(id, variantId)}
                  palette={palette}
                  styles={styles}
                />
              ))}

              <GapView style={{ height: 16 }} />

              <A11yPressable
                onPress={handleResetExperiments}
                accessibilityRole="button"
                accessibilityLabel="Reset all experiments"
                hitSlop={HIT_SLOP_8}
                style={styles.dangerButton}
              >
                <Ionicons name="refresh-outline" size={18} color={palette.onError ?? palette.onPrimary} />
                <Text style={styles.dangerButtonText}>Reset All Experiments</Text>
              </A11yPressable>
            </Section>

            {/* Referral Stats Section */}
            <Section title="🎁 Referral System" styles={styles}>
              {referralStats && (
                <View style={styles.statsGrid}>
                  <StatCard
                    label="Your Code"
                    value={referralStats.myCode}
                    palette={palette}
                    styles={styles}
                  />
                  <StatCard
                    label="Referrals"
                    value={referralStats.successfulReferrals.toString()}
                    palette={palette}
                    styles={styles}
                  />
                  <StatCard
                    label="Rewards"
                    value={referralStats.rewards.length.toString()}
                    palette={palette}
                    styles={styles}
                  />
                </View>
              )}
            </Section>

            {/* Analytics Section */}
            <Section title="📊 Analytics (This Session)" styles={styles}>
              {analyticsStats && (
                <>
                  <View style={styles.statsGrid}>
                    <StatCard
                      label="Session ID"
                      value={analyticsStats.sessionId.slice(0, 12)}
                      palette={palette}
                      styles={styles}
                    />
                    <StatCard
                      label="Total Events"
                      value={analyticsStats.totalEvents.toString()}
                      palette={palette}
                      styles={styles}
                    />
                    <StatCard
                      label="Event Types"
                      value={analyticsStats.uniqueEventTypes.toString()}
                      palette={palette}
                      styles={styles}
                    />
                  </View>

                  {analyticsStats.topEvents.length > 0 && (
                    <View style={styles.topEventsContainer}>
                      <Text style={styles.topEventsTitle}>Top Events</Text>
                      {analyticsStats.topEvents.slice(0, 5).map((event, index) => (
                        <View key={event.name} style={styles.topEventRow}>
                          <Text style={styles.topEventRank}>#{index + 1}</Text>
                          <Text style={styles.topEventName} numberOfLines={1}>{event.name}</Text>
                          <Text style={styles.topEventCount}>{event.count}×</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <GapView style={{ height: 12 }} />

                  <A11yPressable
                    onPress={() => {
                      setAnalyticsStats(getSessionAnalyticsStats());
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Refresh analytics"
                    hitSlop={HIT_SLOP_8}
                    style={styles.secondaryButton}
                  >
                    <Ionicons name="refresh-outline" size={18} color={palette.primary} />
                    <Text style={styles.secondaryButtonText}>Refresh</Text>
                  </A11yPressable>

                  <GapView style={{ height: 8 }} />

                  <A11yPressable
                    onPress={() => {
                      Alert.alert(
                        'Reset Analytics',
                        'This will clear all session analytics. Continue?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Reset',
                            style: 'destructive',
                            onPress: () => {
                              resetSessionAnalytics();
                              setAnalyticsStats(getSessionAnalyticsStats());
                              Alert.alert('Done', 'Session analytics reset.');
                            },
                          },
                        ]
                      );
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Reset session analytics"
                    hitSlop={HIT_SLOP_8}
                    style={styles.dangerButton}
                  >
                    <Ionicons name="trash-outline" size={18} color={palette.onError ?? palette.onPrimary} />
                    <Text style={styles.dangerButtonText}>Reset Session</Text>
                  </A11yPressable>
                </>
              )}
            </Section>

            {/* Debug Tools */}
            <Section title="🔧 Debug Tools" styles={styles}>
              <DebugRow
                label="Clear AsyncStorage"
                description="Remove all local data"
                onPress={() => {
                  Alert.alert(
                    'Clear All Data',
                    'This will delete all app data. Are you sure?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Clear',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                            await AsyncStorage.clear();
                            Alert.alert('Success', 'All data cleared. Restart the app.');
                          } catch {
                            Alert.alert('Error', 'Failed to clear data');
                          }
                        },
                      },
                    ]
                  );
                }}
                palette={palette}
                styles={styles}
              />
              <DebugRow
                label="Log Feature Registry"
                description="Print feature counts to console"
                onPress={() => {
                  const { FEATURE_COUNTS } = require('../../../services/featureRegistry');
                  Alert.alert('Feature Counts', `Simple: ${FEATURE_COUNTS.simple}\nStandard: ${FEATURE_COUNTS.standard}\nPower User: ${FEATURE_COUNTS.power_user}`);
                }}
                palette={palette}
                styles={styles}
              />
            </Section>

            <GapView style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function Section({ title, children, styles }: { title: string; children: React.ReactNode; styles: any }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ExperimentCard({
  experiment,
  currentVariant,
  onForceVariant,
  palette,
  styles,
}: {
  experiment: Experiment;
  currentVariant: Variant | null;
  onForceVariant: (variantId: string) => void;
  palette: any;
  styles: any;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.experimentCard}>
      <A11yPressable
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={`${experiment.name}. ${expanded ? 'Collapse' : 'Expand'}`}
        hitSlop={HIT_SLOP_8}
        style={styles.experimentHeader}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.experimentName}>{experiment.name}</Text>
          <Text style={styles.experimentDesc}>{experiment.description}</Text>
        </View>
        <View style={styles.experimentStatus}>
          <View style={[
            styles.statusDot,
            { backgroundColor: experiment.active ? palette.success : palette.muted }
          ]} />
          <Text style={styles.experimentVariant}>
            {currentVariant?.name || 'Not assigned'}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={palette.muted}
        />
      </A11yPressable>

      {expanded && (
        <View style={styles.experimentVariants}>
          <Text style={styles.variantsLabel}>Force Variant:</Text>
          <View style={styles.variantButtons}>
            {experiment.variants.map((variant) => (
              <A11yPressable
                key={variant.id}
                onPress={() => onForceVariant(variant.id)}
                accessibilityRole="button"
                accessibilityLabel={`Force ${variant.name}`}
                hitSlop={HIT_SLOP_8}
                style={[
                  styles.variantButton,
                  currentVariant?.id === variant.id && styles.variantButtonActive,
                ]}
              >
                <Text style={[
                  styles.variantButtonText,
                  currentVariant?.id === variant.id && styles.variantButtonTextActive,
                ]}>
                  {variant.name}
                </Text>
              </A11yPressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function StatCard({ label, value, palette: _palette, styles }: { label: string; value: string; palette: any; styles: any }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DebugRow({
  label,
  description,
  onPress,
  palette,
  styles,
}: {
  label: string;
  description: string;
  onPress: () => void;
  palette: any;
  styles: any;
}) {
  return (
    <A11yPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT_SLOP_8}
      style={styles.debugRow}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.debugLabel}>{label}</Text>
        <Text style={styles.debugDesc}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={palette.muted} />
    </A11yPressable>
  );
}

// ============================================
// STYLES
// ============================================

const createStyles = (palette: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 16,
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
    marginBottom: 24,
  },
  restricted: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  restrictedEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  restrictedText: {
    fontSize: 16,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
  },
  experimentCard: {
    backgroundColor: palette.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  experimentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  experimentName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  experimentDesc: {
    fontSize: 13,
    color: palette.textSecondary,
    marginTop: 2,
  },
  experimentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  experimentVariant: {
    fontSize: 12,
    color: palette.muted,
  },
  experimentVariants: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  variantsLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: 8,
  },
  variantButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.background,
  },
  variantButtonActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  variantButtonText: {
    fontSize: 13,
    color: palette.text,
  },
  variantButtonTextActive: {
    color: palette.onPrimary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.primary,
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: 4,
  },
  modeCard: {
    backgroundColor: palette.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  modeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  modeHint: {
    fontSize: 12,
    color: palette.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  debugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  debugLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
  },
  debugDesc: {
    fontSize: 13,
    color: palette.textSecondary,
    marginTop: 2,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.error,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.onError ?? palette.onPrimary,
  },
  secondaryButton: {
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
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.primary,
  },
  topEventsContainer: {
    backgroundColor: palette.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  topEventsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 12,
  },
  topEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.muted,
  },
  topEventRank: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.muted,
    width: 28,
  },
  topEventName: {
    flex: 1,
    fontSize: 13,
    color: palette.text,
    fontFamily: 'monospace',
  },
  topEventCount: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.primary,
    marginLeft: 8,
  },
});
