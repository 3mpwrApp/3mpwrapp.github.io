/**
 * Wellness Command Center
 * 
 * Single consolidated hub for all wellness, energy, and health management.
 * Replaces 40+ scattered features with organized tabbed interface.
 * 
 * Tabs:
 * 1. Dashboard - Overview, quick logs, AI suggestions
 * 2. Energy - Spoon tracking, pacing, sleep optimization
 * 3. Health - Symptoms, meds, vitals, functional capacity
 * 4. Mental - Mood, CBT/DBT, crisis tools, cognitive scanner
 * 5. Movement - Exercise, rehab, adaptive meditation
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ComplexityModeIndicator from '../../../components/ComplexityModeIndicator';
import GapView from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useComplexityMode } from '../../../store/complexityMode';
import { createTextStyles } from '../../../theme/typography.enhanced';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

type TabId = 'dashboard' | 'energy' | 'health' | 'mental' | 'movement';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  route: string;
  color?: string;
}

interface AIFeature {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  badge?: string;
}

export default function WellnessCommandCenter() {
  const { t: _t } = useTranslation();
  const palette = useAppPalette();
  const textStyles = createTextStyles(palette);
  const { mode: _mode, isFeatureVisible } = useComplexityMode();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'apps' },
    { id: 'energy', label: 'Energy', icon: 'flash' },
    { id: 'health', label: 'Health', icon: 'medical' },
    { id: 'mental', label: 'Mental', icon: 'brain' },
    { id: 'movement', label: 'Movement', icon: 'fitness' },
  ];

  // Dashboard: Quick actions for immediate logging
  const dashboardActions: QuickAction[] = [
    { id: 'energy', icon: 'flash', label: 'Log Energy', route: '/wellness/energy-command-center', color: palette.warning },
    { id: 'mood', icon: 'happy', label: 'Log Mood', route: '/wellness/energy-mood-dashboard', color: palette.info },
    { id: 'symptom', icon: 'medical', label: 'Log Symptom', route: '/wellness/symptom-tracker', color: palette.error },
    { id: 'medication', icon: 'medkit', label: 'Log Medication', route: '/wellness/medications', color: palette.success },
  ];

  // Energy Tab: Spoon theory, pacing, sleep
  const energyFeatures: QuickAction[] = [
    { id: 'spoons', icon: 'restaurant', label: 'Spoon Economist', route: '/wellness/spoon-economist' },
    { id: 'pacing', icon: 'speedometer', label: 'Pacing Partner', route: '/wellness/pacing-partner' },
    { id: 'sleep', icon: 'moon', label: 'Sleep Tracker', route: '/wellness/sleep-energy-tracker' },
    { id: 'circadian', icon: 'sunny', label: 'Circadian DJ', route: '/wellness/circadian-dj' },
    { id: 'daily-planner', icon: 'calendar', label: 'Daily Planner', route: '/wellness/daily-planner' },
    { id: 'energy-aware', icon: 'color-wand', label: 'Energy-Aware UI', route: '/wellness/energy-aware-ui' },
  ];

  // Health Tab: Symptoms, meds, vitals, functional capacity
  const healthFeatures: QuickAction[] = [
    { id: 'symptoms', icon: 'pulse', label: 'Symptom Symphony', route: '/wellness/symptom-symphony' },
    { id: 'meds', icon: 'medkit', label: 'Medications', route: '/wellness/medications' },
    { id: 'health-tracker', icon: 'fitness', label: 'Health Tracker Pro', route: '/wellness/health-tracker-pro' },
    { id: 'functional', icon: 'clipboard', label: 'Functional Capacity', route: '/wellness/functional-capacity' },
    { id: 'pain', icon: 'warning', label: 'Pain Forecast', route: '/wellness/pain-forecast' },
    { id: 'environment', icon: 'cloudy', label: 'Environmental Tracking', route: '/wellness/environmental-adaptation' },
  ];

  // Mental Tab: Mood, CBT/DBT, crisis tools
  const mentalFeatures: QuickAction[] = [
    { id: 'mood-dashboard', icon: 'stats-chart', label: 'Mood Dashboard', route: '/wellness/energy-mood-dashboard' },
    { id: 'cognitive', icon: 'bulb', label: 'Cognitive Scanner', route: '/wellness/cognitive-scanner' },
    { id: 'cbt', icon: 'chatbubbles', label: 'CBT Coach', route: '/wellness/cbt-coach' },
    { id: 'dbt', icon: 'heart', label: 'DBT Skills', route: '/wellness/dbt' },
    { id: 'crisis', icon: 'alert-circle', label: 'Emotional First Aid', route: '/wellness/emotional-first-aid' },
    { id: 'grounding', icon: 'hand-right', label: 'AI Grounding', route: '/wellness/ai-grounding' },
    { id: 'toolkit', icon: 'construct', label: 'Mental Wellness Toolkit', route: '/wellness/mental-wellness-toolkit' },
  ];

  // Movement Tab: Exercise, rehab, meditation
  const movementFeatures: QuickAction[] = [
    { id: 'exercise', icon: 'barbell', label: 'Exercise Hub', route: '/wellness/exercise-hub' },
    { id: 'rehab', icon: 'game-controller', label: 'Rehab Games', route: '/wellness/rehab-games' },
    { id: 'meditation', icon: 'leaf', label: 'Adaptive Meditation', route: '/wellness/adaptive-meditation' },
    { id: 'micro', icon: 'walk', label: 'Micro Movement', route: '/wellness/micro-movement' },
    { id: 'movement-hub', icon: 'fitness', label: 'Movement Power Tool', route: '/wellness/movement-power-tool' },
  ];

  // AI Features (Power User mode only)
  const aiFeatures: AIFeature[] = [
    { id: 'ai-companion', title: 'AI Wellness Companion', description: 'Personalized wellness guidance', route: '/wellness/ai-companion', icon: 'sparkles', badge: 'AI' },
    { id: 'work-balance', title: 'Work-Balance AI', description: 'Energy-aware scheduling', route: '/wellness/work-balance-ai', icon: 'briefcase', badge: 'AI' },
    { id: 'trigger', title: 'Trigger Detector', description: 'Pattern correlation analysis', route: '/wellness/trigger-detector', icon: 'analytics', badge: 'AI' },
  ];

  const getCurrentFeatures = (): QuickAction[] => {
    switch (activeTab) {
      case 'energy':
        return energyFeatures;
      case 'health':
        return healthFeatures;
      case 'mental':
        return mentalFeatures;
      case 'movement':
        return movementFeatures;
      default:
        return [];
    }
  };

  const renderDashboard = () => (
    <View>
      {/* Summary Cards */}
      <GapView gap={12}>
        <View style={[styles.summaryCard, { backgroundColor: palette.warning + '15', borderColor: palette.warning }]}>
          <Ionicons name="flash" size={32} color={palette.warning} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>Energy Level</Text>
            <Text style={[styles.summaryValue, { color: palette.text }]}>4/12 spoons</Text>
            <Text style={[styles.summaryHint, { color: palette.textSecondary }]}>Low - consider rest</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: palette.info + '15', borderColor: palette.info }]}>
          <Ionicons name="happy" size={32} color={palette.info} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>Mood</Text>
            <Text style={[styles.summaryValue, { color: palette.text }]}>6/10 - Stable</Text>
            <Text style={[styles.summaryHint, { color: palette.textSecondary }]}>Last logged 2 hours ago</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: palette.error + '15', borderColor: palette.error }]}>
          <Ionicons name="pulse" size={32} color={palette.error} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>Pain Level</Text>
            <Text style={[styles.summaryValue, { color: palette.text }]}>7/10 - High</Text>
            <Text style={[styles.summaryHint, { color: palette.textSecondary }]}>Logged for evidence</Text>
          </View>
        </View>
      </GapView>

      {/* AI Suggestions (Standard mode and above) */}
      {isFeatureVisible('standard') && (
        <>
          <Text style={[textStyles.h3, { marginTop: 24, marginBottom: 12 }]}>
            🤖 AI Suggestions
          </Text>
          <View style={[styles.aiSuggestionCard, { backgroundColor: palette.primary + '10', borderColor: palette.primary }]}>
            <Ionicons name="bulb" size={24} color={palette.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.aiSuggestionText, { color: palette.text }]}>
                Your energy is low. Consider resting for 30 minutes before your next task.
              </Text>
              <Text style={[{ marginTop: 8, fontSize: 13, color: palette.textSecondary }]}>
                💡 Tip: Use the Pacing Partner tool from the Wellness tab
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Quick Log Actions */}
      <Text style={[textStyles.h3, { marginTop: 24, marginBottom: 12 }]}>
        Quick Log
      </Text>
      <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: 12 }]}>
        Access these features from the Wellness tab:
      </Text>
      <View style={styles.quickGrid}>
        {dashboardActions.map((action) => (
          <View
            key={action.id}
            style={[styles.quickButton, { backgroundColor: (action.color || palette.primary) + '15' }]}
          >
            <Ionicons name={action.icon as any} size={28} color={action.color || palette.primary} />
            <Text style={[styles.quickLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {action.label}
            </Text>
          </View>
        ))}
      </View>

      {/* View All Revolutionary Features (Power User) */}
      {isFeatureVisible('power_user') && (
        <>
          <Text style={[textStyles.h3, { marginTop: 24, marginBottom: 12 }]}>
            🚀 AI Power Features
          </Text>
          <GapView gap={12}>
            {aiFeatures.map((feature) => (
              <View
                key={feature.id}
                style={[styles.featureCard, { backgroundColor: palette.card, borderColor: palette.muted }]}
              >
                <Ionicons name={feature.icon as any} size={24} color={palette.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.featureTitle, { color: palette.text }]}>{feature.title}</Text>
                    {feature.badge && (
                      <View style={[styles.aiBadge, { backgroundColor: palette.primary, marginLeft: 8 }]}>
                        <Text style={styles.badgeText}>{feature.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.featureDesc, { color: palette.textSecondary }]}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </GapView>

          <View
            style={[styles.viewAllButton, { backgroundColor: palette.primary + '20', borderWidth: 2, borderColor: palette.primary }]}
          >
            <Text style={[styles.viewAllText, { color: palette.primary }]}>
              💡 Access all 13 AI features from the Wellness tab
            </Text>
          </View>
        </>
      )}
    </View>
  );

  const renderFeatureList = () => {
    const features = getCurrentFeatures();
    const tabName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    return (
      <View>
        <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: 12 }]}>
          {tabName} features available in the Wellness tab:
        </Text>
        <GapView gap={12}>
          {features.map((feature) => (
            <View
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: palette.card, borderColor: palette.muted }]}
            >
              <Ionicons name={feature.icon as any} size={24} color={palette.primary} />
              <Text style={[styles.featureTitle, { color: palette.text, flex: 1, marginLeft: 12 }]}>
                {feature.label}
              </Text>
            </View>
          ))}
        </GapView>
      </View>
    );
  };

  return (
    <ResponsiveScreenWrapper>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={textStyles.h1} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              ⚡ Wellness Command
            </Text>
            <Text style={[textStyles.body, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              All-in-one health & energy management
            </Text>
          </View>
          <ComplexityModeIndicator variant="minimal" />
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: palette.info + '15', borderColor: palette.info }]}>
          <Ionicons name="information-circle" size={20} color={palette.info} />
          <Text style={[styles.infoText, { color: palette.text, flex: 1, marginLeft: 8 }]}>
            This is an organizational view. To use these features, return to the Wellness tab and select the specific tool you need.
          </Text>
        </View>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={{ paddingHorizontal: 0 }}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                activeTab === tab.id && { backgroundColor: palette.primary, borderColor: palette.primary },
                activeTab !== tab.id && { backgroundColor: palette.card, borderColor: palette.muted },
              ]}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: activeTab === tab.id }}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.id ? palette.onPrimary : palette.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.id ? palette.onPrimary : palette.textSecondary },
                ]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'dashboard' ? renderDashboard() : renderFeatureList()}
        </View>
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  tabBar: {
    marginBottom: 20,
    maxHeight: 50,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  tabLabel: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 40,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryHint: {
    fontSize: 13,
    marginTop: 2,
  },
  aiSuggestionCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiSuggestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiActionLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickButton: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  aiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  viewAllButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
