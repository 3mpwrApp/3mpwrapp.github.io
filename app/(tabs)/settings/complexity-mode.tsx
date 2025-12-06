/**
 * Complexity Mode Settings
 * User-facing control for Simple/Standard/Power User modes
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { useComplexityMode } from '../../../store/complexityMode';
import { useAppPalette } from '../../../theme/usePalette';

export default function ComplexityModeSettings() {
  const palette = useAppPalette();
  const { mode, setMode, isBadDayMode, setBadDayMode } = useComplexityMode();

  const handleModeChange = async (newMode: 'simple' | 'standard' | 'power_user') => {
    await setMode(newMode);
    Alert.alert(
      'Mode Changed',
      newMode === 'simple' 
        ? 'Showing 5 core features only. Less overwhelm, easier navigation.'
        : newMode === 'standard'
        ? 'Showing 20 commonly used features. Balanced experience.'
        : 'Showing all 150+ features. Full power user experience.',
      [{ text: 'OK' }]
    );
  };

  const handleBadDayMode = async () => {
    const newState = !isBadDayMode;
    await setBadDayMode(newState);
    
    if (newState) {
      Alert.alert(
        '🌙 Bad Day Mode Activated',
        'Switched to Simple Mode automatically.\n\nOnly essential features visible:\n• Evidence Locker\n• Crisis Resources\n• Mood Tracker\n• Letter Wizard\n• Community Support\n\nTake care of yourself. ❤️',
        [{ text: 'Thank You' }]
      );
    } else {
      Alert.alert(
        '✨ Bad Day Mode Deactivated',
        'Welcome back! Your previous complexity mode has been restored.',
        [{ text: 'OK' }]
      );
    }
  };

  const modes = [
    {
      id: 'simple' as const,
      title: '🎯 Simple Mode',
      subtitle: '5 Core Features',
      description: 'Perfect for cognitive disabilities, fatigue, brain fog, or when you just need the basics. Shows only:\n\n• Evidence Locker\n• Letter Wizard (top 3 templates)\n• Crisis Resources\n• Mood Tracker\n• Community Support',
      bestFor: 'New users, cognitive disabilities, low energy days',
    },
    {
      id: 'standard' as const,
      title: '⚖️ Standard Mode',
      subtitle: '20 Common Features',
      description: 'Balanced experience with commonly used tools. Includes Simple features plus:\n\n• AI Advocate Translator\n• Wellness Tracking (Energy, Pacing)\n• Support Directory\n• Campaigns & Events\n• Profile & Settings',
      bestFor: 'Most users, balanced needs',
    },
    {
      id: 'power_user' as const,
      title: '⚡ Power User Mode',
      subtitle: 'All 150+ Features',
      description: 'Full feature set for experienced users who want access to everything:\n\n• All advocacy tools\n• All AI assistants\n• All trackers & templates\n• Advanced settings\n• Beta features',
      bestFor: 'Tech-savvy users, advocates, complex cases',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: palette.textSecondary,
      lineHeight: 24,
    },
    badDaySection: {
      backgroundColor: palette.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: isBadDayMode ? palette.primary : 'transparent',
    },
    badDayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    badDayTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
    },
    badDayDescription: {
      fontSize: 14,
      color: palette.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    badDayButton: {
      backgroundColor: isBadDayMode ? palette.primary : palette.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    badDayButtonText: {
      color: isBadDayMode ? palette.onPrimary : palette.text,
      fontSize: 16,
      fontWeight: '600',
    },
    modesSection: {
      gap: 16,
    },
    modeCard: {
      backgroundColor: palette.surface,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
    },
    modeCardActive: {
      borderColor: palette.primary,
    },
    modeCardInactive: {
      borderColor: 'transparent',
    },
    modeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    modeHeaderLeft: {
      flex: 1,
    },
    modeTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 4,
    },
    modeSubtitle: {
      fontSize: 14,
      color: palette.textSecondary,
    },
    modeDescription: {
      fontSize: 14,
      color: palette.text,
      lineHeight: 20,
      marginBottom: 12,
    },
    modeBestFor: {
      fontSize: 12,
      color: palette.textSecondary,
      fontStyle: 'italic',
      marginBottom: 12,
    },
    selectButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    selectButtonActive: {
      backgroundColor: palette.primary,
    },
    selectButtonInactive: {
      backgroundColor: palette.border,
    },
    selectButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    selectButtonTextActive: {
      color: palette.onPrimary,
    },
    selectButtonTextInactive: {
      color: palette.text,
    },
  });

  return (
    <ResponsiveScreenWrapper>
      <Stack.Screen
        options={{
          title: 'Complexity Mode',
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Experience</Text>
          <Text style={styles.subtitle}>
            Reduce feature overwhelm by selecting how many features you want to see. You can change this anytime.
          </Text>
        </View>

        {/* Bad Day Mode */}
        <View style={styles.badDaySection}>
          <View style={styles.badDayHeader}>
            <Text style={styles.badDayTitle}>🌙 Bad Day Mode</Text>
            {isBadDayMode && <Ionicons name="checkmark-circle" size={24} color={palette.primary} />}
          </View>
          <Text style={styles.badDayDescription}>
            Having a flare-up, brain fog, or just overwhelmed? Enable Bad Day Mode for one-tap simplification. Automatically switches to Simple Mode and hides everything except essential features.
          </Text>
          <Pressable
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.badDayButton}
            onPress={handleBadDayMode}
            accessibilityRole="button"
            accessibilityLabel={isBadDayMode ? 'Deactivate Bad Day Mode' : 'Activate Bad Day Mode'}
          >
            <Text style={styles.badDayButtonText}>
              {isBadDayMode ? '✓ Bad Day Mode Active' : 'Enable Bad Day Mode'}
            </Text>
          </Pressable>
        </View>

        {/* Mode Cards */}
        <View style={styles.modesSection}>
          {modes.map((modeConfig) => {
            const isActive = mode === modeConfig.id && !isBadDayMode;
            return (
              <View
                key={modeConfig.id}
                style={[
                  styles.modeCard,
                  isActive ? styles.modeCardActive : styles.modeCardInactive,
                ]}
              >
                <View style={styles.modeHeader}>
                  <View style={styles.modeHeaderLeft}>
                    <Text style={styles.modeTitle}>{modeConfig.title}</Text>
                    <Text style={styles.modeSubtitle}>{modeConfig.subtitle}</Text>
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={28} color={palette.primary} />}
                </View>
                <Text style={styles.modeDescription}>{modeConfig.description}</Text>
                <Text style={styles.modeBestFor}>Best for: {modeConfig.bestFor}</Text>
                <Pressable
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={[
                    styles.selectButton,
                    isActive ? styles.selectButtonActive : styles.selectButtonInactive,
                  ]}
                  onPress={() => handleModeChange(modeConfig.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${modeConfig.title}`}
                  disabled={isBadDayMode}
                >
                  <Text
                    style={[
                      styles.selectButtonText,
                      isActive ? styles.selectButtonTextActive : styles.selectButtonTextInactive,
                    ]}
                  >
                    {isActive ? '✓ Active' : 'Select This Mode'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}
