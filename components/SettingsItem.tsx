/**
 * Optimized Settings Item Component
 * Memoized for settings list rendering
 * 
 * BEFORE: All 50+ settings items re-render when one setting changes
 * AFTER: Only changed setting item re-renders
 */

import { useCallback, useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';
import { memoWithComparison, useRenderPerformance } from '../utils/optimization';

interface SettingsItemProps {
  label: string;
  description?: string;
  value: boolean | string;
  onValueChange: (value: boolean | string) => void;
  type?: 'toggle' | 'select';
  options?: { label: string; value: string }[];
}

function SettingsItemImpl({
  label,
  description,
  value,
  onValueChange,
  type = 'toggle',
  options = [],
}: SettingsItemProps) {
  const palette = useAppPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);

  useRenderPerformance('SettingsItem', 50);

  const handleToggle = useCallback(() => {
    if (type === 'toggle') {
      onValueChange(!value);
    }
  }, [value, onValueChange, type]);

  const isEnabled = useMemo(() => {
    return typeof value === 'boolean' ? value : value !== undefined;
  }, [value]);

  return (
    <View style={[styles.container, { backgroundColor: palette.card }]}>
      <View style={styles.content}>
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.description, { color: palette.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {type === 'toggle' ? (
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: palette.border, true: palette.primary + 'AA' }}
          thumbColor={isEnabled ? palette.primary : palette.muted}
          accessible={true}
          accessibilityLabel={label}
          accessibilityRole="switch"
          accessibilityState={{ checked: isEnabled }}
        />
      ) : type === 'select' && options.length > 0 ? (
        <View style={styles.selectContainer}>
          <Text style={[styles.selectedValue, { color: palette.primary }]}>
            {options.find((opt) => opt.value === value)?.label || 'Select...'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export const SettingsItem = memoWithComparison(SettingsItemImpl, (prev, next) => {
  return (
    prev.label === next.label &&
    prev.value === next.value &&
    prev.type === next.type
  );
});

const createStyles = (palette: ReturnType<typeof useAppPalette>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginVertical: 4,
      marginHorizontal: 12,
      borderRadius: 10,
    },
    content: {
      flex: 1,
      marginRight: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },
    description: {
      fontSize: 12,
      lineHeight: 16,
    },
    selectContainer: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: palette.cardAlt,
      borderRadius: 6,
    },
    selectedValue: {
      fontSize: 12,
      fontWeight: '600',
    },
  });
