/**
 * Appeal Command Center
 * 
 * Consolidates:
 * - Deadline Calculator + Reminders (deadlines.tsx)
 * - Deadlines List (deadlines-list.tsx)
 * - Denial Decoder (denial-decoder.tsx)
 * - Prepare to Appeal (prepare-appeal.tsx)
 * - Evidence Checklist (evidence-checklist.tsx)
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { GapView } from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useComplexityMode } from '../../../store/complexityMode';
import { createTextStyles } from '../../../theme/typography.enhanced';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type AppealTool = {
  id: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  description: string;
  route: string;
  badge?: string;
  color: string;
  featureLevel?: 'simple' | 'standard' | 'power_user';
  priority: 'critical' | 'high' | 'medium';
};

const APPEAL_TOOLS: AppealTool[] = [
  {
    id: 'deadline-warfare',
    title: 'Deadline Warfare',
    icon: 'clock-alert-outline',
    description: 'Never miss an appeal deadline. Calculate deadlines, set reminders, track submissions.',
    route: '/(tabs)/resources/deadlines',
    badge: 'Beta',
    color: '#DC2626',
    featureLevel: 'simple',
    priority: 'critical',
  },
  {
    id: 'denial-decoder',
    title: 'Denial Decoder',
    icon: 'file-search-outline',
    description: 'Upload denial letter, get AI analysis of patterns, appeal strength, and next steps.',
    route: '/(tabs)/resources/denial-decoder',
    badge: 'Beta',
    color: '#7C3AED',
    featureLevel: 'standard',
    priority: 'critical',
  },
  {
    id: 'evidence-strength',
    title: 'Evidence Strength Meter',
    icon: 'shield-check-outline',
    description: 'Analyze your evidence quality, identify gaps, get recommendations for stronger case.',
    route: '/(tabs)/resources/evidence-checklist',
    color: '#059669',
    featureLevel: 'standard',
    priority: 'high',
  },
  {
    id: 'appeal-prep',
    title: 'Appeal Preparation Guide',
    icon: 'clipboard-list-outline',
    description: 'Step-by-step checklist to prepare appeal: evidence, arguments, forms, timelines.',
    route: '/(tabs)/resources/prepare-appeal',
    badge: 'Beta',
    color: '#2563EB',
    featureLevel: 'standard',
    priority: 'high',
  },
  {
    id: 'precedent-finder',
    title: 'Precedent Finder',
    icon: 'book-search-outline',
    description: 'Find similar cases, winning arguments, and legal precedents for your situation.',
    route: '/(tabs)/resources/precedent-finder',
    badge: 'Coming soon',
    color: '#EA580C',
    featureLevel: 'power_user',
    priority: 'medium',
  },
];

export default function AppealCommandCenter() {
  const palette = useAppPalette();
  const textStyles = React.useMemo(() => createTextStyles(palette), [palette]);
  const { t } = useTranslation();
  const { mode, isFeatureVisible } = useComplexityMode();
  
  useAnnounceOnMount('Appeal Command Center');

  // Filter tools by complexity mode
  const visibleTools = React.useMemo(() => {
    return APPEAL_TOOLS.filter((tool) => {
      if (!tool.featureLevel) return true;
      return isFeatureVisible(tool.featureLevel);
    });
  }, [isFeatureVisible]);

  // Group by priority
  const criticalTools = visibleTools.filter(t => t.priority === 'critical');
  const highPriorityTools = visibleTools.filter(t => t.priority === 'high');
  const otherTools = visibleTools.filter(t => t.priority === 'medium');

  const styles = React.useMemo(() => createStyles(palette), [palette]);

  return (
    <ResponsiveScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text
          accessibilityRole="header"
          style={textStyles.h1}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          ⚖️ Appeal Command Center
        </Text>

        <Text style={[textStyles.body, { marginTop: 8, marginBottom: 16 }]}>
          Everything you need to win your appeal. Deadline tracking, denial analysis, evidence review, and step-by-step guidance.
        </Text>

        {/* Quick Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Appeal Status</Text>
          <GapView gap={12} style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.statLabel}>Active Appeals:</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.statLabel}>Upcoming Deadlines:</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.statLabel}>Evidence Collected:</Text>
              <Text style={styles.statValue}>0 items</Text>
            </View>
          </GapView>
        </View>

        {/* Complexity Mode Notice */}
        {mode !== 'power_user' && (
          <View style={[styles.infoCard, { backgroundColor: palette.primary + '15', borderColor: palette.primary }]}>
            <MaterialCommunityIcons name="information-outline" size={20} color={palette.primary} />
            <Text style={[textStyles.bodySmall, { marginLeft: 8, flex: 1 }]}>
              {mode === 'simple' 
                ? `Showing ${visibleTools.length} essential appeal tools. Enable Standard mode to see ${APPEAL_TOOLS.length - visibleTools.length} more.`
                : `Showing ${visibleTools.length} appeal tools. Enable Power User mode to see all ${APPEAL_TOOLS.length} tools.`}
            </Text>
          </View>
        )}

        {/* Critical Tools */}
        {criticalTools.length > 0 && (
          <>
            <Text
              accessibilityRole="header"
              style={[textStyles.h2, { marginTop: 24, marginBottom: 12 }]}
            >
              🚨 Critical Tools (Act Now)
            </Text>
            <GapView gap={16}>
              {criticalTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} palette={palette} />
              ))}
            </GapView>
          </>
        )}

        {/* High Priority Tools */}
        {highPriorityTools.length > 0 && (
          <>
            <Text
              accessibilityRole="header"
              style={[textStyles.h2, { marginTop: 24, marginBottom: 12 }]}
            >
              ⚡ High Priority
            </Text>
            <GapView gap={16}>
              {highPriorityTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} palette={palette} />
              ))}
            </GapView>
          </>
        )}

        {/* Additional Tools */}
        {otherTools.length > 0 && (
          <>
            <Text
              accessibilityRole="header"
              style={[textStyles.h2, { marginTop: 24, marginBottom: 12 }]}
            >
              📚 Additional Resources
            </Text>
            <GapView gap={16}>
              {otherTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} palette={palette} />
              ))}
            </GapView>
          </>
        )}

        {/* Appeal Success Tips */}
        <View style={[styles.tipsCard, { marginTop: 24 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MaterialCommunityIcons name="lightbulb-outline" size={24} color={palette.primary} />
            <Text style={[textStyles.h3, { marginLeft: 8, marginTop: 0 }]}>
              Appeal Success Tips
            </Text>
          </View>
          <GapView gap={8}>
            <Text style={styles.tipText}>✓ Act fast - most appeal deadlines are 30-90 days</Text>
            <Text style={styles.tipText}>✓ Get new medical evidence addressing denial reasons</Text>
            <Text style={styles.tipText}>✓ Use Letter Wizard to generate appeal letters</Text>
            <Text style={styles.tipText}>✓ Upload everything to Evidence Locker for tracking</Text>
            <Text style={styles.tipText}>✓ Set reminders for ALL deadlines (including reconsiderations)</Text>
          </GapView>
        </View>

        {/* Privacy Notice */}
        <View style={[styles.infoCard, { marginTop: 16, borderColor: palette.muted }]}>
          <MaterialCommunityIcons name="shield-lock-outline" size={20} color={palette.text} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.infoTitle}>Privacy First</Text>
            <Text style={styles.infoText}>
              All appeal data stored locally on your device. AI analysis happens locally when possible. Optional cloud sync with your own Firebase account.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

// Tool Card Component
function ToolCard({ tool, palette }: { tool: AppealTool; palette: ReturnType<typeof useAppPalette> }) {
  const isComingSoon = tool.badge === 'Coming soon';
  
  const handlePress = () => {
    if (isComingSoon) {
      Alert.alert(
        `${tool.title} Coming Soon`,
        `This feature is under active development. It will consolidate key appeal preparation tools into a powerful, easy-to-use interface.`,
        [{ text: 'OK' }]
      );
    }
  };

  const CardContent = (
    <View
      style={{
        backgroundColor: palette.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: palette.muted,
        opacity: isComingSoon ? 0.7 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: tool.color + '15',
          }}
        >
          <MaterialCommunityIcons
            name={tool.icon}
            size={28}
            color={tool.color}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: palette.text }}>
              {tool.title}
            </Text>
            {tool.badge && (
              <View style={{ marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: palette.primary }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: palette.onPrimary }}>
                  {tool.badge}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 13, color: palette.text, opacity: 0.8, marginTop: 4, lineHeight: 18 }}>
            {tool.description}
          </Text>
        </View>
        {!isComingSoon && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={palette.text}
            style={{ opacity: 0.5 }}
          />
        )}
      </View>
    </View>
  );

  if (isComingSoon) {
    return (
      <A11yPressable
        hitSlop={HIT_SLOP_8}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${tool.title}. ${tool.description}. Coming soon.`}
      >
        {CardContent}
      </A11yPressable>
    );
  }

  return (
    <Link href={tool.route as any} asChild>
      <A11yPressable
        hitSlop={HIT_SLOP_8}
        accessibilityRole="button"
        accessibilityLabel={`${tool.title}. ${tool.description}${tool.badge ? `. ${tool.badge}` : ''}`}
      >
        {CardContent}
      </A11yPressable>
    </Link>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    statsCard: {
      backgroundColor: palette.surface,
      padding: 16,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    statsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
    },
    statLabel: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.8,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.primary,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 12,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      marginTop: 16,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    infoText: {
      fontSize: 13,
      color: palette.text,
      opacity: 0.8,
    },
    tipsCard: {
      backgroundColor: palette.surface,
      padding: 16,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.primary,
    },
    tipText: {
      fontSize: 14,
      color: palette.text,
      lineHeight: 20,
    },
  });
}
