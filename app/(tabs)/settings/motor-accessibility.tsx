import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { DwellProgressIndicator } from '../../../components/DwellProgressIndicator';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { useMotorAccessibility } from '../../../context/MotorAccessibilityContext';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useDwellClick } from '../../../hooks/useDwellClick';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

export const options = { title: 'Motor Accessibility' };

export default function MotorAccessibilityScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  
  const { preferences, setPreferences, reset, isEnabled } = useMotorAccessibility();

  useAnnounceOnMount(t('motorAccessibility.title', 'Motor Accessibility Settings'));
  useFocusOnRefOnMount(titleRef);

  const handleReset = () => {
    Alert.alert(
      t('motorAccessibility.resetTitle', 'Reset Motor Accessibility'),
      t('motorAccessibility.resetMessage', 'This will reset all motor accessibility preferences to defaults. Continue?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.reset', 'Reset'),
          style: 'destructive',
          onPress: () => {
            reset();
            announce(t('motorAccessibility.resetSuccess', 'Motor accessibility reset to defaults'));
          },
        },
      ]
    );
  };

  // Test dwell-click button
  const testDwell = useDwellClick({
    onDwell: () => {
      announce(t('motorAccessibility.dwellTestSuccess', 'Dwell-click activated!'));
      Alert.alert(
        t('motorAccessibility.dwellTestTitle', 'Success!'),
        t('motorAccessibility.dwellTestMessage', 'Dwell-click is working correctly.')
      );
    },
    delay: preferences.dwellClickDelay,
    enabled: true,
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('motorAccessibility.title', 'Motor Accessibility')}
      </Text>
      <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('motorAccessibility.subtitle', 'Features for limited dexterity, tremors, one-handed use, and motor disabilities.')}
      </Text>

      {/* Status Banner */}
      {isEnabled && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>
            ✓ {t('motorAccessibility.statusActive', 'Motor accessibility features active')}
          </Text>
        </View>
      )}

      {/* Dwell-Click */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('motorAccessibility.dwellClick', 'Dwell-Click (Hover to Click)')}
          </Text>
          <Switch
            value={preferences.dwellClickEnabled}
            onValueChange={(enabled) => {
              setPreferences({ dwellClickEnabled: enabled });
              announce(
                enabled
                  ? t('motorAccessibility.dwellEnabled', 'Dwell-click enabled')
                  : t('motorAccessibility.dwellDisabled', 'Dwell-click disabled')
              );
            }}
            accessibilityLabel={t('motorAccessibility.dwellToggle', 'Toggle dwell-click')}
          />
        </View>
        <Text style={styles.helpText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('motorAccessibility.dwellHelp', 'Activate buttons by holding press for set time. No tap required.')}
        </Text>

        {preferences.dwellClickEnabled && (
          <>
            <Text style={styles.label} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('motorAccessibility.dwellDelay', 'Delay: {{delay}}ms', { delay: preferences.dwellClickDelay })}
            </Text>
            <Text style={styles.helpText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('motorAccessibility.sliderNote', 'Slider control coming soon. Default: 2000ms')}
            </Text>

            {/* Test Button */}
            <A11yPressable
              onPressIn={testDwell.handlePressIn}
              onPressOut={testDwell.handlePressOut}
              style={styles.testButton}
              accessibilityLabel={t('motorAccessibility.dwellTest', 'Test dwell-click')}
              hitSlop={HIT_SLOP_8}
            >
              {testDwell.isDwelling && <DwellProgressIndicator progress={testDwell.progress} />}
              <Text style={styles.testButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('motorAccessibility.dwellTestButton', 'Hold to Test')}
              </Text>
            </A11yPressable>
          </>
        )}
      </View>

      {/* Increased Touch Targets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('motorAccessibility.touchTargets', 'Increased Touch Targets')}
          </Text>
          <Switch
            value={preferences.increasedTouchTargets}
            onValueChange={(enabled) => {
              setPreferences({ increasedTouchTargets: enabled });
              announce(
                enabled
                  ? t('motorAccessibility.touchTargetsEnabled', 'Touch targets increased')
                  : t('motorAccessibility.touchTargetsDisabled', 'Touch targets default size')
              );
            }}
            accessibilityLabel={t('motorAccessibility.touchTargetsToggle', 'Toggle touch target size')}
          />
        </View>
        <Text style={styles.helpText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('motorAccessibility.touchTargetsHelp', 'Automatically increase button sizes to 64x64pt minimum for easier tapping.')}
        </Text>
      </View>

      {/* Tremor Compensation */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('motorAccessibility.tremor', 'Tremor Compensation')}
          </Text>
          <Switch
            value={preferences.tremorCompensation}
            onValueChange={(enabled) => {
              setPreferences({ tremorCompensation: enabled });
              announce(
                enabled
                  ? t('motorAccessibility.tremorEnabled', 'Tremor compensation enabled')
                  : t('motorAccessibility.tremorDisabled', 'Tremor compensation disabled')
              );
            }}
            accessibilityLabel={t('motorAccessibility.tremorToggle', 'Toggle tremor compensation')}
          />
        </View>
        <Text style={styles.helpText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('motorAccessibility.tremorHelp', 'Ignore rapid repeated taps and stabilize input for tremors or Parkinson\'s.')}
        </Text>
      </View>

      {/* One-Handed Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('motorAccessibility.oneHanded', 'One-Handed Mode')}
        </Text>
        <Text style={styles.helpText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('motorAccessibility.oneHandedHelp', 'Position controls for one-handed use (left or right hand).')}
        </Text>
        
        <View style={styles.radioGroup}>
          {(['both', 'left', 'right'] as const).map((mode) => (
            <A11yPressable
              key={mode}
              onPress={() => {
                setPreferences({ oneHandedMode: mode });
                announce(t(`motorAccessibility.oneHanded${mode}`, `One-handed mode: ${mode}`));
              }}
              style={[
                styles.radioButton,
                preferences.oneHandedMode === mode && styles.radioButtonActive,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: preferences.oneHandedMode === mode }}
              hitSlop={HIT_SLOP_8}
            >
              <Text
                style={[
                  styles.radioText,
                  preferences.oneHandedMode === mode && styles.radioTextActive,
                ]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t(`motorAccessibility.mode${mode}`, mode === 'both' ? 'Both Hands' : mode === 'left' ? 'Left Hand' : 'Right Hand')}
              </Text>
            </A11yPressable>
          ))}
        </View>
      </View>

      {/* Coming Soon Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('motorAccessibility.comingSoon', 'Coming Soon')}
        </Text>
        <Text style={styles.comingSoonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          • {t('motorAccessibility.stickyKeys', 'Sticky Keys (lock Shift/Ctrl without holding)')}
        </Text>
        <Text style={styles.comingSoonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          • {t('motorAccessibility.voiceCommands', 'Voice Commands (navigate with speech)')}
        </Text>
        <Text style={styles.comingSoonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          • {t('motorAccessibility.gestureSimplify', 'Gesture Simplification (replace swipes with taps)')}
        </Text>
      </View>

      {/* Reset Button */}
      <A11yPressable
        onPress={handleReset}
        style={styles.resetButton}
        accessibilityRole="button"
        accessibilityLabel={t('motorAccessibility.resetButton', 'Reset all motor accessibility settings')}
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.resetButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('motorAccessibility.resetButton', 'Reset to Defaults')}
        </Text>
      </A11yPressable>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.85,
      marginBottom: 16,
    },
    statusBanner: {
      backgroundColor: palette.success || palette.primary,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    statusText: {
      color: palette.onPrimary,
      fontWeight: '600',
      fontSize: 14,
    },
    section: {
      marginBottom: 24,
      padding: 16,
      backgroundColor: palette.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
      flex: 1,
    },
    helpText: {
      fontSize: 13,
      color: palette.text,
      opacity: 0.75,
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      color: palette.text,
      marginTop: 12,
      marginBottom: 4,
      fontWeight: '600',
    },
    slider: {
      width: '100%',
      height: 40,
    },
    testButton: {
      backgroundColor: palette.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 12,
      position: 'relative',
    },
    testButtonText: {
      color: palette.onPrimary,
      fontWeight: '700',
      fontSize: 16,
    },
    radioGroup: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    radioButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: palette.muted,
      alignItems: 'center',
    },
    radioButtonActive: {
      borderColor: palette.primary,
      backgroundColor: palette.primary + '20',
    },
    radioText: {
      fontSize: 14,
      color: palette.text,
    },
    radioTextActive: {
      color: palette.primary,
      fontWeight: '700',
    },
    comingSoonText: {
      fontSize: 13,
      color: palette.text,
      opacity: 0.7,
      marginBottom: 4,
    },
    resetButton: {
      backgroundColor: palette.surface,
      padding: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.muted,
      alignItems: 'center',
      marginTop: 8,
    },
    resetButtonText: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 14,
    },
  });
}
