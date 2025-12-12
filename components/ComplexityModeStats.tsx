/**
 * ComplexityModeStats - Shows feature counts per complexity mode
 * 
 * Displays how many features are visible in current mode vs total
 * Helps users understand what they're seeing and what's hidden
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { FEATURE_COUNTS, getFeatureStats, type FeatureCategory } from '../services/featureRegistry';
import { useComplexityMode, type ComplexityMode } from '../store/complexityMode';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

interface ComplexityModeStatsProps {
  /** Specific category to show stats for */
  category?: FeatureCategory;
  /** Show detailed breakdown or just summary */
  detailed?: boolean;
  /** Whether to show upgrade prompt */
  showUpgrade?: boolean;
  /** Custom message for upgrade prompt */
  upgradeMessage?: string;
}

export default function ComplexityModeStats({
  category,
  detailed = false,
  showUpgrade = true,
  upgradeMessage,
}: ComplexityModeStatsProps) {
  const palette = useAppPalette();
  const router = useRouter();
  const { mode, isBadDayMode } = useComplexityMode();
  const styles = createStyles(palette);
  
  // Get stats for the current mode (may be used in future enhancements)
  const _stats = getFeatureStats(mode);
  
  // Calculate what's visible vs total
  const getVisibleCount = (m: ComplexityMode): number => {
    switch (m) {
      case 'simple': return FEATURE_COUNTS.simple;
      case 'standard': return FEATURE_COUNTS.simple + FEATURE_COUNTS.standard;
      case 'power_user': return FEATURE_COUNTS.simple + FEATURE_COUNTS.standard + FEATURE_COUNTS.power_user;
    }
  };
  
  const totalFeatures = FEATURE_COUNTS.simple + FEATURE_COUNTS.standard + FEATURE_COUNTS.power_user;
  const visibleFeatures = getVisibleCount(mode);
  const hiddenFeatures = totalFeatures - visibleFeatures;
  const percentage = Math.round((visibleFeatures / totalFeatures) * 100);
  
  // Category-specific counts (approximate based on distribution)
  const categoryDistribution: Record<FeatureCategory, { simple: number; standard: number; power: number }> = {
    settings: { simple: 3, standard: 5, power: 3 },
    wellness: { simple: 2, standard: 8, power: 15 },
    advocacy: { simple: 2, standard: 5, power: 10 },
    community: { simple: 1, standard: 4, power: 8 },
    resources: { simple: 2, standard: 3, power: 8 },
  };
  
  const getCategoryVisibleCount = (cat: FeatureCategory): number => {
    const dist = categoryDistribution[cat];
    switch (mode) {
      case 'simple': return dist.simple;
      case 'standard': return dist.simple + dist.standard;
      case 'power_user': return dist.simple + dist.standard + dist.power;
    }
  };
  
  const getCategoryTotalCount = (cat: FeatureCategory): number => {
    const dist = categoryDistribution[cat];
    return dist.simple + dist.standard + dist.power;
  };
  
  const getModeLabel = (): string => {
    if (isBadDayMode) return 'Bad Day Mode';
    switch (mode) {
      case 'simple': return 'Simple Mode';
      case 'standard': return 'Standard Mode';
      case 'power_user': return 'Power User Mode';
    }
  };
  
  const getModeIcon = (): string => {
    if (isBadDayMode) return 'moon-outline';
    switch (mode) {
      case 'simple': return 'leaf-outline';
      case 'standard': return 'grid-outline';
      case 'power_user': return 'flash-outline';
    }
  };
  
  const handleUpgrade = () => {
    router.push('/(tabs)/settings/complexity-mode' as never);
  };
  
  // Category-specific display
  if (category) {
    const catVisible = getCategoryVisibleCount(category);
    const catTotal = getCategoryTotalCount(category);
    const catHidden = catTotal - catVisible;
    
    if (catHidden === 0) return null; // Don't show if all visible
    
    return (
      <View style={styles.container}>
        <View style={styles.categoryRow}>
          <Ionicons name={getModeIcon() as any} size={16} color={palette.textSecondary} />
          <Text style={styles.categoryText}>
            Showing {catVisible} of {catTotal} features
          </Text>
          {showUpgrade && catHidden > 0 && (
            <A11yPressable
              onPress={handleUpgrade}
              accessibilityRole="button"
              accessibilityLabel={`Show ${catHidden} more features`}
              hitSlop={HIT_SLOP_8}
              style={styles.upgradeButton}
            >
              <Text style={styles.upgradeText}>+{catHidden} more</Text>
            </A11yPressable>
          )}
        </View>
      </View>
    );
  }
  
  // Full stats display
  if (detailed) {
    return (
      <View style={styles.detailedContainer}>
        <View style={styles.header}>
          <Ionicons name={getModeIcon() as any} size={20} color={palette.primary} />
          <Text style={styles.headerText}>{getModeLabel()}</Text>
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {visibleFeatures} of {totalFeatures} features ({percentage}%)
          </Text>
        </View>
        
        {/* Breakdown by level */}
        <View style={styles.breakdown}>
          <View style={styles.breakdownRow}>
            <View style={[styles.dot, { backgroundColor: palette.success }]} />
            <Text style={styles.breakdownLabel}>Simple</Text>
            <Text style={styles.breakdownValue}>{FEATURE_COUNTS.simple}</Text>
            <Text style={styles.breakdownStatus}>
              {mode === 'simple' || mode === 'standard' || mode === 'power_user' ? '✓' : '—'}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <View style={[styles.dot, { backgroundColor: palette.primary }]} />
            <Text style={styles.breakdownLabel}>Standard</Text>
            <Text style={styles.breakdownValue}>{FEATURE_COUNTS.standard}</Text>
            <Text style={styles.breakdownStatus}>
              {mode === 'standard' || mode === 'power_user' ? '✓' : '—'}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <View style={[styles.dot, { backgroundColor: palette.warning }]} />
            <Text style={styles.breakdownLabel}>Power User</Text>
            <Text style={styles.breakdownValue}>{FEATURE_COUNTS.power_user}</Text>
            <Text style={styles.breakdownStatus}>
              {mode === 'power_user' ? '✓' : '—'}
            </Text>
          </View>
        </View>
        
        {/* Upgrade prompt */}
        {showUpgrade && mode !== 'power_user' && (
          <A11yPressable
            onPress={handleUpgrade}
            accessibilityRole="button"
            accessibilityLabel={upgradeMessage ?? `Unlock ${hiddenFeatures} more features`}
            hitSlop={HIT_SLOP_8}
            style={styles.fullUpgradeButton}
          >
            <Ionicons name="lock-open-outline" size={16} color={palette.onPrimary} />
            <Text style={styles.fullUpgradeText}>
              {upgradeMessage ?? `Unlock ${hiddenFeatures} more features`}
            </Text>
          </A11yPressable>
        )}
      </View>
    );
  }
  
  // Compact summary
  return (
    <A11yPressable
      onPress={handleUpgrade}
      accessibilityRole="button"
      accessibilityLabel={`${getModeLabel()}: ${visibleFeatures} features visible. Tap to change.`}
      hitSlop={HIT_SLOP_8}
      style={styles.summary}
    >
      <Ionicons name={getModeIcon() as any} size={16} color={palette.textSecondary} />
      <Text style={styles.summaryText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {visibleFeatures}/{totalFeatures} features
      </Text>
      {hiddenFeatures > 0 && (
        <Ionicons name="chevron-forward" size={14} color={palette.muted} />
      )}
    </A11yPressable>
  );
}

const createStyles = (palette: ReturnType<typeof useAppPalette>) => StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  categoryText: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  upgradeButton: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: palette.primary + '15',
    borderRadius: 12,
  },
  upgradeText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.primary,
  },
  
  // Detailed view
  detailedContainer: {
    backgroundColor: palette.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.muted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: palette.muted,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  breakdown: {
    gap: 8,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    color: palette.text,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
    minWidth: 24,
    textAlign: 'right',
  },
  breakdownStatus: {
    fontSize: 14,
    color: palette.success,
    minWidth: 20,
    textAlign: 'center',
  },
  fullUpgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  fullUpgradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.onPrimary,
  },
  
  // Summary view
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: palette.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.muted,
  },
  summaryText: {
    fontSize: 13,
    color: palette.textSecondary,
  },
});
