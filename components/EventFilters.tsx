import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_12, HIT_SLOP_8 } from '../constants/A11Y';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';
import { GapView } from './GapView';

export interface EventFilterOptions {
  // Text search
  searchQuery?: string;
  // Accessibility filters
  wheelchairAccessible?: boolean;
  quietRoom?: boolean;
  parkingAccessible?: boolean;
  assistiveListening?: boolean;
  braille?: boolean;
  serviceAnimalsWelcome?: boolean;
  // Energy cost
  energyCost?: Array<'low' | 'medium' | 'high'>;
  // Location type
  locationType?: 'all' | 'in-person' | 'virtual';
  // Date range
  dateFrom?: Date;
  dateTo?: Date;
}

interface EventFiltersProps {
  visible: boolean;
  filters: EventFilterOptions;
  onApply: (filters: EventFilterOptions) => void;
  onClose: () => void;
}

export default function EventFilters({ visible, filters, onApply, onClose }: EventFiltersProps) {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);

  const [localFilters, setLocalFilters] = React.useState<EventFilterOptions>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const toggleAccessibility = (key: keyof EventFilterOptions) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleEnergyCost = (level: 'low' | 'medium' | 'high') => {
    setLocalFilters((prev) => {
      const current = prev.energyCost || [];
      const newCost = current.includes(level)
        ? current.filter((c) => c !== level)
        : [...current, level];
      return { ...prev, energyCost: newCost.length > 0 ? newCost : undefined };
    });
  };

  const clearAll = () => {
    setLocalFilters({});
  };

  const apply = () => {
    onApply(localFilters);
    onClose();
  };

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (localFilters.wheelchairAccessible) count++;
    if (localFilters.quietRoom) count++;
    if (localFilters.parkingAccessible) count++;
    if (localFilters.assistiveListening) count++;
    if (localFilters.braille) count++;
    if (localFilters.serviceAnimalsWelcome) count++;
    if (localFilters.energyCost && localFilters.energyCost.length > 0) count++;
    if (localFilters.locationType && localFilters.locationType !== 'all') count++;
    return count;
  }, [localFilters]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filter Events</Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.scroll}>
          {/* Accessibility Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>♿ Accessibility Features</Text>
            <GapView gap={8}>
              <FilterCheckbox
                label="Wheelchair Accessible"
                checked={localFilters.wheelchairAccessible || false}
                onToggle={() => toggleAccessibility('wheelchairAccessible')}
                palette={palette}
                factor={factor}
              />
              <FilterCheckbox
                label="Quiet Room Available"
                checked={localFilters.quietRoom || false}
                onToggle={() => toggleAccessibility('quietRoom')}
                palette={palette}
                factor={factor}
              />
              <FilterCheckbox
                label="Accessible Parking"
                checked={localFilters.parkingAccessible || false}
                onToggle={() => toggleAccessibility('parkingAccessible')}
                palette={palette}
                factor={factor}
              />
              <FilterCheckbox
                label="Assistive Listening Systems"
                checked={localFilters.assistiveListening || false}
                onToggle={() => toggleAccessibility('assistiveListening')}
                palette={palette}
                factor={factor}
              />
              <FilterCheckbox
                label="Braille/Large Print Materials"
                checked={localFilters.braille || false}
                onToggle={() => toggleAccessibility('braille')}
                palette={palette}
                factor={factor}
              />
              <FilterCheckbox
                label="Service Animals Welcome"
                checked={localFilters.serviceAnimalsWelcome || false}
                onToggle={() => toggleAccessibility('serviceAnimalsWelcome')}
                palette={palette}
                factor={factor}
              />
            </GapView>
          </View>

          {/* Energy Cost */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Energy Cost</Text>
            <Text style={styles.sectionDescription}>
              Filter events by spoon/energy requirements
            </Text>
            <View style={styles.chipRow}>
              <FilterChip
                label="🟢 Low"
                active={(localFilters.energyCost || []).includes('low')}
                onPress={() => toggleEnergyCost('low')}
                palette={palette}
                factor={factor}
              />
              <FilterChip
                label="🟡 Medium"
                active={(localFilters.energyCost || []).includes('medium')}
                onPress={() => toggleEnergyCost('medium')}
                palette={palette}
                factor={factor}
              />
              <FilterChip
                label="🔴 High"
                active={(localFilters.energyCost || []).includes('high')}
                onPress={() => toggleEnergyCost('high')}
                palette={palette}
                factor={factor}
              />
            </View>
          </View>

          {/* Location Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Location Type</Text>
            <View style={styles.chipRow}>
              <FilterChip
                label="All Events"
                active={!localFilters.locationType || localFilters.locationType === 'all'}
                onPress={() => setLocalFilters({ ...localFilters, locationType: 'all' })}
                palette={palette}
                factor={factor}
              />
              <FilterChip
                label="In-Person Only"
                active={localFilters.locationType === 'in-person'}
                onPress={() => setLocalFilters({ ...localFilters, locationType: 'in-person' })}
                palette={palette}
                factor={factor}
              />
              <FilterChip
                label="Virtual Only"
                active={localFilters.locationType === 'virtual'}
                onPress={() => setLocalFilters({ ...localFilters, locationType: 'virtual' })}
                palette={palette}
                factor={factor}
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <A11yPressable
            style={[styles.clearButton, { opacity: activeFilterCount > 0 ? 1 : 0.5 }]}
            onPress={clearAll}
            disabled={activeFilterCount === 0}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </A11yPressable>

          <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
            <A11yPressable
              style={styles.cancelButton}
              onPress={onClose}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </A11yPressable>

            <A11yPressable
              style={styles.applyButton}
              onPress={apply}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel={`Apply ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''}`}
            >
              <Text style={styles.applyButtonText}>
                Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
            </A11yPressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  palette: ReturnType<typeof useAppPalette>;
  factor: number;
}

function FilterCheckbox({ label, checked, onToggle, palette, factor }: FilterCheckboxProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        minHeight: 48,
      }}
      hitSlop={HIT_SLOP_12}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderWidth: 2,
          borderColor: checked ? palette.primary : palette.border,
          backgroundColor: checked ? palette.primary : 'transparent',
          borderRadius: 6,
          marginRight: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && <Text style={{ color: palette.onPrimary, fontSize: 16, fontWeight: '700' }}>✓</Text>}
      </View>
      <Text style={{ fontSize: 15 * factor, color: palette.text, flex: 1 }}>{label}</Text>
    </Pressable>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  palette: ReturnType<typeof useAppPalette>;
  factor: number;
}

function FilterChip({ label, active, onPress, palette, factor }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? palette.primary : palette.surface,
        borderWidth: 1,
        borderColor: active ? palette.primary : palette.border,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text
        style={{
          fontSize: 14 * factor,
          fontWeight: '600',
          color: active ? palette.onPrimary : palette.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    title: {
      fontSize: 24 * factor,
      fontWeight: '700',
      color: palette.text,
    },
    badge: {
      backgroundColor: palette.primary,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    badgeText: {
      color: palette.onPrimary,
      fontSize: 14 * factor,
      fontWeight: '700',
    },
    scroll: {
      flex: 1,
      paddingHorizontal: 20,
    },
    section: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 18 * factor,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 14 * factor,
      color: palette.textSecondary,
      marginBottom: 12,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: palette.border,
      backgroundColor: palette.background,
    },
    clearButton: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearButtonText: {
      fontSize: 15 * factor,
      fontWeight: '600',
      color: palette.text,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: palette.surface,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    cancelButtonText: {
      fontSize: 16 * factor,
      fontWeight: '700',
      color: palette.text,
    },
    applyButton: {
      flex: 1,
      backgroundColor: palette.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    applyButtonText: {
      fontSize: 16 * factor,
      fontWeight: '700',
      color: palette.onPrimary,
    },
  });
}
