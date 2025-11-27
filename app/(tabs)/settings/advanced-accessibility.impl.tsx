import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    // Slider, // Removed in newer React Native versions
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ComprehensiveDisclaimer from '../../../components/ComprehensiveDisclaimer';
import { GapView } from '../../../components/GapView';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';
import { logger } from '../../../utils/logger';

interface AdvancedAccessibilityPreferences {
  // Visual accessibility
  fontSize: number;
  lineSpacing: number;
  letterSpacing: number;
  colorContrast: number;
  cursorSize: number;
  focusIndicatorSize: number;
  
  // Motor accessibility
  touchTargetSize: number;
  gestureTimeout: number;
  dragThreshold: number;
  swipeThreshold: number;
  dwellTime: number;
  
  // Cognitive accessibility
  navigationMemory: boolean;
  breadcrumbTrails: boolean;
  contextualHelp: boolean;
  errorPrevention: boolean;
  undoRedoSupport: boolean;
  sessionTimeout: number;
  
  // Hearing accessibility
  visualAlerts: boolean;
  captionsEnabled: boolean;
  soundVisualization: boolean;
  vibrationPatterns: boolean;
  
  // Screen reader optimization
  descriptiveLabels: boolean;
  navigationShortcuts: boolean;
  structuredContent: boolean;
  alternativeText: boolean;
  
  // Seizure and vestibular
  animationControl: 'none' | 'reduced' | 'essential-only';
  parallaxReduction: boolean;
  flashingContent: boolean;
  autoplayControl: boolean;
  
  // Input methods
  voiceControl: boolean;
  eyeTracking: boolean;
  switchControl: boolean;
  stickyKeys: boolean;
  slowKeys: boolean;
  bounceKeys: boolean;
  
  // Emergency features
  panicButton: boolean;
  emergencyContacts: boolean;
  medicalAlert: boolean;
  locationSharing: boolean;
}

const defaultPreferences: AdvancedAccessibilityPreferences = {
  fontSize: 16,
  lineSpacing: 1.2,
  letterSpacing: 0,
  colorContrast: 1.0,
  cursorSize: 1.0,
  focusIndicatorSize: 1.0,
  touchTargetSize: 44,
  gestureTimeout: 1000,
  dragThreshold: 10,
  swipeThreshold: 50,
  dwellTime: 1000,
  navigationMemory: false,
  breadcrumbTrails: false,
  contextualHelp: false,
  errorPrevention: false,
  undoRedoSupport: false,
  sessionTimeout: 30,
  visualAlerts: false,
  captionsEnabled: false,
  soundVisualization: false,
  vibrationPatterns: false,
  descriptiveLabels: false,
  navigationShortcuts: false,
  structuredContent: false,
  alternativeText: false,
  animationControl: 'reduced',
  parallaxReduction: false,
  flashingContent: false,
  autoplayControl: false,
  voiceControl: false,
  eyeTracking: false,
  switchControl: false,
  stickyKeys: false,
  slowKeys: false,
  bounceKeys: false,
  panicButton: false,
  emergencyContacts: false,
  medicalAlert: false,
  locationSharing: false,
};

