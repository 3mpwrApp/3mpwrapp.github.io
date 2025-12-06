/**
 * Notification Frequency Picker Component
 * 
 * Allows users to select notification frequency for a category
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_16 } from '../constants/A11Y';
import {
    CATEGORY_DESCRIPTIONS,
    CATEGORY_LABELS,
    FREQUENCY_DESCRIPTIONS,
    FREQUENCY_LABELS,
    getCategorySettings,
    setCategoryEnabled,
    setCategoryFrequency,
} from '../services/notificationFrequency';
import { useAppPalette } from '../theme/usePalette';
import type { NotificationCategory, NotificationFrequency } from '../types/notifications';

interface NotificationFrequencyPickerProps {
  category: NotificationCategory;
  onUpdate?: () => void;
}

export function NotificationFrequencyPicker({
  category,
  onUpdate,
}: NotificationFrequencyPickerProps) {
  const palette = useAppPalette();
  const [enabled, setEnabled] = React.useState(true);
  const [frequency, setFrequency] = React.useState<NotificationFrequency>('daily');
  const [modalVisible, setModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadSettings();
  }, [category]);

  async function loadSettings() {
    setLoading(true);
    try {
      const settings = await getCategorySettings(category);
      setEnabled(settings.enabled);
      setFrequency(settings.frequency);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
    setLoading(false);
  }

  async function handleToggleEnabled() {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    await setCategoryEnabled(category, newEnabled);
    onUpdate?.();
  }

  async function handleFrequencyChange(newFrequency: NotificationFrequency) {
    setFrequency(newFrequency);
    await setCategoryFrequency(category, newFrequency);
    setModalVisible(false);
    onUpdate?.();
  }

  const frequencyOptions: NotificationFrequency[] = [
    'realtime',
    'daily',
    'weekly',
    'monthly',
    'never',
  ];

  const styles = createStyles(palette);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: palette.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: palette.text }]}>
            {CATEGORY_LABELS[category]}
          </Text>
          <Text style={[styles.description, { color: palette.textSecondary }]}>
            {CATEGORY_DESCRIPTIONS[category]}
          </Text>
        </View>
        
        <Pressable
          style={[
            styles.toggleButton,
            { backgroundColor: enabled ? palette.success : palette.muted },
          ]}
          onPress={handleToggleEnabled}
          accessibilityRole="switch"
          accessibilityState={{ checked: enabled }}
          accessibilityLabel={`${CATEGORY_LABELS[category]} notifications ${enabled ? 'enabled' : 'disabled'}`}
          hitSlop={HIT_SLOP_16}
        >
          <Text style={styles.toggleText}>{enabled ? 'ON' : 'OFF'}</Text>
        </Pressable>
      </View>

      {enabled && (
        <Pressable
          style={[styles.frequencySelector, { borderColor: palette.border }]}
          onPress={() => setModalVisible(true)}
          hitSlop={HIT_SLOP_16}
          accessibilityRole="button"
          accessibilityLabel={`Frequency: ${FREQUENCY_LABELS[frequency]}. Tap to change.`}
        >
          <View style={styles.frequencyInfo}>
            <Ionicons name="time-outline" size={18} color={palette.primary} />
            <Text style={[styles.frequencyLabel, { color: palette.text }]}>
              {FREQUENCY_LABELS[frequency]}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={palette.textSecondary} />
        </Pressable>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          accessibilityRole="button"
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          hitSlop={HIT_SLOP_16}
        >
          <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>
              Notification Frequency
            </Text>
            <Text style={[styles.modalSubtitle, { color: palette.textSecondary }]}>
              How often would you like to receive {CATEGORY_LABELS[category].toLowerCase()} notifications?
            </Text>

            {frequencyOptions.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.optionItem,
                  { borderColor: palette.border },
                  frequency === option && { 
                    backgroundColor: palette.primary + '20',
                    borderColor: palette.primary,
                  },
                ]}
                onPress={() => handleFrequencyChange(option)}
                hitSlop={HIT_SLOP_16}
                accessibilityRole="radio"
                accessibilityState={{ selected: frequency === option }}
              >
                <View style={styles.optionInfo}>
                  <Text style={[
                    styles.optionLabel,
                    { color: frequency === option ? palette.primary : palette.text },
                  ]}>
                    {FREQUENCY_LABELS[option]}
                  </Text>
                  <Text style={[styles.optionDescription, { color: palette.textSecondary }]}>
                    {FREQUENCY_DESCRIPTIONS[option]}
                  </Text>
                </View>
                {frequency === option && (
                  <Ionicons name="checkmark-circle" size={24} color={palette.primary} />
                )}
              </Pressable>
            ))}

            <Pressable
              accessibilityRole="button"
              style={[styles.closeButton, { backgroundColor: palette.muted }]}
              onPress={() => setModalVisible(false)}
              hitSlop={HIT_SLOP_16}
            >
              <Text style={[styles.closeButtonText, { color: palette.text }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      paddingVertical: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    labelContainer: {
      flex: 1,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    description: {
      fontSize: 13,
      lineHeight: 18,
    },
    toggleButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      minWidth: 50,
      alignItems: 'center',
    },
    toggleText: {
      color: palette.onPrimary,
      fontSize: 12,
      fontWeight: '700',
    },
    frequencySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      padding: 12,
      borderWidth: 1,
      borderRadius: 8,
    },
    frequencyInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    frequencyLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 40,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      marginBottom: 20,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderWidth: 1,
      borderRadius: 12,
      marginBottom: 10,
    },
    optionInfo: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: 13,
    },
    closeButton: {
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
}

export default NotificationFrequencyPicker;
