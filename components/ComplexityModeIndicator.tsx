/**
 * ComplexityModeIndicator - Shows current mode in a compact badge
 * 
 * Can be placed in headers or navigation to show users their current mode
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useComplexityMode } from '../store/complexityMode';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

interface ComplexityModeIndicatorProps {
  /** Show as compact badge (default) or expanded with label */
  variant?: 'badge' | 'expanded' | 'minimal';
  /** Whether tapping navigates to settings */
  navigable?: boolean;
  /** Custom onPress handler */
  onPress?: () => void;
}

export default function ComplexityModeIndicator({
  variant = 'badge',
  navigable = true,
  onPress,
}: ComplexityModeIndicatorProps) {
  const palette = useAppPalette();
  const router = useRouter();
  const { mode, isBadDayMode } = useComplexityMode();

  const getModeConfig = () => {
    if (isBadDayMode) {
      return { emoji: '🌙', label: 'Bad Day', color: palette.warning };
    }
    
    switch (mode) {
      case 'simple':
        return { emoji: '🎯', label: 'Simple', color: palette.success };
      case 'standard':
        return { emoji: '⚖️', label: 'Standard', color: palette.primary };
      case 'power_user':
        return { emoji: '⚡', label: 'Power', color: palette.warning };
      default:
        return { emoji: '⚖️', label: 'Standard', color: palette.primary };
    }
  };

  const config = getModeConfig();
  const styles = createStyles(palette, config.color, variant);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigable) {
      router.push('/(tabs)/settings/complexity-mode' as any);
    }
  };

  if (variant === 'minimal') {
    return (
      <A11yPressable
        onPress={handlePress}
        accessibilityLabel={`Complexity mode: ${config.label}. Tap to change.`}
        accessibilityRole="button"
        hitSlop={HIT_SLOP_8}
        style={styles.minimal}
      >
        <Text style={styles.minimalEmoji}>{config.emoji}</Text>
      </A11yPressable>
    );
  }

  if (variant === 'expanded') {
    return (
      <A11yPressable
        onPress={handlePress}
        accessibilityLabel={`Complexity mode: ${config.label}. Tap to change.`}
        accessibilityRole="button"
        hitSlop={HIT_SLOP_8}
        style={styles.expanded}
      >
        <Text style={styles.expandedEmoji}>{config.emoji}</Text>
        <View>
          <Text style={styles.expandedLabel}>Mode</Text>
          <Text style={styles.expandedValue} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {config.label}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={palette.muted} />
      </A11yPressable>
    );
  }

  // Default: badge
  return (
    <A11yPressable
      onPress={handlePress}
      accessibilityLabel={`Complexity mode: ${config.label}. Tap to change.`}
      accessibilityRole="button"
      hitSlop={HIT_SLOP_8}
      style={styles.badge}
    >
      <Text style={styles.badgeEmoji}>{config.emoji}</Text>
      <Text style={styles.badgeLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {config.label}
      </Text>
    </A11yPressable>
  );
}

const createStyles = (palette: any, accentColor: string, _variant: string) => StyleSheet.create({
  // Badge variant
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: accentColor + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: accentColor,
  },
  
  // Minimal variant
  minimal: {
    padding: 4,
  },
  minimalEmoji: {
    fontSize: 16,
  },
  
  // Expanded variant
  expanded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  expandedEmoji: {
    fontSize: 24,
  },
  expandedLabel: {
    fontSize: 12,
    color: palette.muted,
  },
  expandedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
});