export default function AdvancedAccessibilityScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const [preferences, setPreferences] = useState<AdvancedAccessibilityPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);
  const styles = createStyles(palette);

  React.useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('advanced-accessibility-preferences:v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      logger.warn('Failed to load advanced accessibility preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const savePreferences = async (newPreferences: AdvancedAccessibilityPreferences) => {
    try {
      await AsyncStorage.setItem('advanced-accessibility-preferences:v1', JSON.stringify(newPreferences));
    } catch (error) {
      logger.warn('Failed to save advanced accessibility preferences:', error);
    }
  };

  const updatePreference = async <K extends keyof AdvancedAccessibilityPreferences>(
    key: K,
    value: AdvancedAccessibilityPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  const SectionHeader = ({ title, description }: { title: string; description?: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {title}
      </Text>
      {description && (
        <Text style={styles.sectionDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {description}
        </Text>
      )}
    </View>
  );

  const SettingItem = ({ 
    title, 
    description, 
    value, 
    onValueChange, 
    disabled = false 
  }: {
    title: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, disabled && styles.disabledText]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.settingDescription, disabled && styles.disabledText]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: palette.muted, true: palette.primary }}
        thumbColor={value ? palette.surface : palette.text}
      />
    </View>
  );

  const SliderItem = ({
    title,
    description,
    value,
    onValueChange: _onValueChange,
    minimumValue,
    maximumValue,
    step: _step = 1,
    unit = '',
  }: {
    title: string;
    description?: string;
    value: number;
    onValueChange: (value: number) => void;
    minimumValue: number;
    maximumValue: number;
    step?: number;
    unit?: string;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {title}
        </Text>
        {description && (
          <Text style={styles.settingDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {description}
          </Text>
        )}
        <View style={styles.sliderContainer}>
          {/* Mock Slider implementation - would use @react-native-community/slider in production */}
          <View style={[styles.slider, { backgroundColor: palette.text + '20' }]}>
            <View 
              style={{ 
                backgroundColor: palette.text, 
                height: 4, 
                width: `${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%` 
              }} 
            />
          </View>
          <Text style={styles.sliderValue} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {Math.round(value * 100) / 100}{unit}
          </Text>
        </View>
      </View>
    </View>
  );

  const SelectItem = ({
    title,
    description,
    value,
    options,
    onValueChange,
  }: {
    title: string;
    description?: string;
    value: string;
    options: { label: string; value: string }[];
    onValueChange: (value: string) => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {title}
        </Text>
        {description && (
          <Text style={styles.settingDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {description}
          </Text>
        )}
        <GapView gap={8} style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                value === option.value && styles.optionButtonSelected
              ]}
              onPress={() => onValueChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: value === option.value }}
            >
              <Text style={[
                styles.optionText,
                value === option.value && styles.optionTextSelected
              ]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </GapView>
      </View>
    </View>
  );

  const QuickSetupButton = ({ 
    title, 
    description, 
    icon,
    onPress 
  }: {
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.quickSetupButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${description}`}
    >
      <Text style={styles.quickSetupIcon}>{icon}</Text>
      <View style={styles.quickSetupContent}>
        <Text style={styles.quickSetupTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {title}
        </Text>
        <Text style={styles.quickSetupDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleQuickSetup = (setupType: 'low-vision' | 'motor-impairment' | 'cognitive' | 'hearing') => {
    let setupPreferences: Partial<AdvancedAccessibilityPreferences> = {};

    switch (setupType) {
      case 'low-vision':
        setupPreferences = {
          fontSize: 24,
          lineSpacing: 1.5,
          letterSpacing: 0.1,
          colorContrast: 1.5,
          focusIndicatorSize: 2.0,
          touchTargetSize: 48,
          descriptiveLabels: true,
          alternativeText: true,
          structuredContent: true,
        };
        break;
      case 'motor-impairment':
        setupPreferences = {
          touchTargetSize: 48,
          gestureTimeout: 2000,
          dragThreshold: 20,
          dwellTime: 2000,
          stickyKeys: true,
          slowKeys: true,
          switchControl: true,
          undoRedoSupport: true,
        };
        break;
      case 'cognitive':
        setupPreferences = {
          navigationMemory: true,
          breadcrumbTrails: true,
          contextualHelp: true,
          errorPrevention: true,
          undoRedoSupport: true,
          sessionTimeout: 60,
          animationControl: 'none',
          autoplayControl: true,
        };
        break;
      case 'hearing':
        setupPreferences = {
          visualAlerts: true,
          captionsEnabled: true,
          soundVisualization: true,
          vibrationPatterns: true,
          alternativeText: true,
        };
        break;
    }

    Alert.alert(
      t('accessibility.quickSetup.confirmTitle', 'Apply Quick Setup?'),
      t('accessibility.quickSetup.confirmMessage', 'This will apply optimized settings for {{type}}. You can adjust individual settings afterwards.', { type: setupType }),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.apply', 'Apply'),
          onPress: async () => {
            const newPreferences = { ...preferences, ...setupPreferences };
            setPreferences(newPreferences);
            await savePreferences(newPreferences);
          },
        },
      ]
    );
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('accessibility.advanced.title', 'Advanced Accessibility Settings')}
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('accessibility.advanced.subtitle', 'Fine-tune accessibility features for your specific needs')}
          </Text>
        </View>

        <ComprehensiveDisclaimer type="medical" compact={true} />

        {/* Quick Setup */}
        <SectionHeader 
          title={t('accessibility.quickSetup.title', 'Quick Setup Profiles')}
          description={t('accessibility.quickSetup.description', 'Apply optimized settings for common accessibility needs')}
        />
        
        <QuickSetupButton
          title={t('accessibility.quickSetup.lowVision', 'Low Vision Support')}
          description={t('accessibility.quickSetup.lowVisionDesc', 'Larger text, high contrast, enhanced focus indicators')}
          icon="👁️"
          onPress={() => handleQuickSetup('low-vision')}
        />
        
        <QuickSetupButton
          title={t('accessibility.quickSetup.motor', 'Motor Impairment Support')}
          description={t('accessibility.quickSetup.motorDesc', 'Larger targets, longer timeouts, alternative input methods')}
          icon="🖱️"
          onPress={() => handleQuickSetup('motor-impairment')}
        />
        
        <QuickSetupButton
          title={t('accessibility.quickSetup.cognitive', 'Cognitive Support')}
          description={t('accessibility.quickSetup.cognitiveDesc', 'Navigation aids, error prevention, reduced complexity')}
          icon="🧠"
          onPress={() => handleQuickSetup('cognitive')}
        />
        
        <QuickSetupButton
          title={t('accessibility.quickSetup.hearing', 'Hearing Support')}
          description={t('accessibility.quickSetup.hearingDesc', 'Visual alerts, captions, vibration patterns')}
          icon="👂"
          onPress={() => handleQuickSetup('hearing')}
        />

        {/* Visual Accessibility */}
        <SectionHeader 
          title={t('accessibility.visual.title', 'Visual Accessibility')}
          description={t('accessibility.visual.description', 'Customize visual elements for better readability and visibility')}
        />
        
        <SliderItem
          title={t('accessibility.visual.fontSize', 'Font Size')}
          description={t('accessibility.visual.fontSizeDesc', 'Adjust text size throughout the app')}
          value={preferences.fontSize}
          onValueChange={(value) => updatePreference('fontSize', value)}
          minimumValue={12}
          maximumValue={32}
          unit="pt"
        />
        
        <SliderItem
          title={t('accessibility.visual.lineSpacing', 'Line Spacing')}
          description={t('accessibility.visual.lineSpacingDesc', 'Adjust space between lines of text')}
          value={preferences.lineSpacing}
          onValueChange={(value) => updatePreference('lineSpacing', value)}
          minimumValue={1.0}
          maximumValue={2.0}
          step={0.1}
          unit="x"
        />
        
        <SliderItem
          title={t('accessibility.visual.letterSpacing', 'Letter Spacing')}
          description={t('accessibility.visual.letterSpacingDesc', 'Adjust space between letters')}
          value={preferences.letterSpacing}
          onValueChange={(value) => updatePreference('letterSpacing', value)}
          minimumValue={0}
          maximumValue={0.3}
          step={0.05}
          unit="em"
        />
        
        <SliderItem
          title={t('accessibility.visual.colorContrast', 'Color Contrast')}
          description={t('accessibility.visual.colorContrastDesc', 'Enhance color contrast for better visibility')}
          value={preferences.colorContrast}
          onValueChange={(value) => updatePreference('colorContrast', value)}
          minimumValue={0.5}
          maximumValue={2.0}
          step={0.1}
          unit="x"
        />

        {/* Motor Accessibility */}
        <SectionHeader 
          title={t('accessibility.motor.title', 'Motor Accessibility')}
          description={t('accessibility.motor.description', 'Adjust interaction settings for motor impairments')}
        />
        
        <SliderItem
          title={t('accessibility.motor.touchTargetSize', 'Touch Target Size')}
          description={t('accessibility.motor.touchTargetDesc', 'Minimum size for buttons and interactive elements')}
          value={preferences.touchTargetSize}
          onValueChange={(value) => updatePreference('touchTargetSize', value)}
          minimumValue={32}
          maximumValue={64}
          unit="pt"
        />
        
        <SliderItem
          title={t('accessibility.motor.gestureTimeout', 'Gesture Timeout')}
          description={t('accessibility.motor.gestureTimeoutDesc', 'Time allowed to complete gestures')}
          value={preferences.gestureTimeout}
          onValueChange={(value) => updatePreference('gestureTimeout', value)}
          minimumValue={500}
          maximumValue={5000}
          step={250}
          unit="ms"
        />
        
        <SettingItem
          title={t('accessibility.motor.stickyKeys', 'Sticky Keys')}
          description={t('accessibility.motor.stickyKeysDesc', 'Press modifier keys one at a time instead of holding')}
          value={preferences.stickyKeys}
          onValueChange={(value) => updatePreference('stickyKeys', value)}
        />
        
        <SettingItem
          title={t('accessibility.motor.slowKeys', 'Slow Keys')}
          description={t('accessibility.motor.slowKeysDesc', 'Add delay before key presses are accepted')}
          value={preferences.slowKeys}
          onValueChange={(value) => updatePreference('slowKeys', value)}
        />

        {/* Cognitive Accessibility */}
        <SectionHeader 
          title={t('accessibility.cognitive.title', 'Cognitive Accessibility')}
          description={t('accessibility.cognitive.description', 'Features to reduce cognitive load and improve navigation')}
        />
        
        <SettingItem
          title={t('accessibility.cognitive.navigationMemory', 'Navigation Memory')}
          description={t('accessibility.cognitive.navigationMemoryDesc', 'Remember your navigation history and preferred paths')}
          value={preferences.navigationMemory}
          onValueChange={(value) => updatePreference('navigationMemory', value)}
        />
        
        <SettingItem
          title={t('accessibility.cognitive.breadcrumbTrails', 'Breadcrumb Trails')}
          description={t('accessibility.cognitive.breadcrumbDesc', 'Show your current location in the app hierarchy')}
          value={preferences.breadcrumbTrails}
          onValueChange={(value) => updatePreference('breadcrumbTrails', value)}
        />
        
        <SettingItem
          title={t('accessibility.cognitive.contextualHelp', 'Contextual Help')}
          description={t('accessibility.cognitive.contextualHelpDesc', 'Show relevant help information on each screen')}
          value={preferences.contextualHelp}
          onValueChange={(value) => updatePreference('contextualHelp', value)}
        />
        
        <SettingItem
          title={t('accessibility.cognitive.errorPrevention', 'Error Prevention')}
          description={t('accessibility.cognitive.errorPreventionDesc', 'Help prevent errors before they occur')}
          value={preferences.errorPrevention}
          onValueChange={(value) => updatePreference('errorPrevention', value)}
        />

        {/* Hearing Accessibility */}
        <SectionHeader 
          title={t('accessibility.hearing.title', 'Hearing Accessibility')}
          description={t('accessibility.hearing.description', 'Visual alternatives to audio content')}
        />
        
        <SettingItem
          title={t('accessibility.hearing.visualAlerts', 'Visual Alerts')}
          description={t('accessibility.hearing.visualAlertsDesc', 'Replace audio alerts with visual notifications')}
          value={preferences.visualAlerts}
          onValueChange={(value) => updatePreference('visualAlerts', value)}
        />
        
        <SettingItem
          title={t('accessibility.hearing.captions', 'Captions')}
          description={t('accessibility.hearing.captionsDesc', 'Show captions for audio and video content')}
          value={preferences.captionsEnabled}
          onValueChange={(value) => updatePreference('captionsEnabled', value)}
        />
        
        <SettingItem
          title={t('accessibility.hearing.soundVisualization', 'Sound Visualization')}
          description={t('accessibility.hearing.soundVisualizationDesc', 'Show visual representations of sounds')}
          value={preferences.soundVisualization}
          onValueChange={(value) => updatePreference('soundVisualization', value)}
        />

        {/* Animation Control */}
        <SectionHeader 
          title={t('accessibility.animation.title', 'Animation & Motion')}
          description={t('accessibility.animation.description', 'Control animations to prevent seizures and vestibular disorders')}
        />
        
        <SelectItem
          title={t('accessibility.animation.control', 'Animation Control')}
          description={t('accessibility.animation.controlDesc', 'Control how animations are displayed')}
          value={preferences.animationControl}
          options={[
            { label: t('accessibility.animation.none', 'No animations'), value: 'none' },
            { label: t('accessibility.animation.reduced', 'Reduced animations'), value: 'reduced' },
            { label: t('accessibility.animation.essential', 'Essential only'), value: 'essential-only' },
          ]}
          onValueChange={(value) => updatePreference('animationControl', value as any)}
        />
        
        <SettingItem
          title={t('accessibility.animation.parallaxReduction', 'Parallax Reduction')}
          description={t('accessibility.animation.parallaxDesc', 'Reduce parallax scrolling effects')}
          value={preferences.parallaxReduction}
          onValueChange={(value) => updatePreference('parallaxReduction', value)}
        />
        
        <SettingItem
          title={t('accessibility.animation.autoplayControl', 'Autoplay Control')}
          description={t('accessibility.animation.autoplayDesc', 'Prevent videos and animations from starting automatically')}
          value={preferences.autoplayControl}
          onValueChange={(value) => updatePreference('autoplayControl', value)}
        />

        {/* Emergency Features */}
        <SectionHeader 
          title={t('accessibility.emergency.title', 'Emergency Features')}
          description={t('accessibility.emergency.description', 'Quick access to emergency assistance')}
        />
        
        <SettingItem
          title={t('accessibility.emergency.panicButton', 'Panic Button')}
          description={t('accessibility.emergency.panicButtonDesc', 'Quick access to emergency contacts and services')}
          value={preferences.panicButton}
          onValueChange={(value) => updatePreference('panicButton', value)}
        />
        
        <SettingItem
          title={t('accessibility.emergency.medicalAlert', 'Medical Alert')}
          description={t('accessibility.emergency.medicalAlertDesc', 'Display critical medical information for emergencies')}
          value={preferences.medicalAlert}
          onValueChange={(value) => updatePreference('medicalAlert', value)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 16,
    },
    header: {
      paddingVertical: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: palette.textSecondary,
      lineHeight: 22,
    },
    sectionHeader: {
      marginTop: 32,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    sectionDescription: {
      fontSize: 14,
      color: palette.textSecondary,
      lineHeight: 20,
    },
    settingItem: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      backgroundColor: palette.surface,
      borderRadius: 8,
      marginBottom: 8,
    },
    settingItemDisabled: {
      opacity: 0.6,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: palette.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 14,
      color: palette.textSecondary,
      lineHeight: 18,
      marginBottom: 8,
    },
    disabledText: {
      opacity: 0.6,
    },
    sliderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    slider: {
      flex: 1,
      height: 40,
    },
    sliderValue: {
      fontSize: 14,
      color: palette.text,
      fontWeight: '600',
      marginLeft: 12,
      minWidth: 60,
      textAlign: 'right',
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    optionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.muted,
      backgroundColor: palette.surface,
    },
    optionButtonSelected: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    optionText: {
      fontSize: 14,
      color: palette.text,
      fontWeight: '500',
    },
    optionTextSelected: {
      color: palette.onPrimary,
    },
    quickSetupButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: palette.surface,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    quickSetupIcon: {
      fontSize: 24,
      marginRight: 16,
    },
    quickSetupContent: {
      flex: 1,
    },
    quickSetupTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    quickSetupDescription: {
      fontSize: 14,
      color: palette.textSecondary,
      lineHeight: 18,
    },
  });
}
