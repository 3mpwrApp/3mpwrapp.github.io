/**
 * Optimized Filter Tag Component
 * Memoized for filter lists
 */

import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';
import { memoWithComparison, useRenderPerformance } from '../utils/optimization';

import A11yPressable from './A11yPressable';

interface FilterTagProps {
  label: string;
  icon?: string;
  isActive: boolean;
  onPress: () => void;
  variant?: 'default' | 'outline';
}

function FilterTagImpl({
  label,
  icon,
  isActive,
  onPress,
  variant = 'default',
}: FilterTagProps) {
  const palette = useAppPalette();
  const componentStyles = useMemo(() => createStyles(palette), [palette]);

  useRenderPerformance('FilterTag', 30);

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const containerStyle = useMemo(() => {
    const result: any[] = [componentStyles.container];

    if (variant === 'outline') {
      result.push({
        backgroundColor: isActive ? palette.primary + '11' : (palette.card as any),
        borderWidth: 1,
        borderColor: isActive ? palette.primary : (palette.border as any),
      });
    } else {
      result.push({
        backgroundColor: isActive ? palette.primary : (palette.cardAlt as any),
      });
    }

    return result;
  }, [isActive, variant, palette, componentStyles]);

  const textColor = useMemo(() => {
    if (variant === 'outline') {
      return isActive ? palette.primary : palette.text;
    }
    return isActive ? palette.onPrimary : palette.text;
  }, [isActive, variant, palette]);

  return (
    <A11yPressable
      onPress={handlePress}
      style={containerStyle}
      accessibilityLabel={`${label} filter${isActive ? ', active' : ''}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      {icon && <Text style={[componentStyles.icon, { color: textColor }]}>{icon}</Text>}
      <Text style={[componentStyles.label, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
      {isActive && (
        <View
          style={[
            componentStyles.checkmark,
            {
              backgroundColor: variant === 'outline' ? palette.primary : palette.onPrimary + '33',
            },
          ]}
        >
          <Text style={[componentStyles.checkmarkText, { color: textColor }]}>✓</Text>
        </View>
      )}
    </A11yPressable>
  );
}

export const FilterTag = memoWithComparison(FilterTagImpl, (prev, next) => {
  return (
    prev.label === next.label &&
    prev.isActive === next.isActive &&
    prev.variant === next.variant
  );
});

const createStyles = (palette: ReturnType<typeof useAppPalette>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginHorizontal: 4,
      borderRadius: 16,
      justifyContent: 'center',
    },
    icon: {
      fontSize: 14,
      marginRight: 4,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
    },
    checkmark: {
      marginLeft: 4,
      width: 14,
      height: 14,
      borderRadius: 7,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmarkText: {
      fontSize: 10,
      fontWeight: '700',
    },
  });
