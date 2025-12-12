/**
 * ComplexityModeHint - Contextual hints to help users understand mode benefits
 * 
 * Shows helpful tips about features available in higher complexity modes
 * Only shows when relevant (e.g., when user tries to access a hidden feature)
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useComplexityMode, type ComplexityMode } from '../store/complexityMode';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

interface ComplexityModeHintProps {
  /** The mode required to see the feature */
  requiredMode: ComplexityMode;
  /** Name of the feature that's hidden */
  featureName: string;
  /** Optional custom message */
  message?: string;
  /** Whether to show dismiss button */
  dismissible?: boolean;
  /** Called when dismissed */
  onDismiss?: () => void;
  /** Show compact version */
  compact?: boolean;
}

export default function ComplexityModeHint({
  requiredMode,
  featureName,
  message,
  dismissible = false,
  onDismiss,
  compact = false,
}: ComplexityModeHintProps) {
  const palette = useAppPalette();
  const router = useRouter();
  const { mode } = useComplexityMode();
  const styles = createStyles(palette, compact);
  
  // Don't show if feature is already visible
  const isVisible = () => {
    if (mode === 'power_user') return true;
    if (mode === 'standard' && (requiredMode === 'simple' || requiredMode === 'standard')) return true;
    if (mode === 'simple' && requiredMode === 'simple') return true;
    return false;
  };
  
  if (isVisible()) return null;
  
  const getModeLabel = (m: ComplexityMode): string => {
    switch (m) {
      case 'simple': return 'Simple';
      case 'standard': return 'Standard';
      case 'power_user': return 'Power User';
    }
  };
  
  const getModeEmoji = (m: ComplexityMode): string => {
    switch (m) {
      case 'simple': return '🎯';
      case 'standard': return '⚖️';
      case 'power_user': return '⚡';
    }
  };
  
  const defaultMessage = `"${featureName}" requires ${getModeEmoji(requiredMode)} ${getModeLabel(requiredMode)} mode.`;
  
  const handleUpgrade = () => {
    router.push('/(tabs)/settings/complexity-mode' as never);
  };
  
  if (compact) {
    return (
      <A11yPressable
        onPress={handleUpgrade}
        accessibilityRole="button"
        accessibilityLabel={`${featureName} requires ${getModeLabel(requiredMode)} mode. Tap to change mode.`}
        hitSlop={HIT_SLOP_8}
        style={styles.compactContainer}
      >
        <Ionicons name="lock-closed-outline" size={14} color={palette.warning} />
        <Text style={styles.compactText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {getModeEmoji(requiredMode)} {getModeLabel(requiredMode)} mode
        </Text>
        <Ionicons name="chevron-forward" size={14} color={palette.muted} />
      </A11yPressable>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={palette.warning} />
      </View>
      <View style={styles.content}>
        <Text style={styles.message} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {message ?? defaultMessage}
        </Text>
        <A11yPressable
          onPress={handleUpgrade}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${getModeLabel(requiredMode)} mode`}
          hitSlop={HIT_SLOP_8}
          style={styles.upgradeButton}
        >
          <Text style={styles.upgradeText}>
            Switch to {getModeEmoji(requiredMode)} {getModeLabel(requiredMode)}
          </Text>
          <Ionicons name="arrow-forward" size={14} color={palette.primary} />
        </A11yPressable>
      </View>
      {dismissible && (
        <A11yPressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss hint"
          hitSlop={HIT_SLOP_8}
          style={styles.dismissButton}
        >
          <Ionicons name="close" size={18} color={palette.muted} />
        </A11yPressable>
      )}
    </View>
  );
}

/**
 * Hook to manage complexity mode hints
 * Tracks which hints have been dismissed
 */
export function useComplexityModeHints() {
  const { mode, isFeatureVisible } = useComplexityMode();
  
  const shouldShowHint = (requiredMode: ComplexityMode): boolean => {
    return !isFeatureVisible(requiredMode);
  };
  
  const getUpgradeMessage = (currentMode: ComplexityMode, featureCount: number): string => {
    if (currentMode === 'simple') {
      return `Upgrade to Standard for ${featureCount} more features`;
    } else if (currentMode === 'standard') {
      return `Upgrade to Power User for ${featureCount} more features`;
    }
    return '';
  };
  
  return {
    mode,
    shouldShowHint,
    getUpgradeMessage,
    isFeatureVisible,
  };
}

const createStyles = (palette: ReturnType<typeof useAppPalette>, _compact: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.warning + '15',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.warning + '30',
    gap: 10,
  },
  iconContainer: {
    padding: 4,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  message: {
    fontSize: 14,
    color: palette.text,
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.primary,
  },
  dismissButton: {
    padding: 4,
  },
  
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.warning + '10',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  compactText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontWeight: '500',
  },
});
