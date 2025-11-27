import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ComprehensiveDisclaimer from '../../../components/ComprehensiveDisclaimer';
import { GapView } from '../../../components/GapView';
import { neurodivergentThemes, useNeurodivergent } from '../../../context/NeurodivergentContext';
import { MAX_FONT_SCALE } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';

export default function NeurodivergentSettingsScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { preferences, updatePreference, resetToDefaults, enableProfile } = useNeurodivergent();
  const styles = createStyles(palette);
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileSelect = async (profile: 'adhd' | 'autism' | 'dyslexia' | 'sensory-processing') => {
    Alert.alert(
      t('neurodivergent.profile.confirmTitle', 'Apply Profile Settings?'),
      t('neurodivergent.profile.confirmMessage', 'This will override your current preferences with optimized settings for {{profile}}.', { profile }),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.apply', 'Apply'),
          onPress: async () => {
            setIsLoading(true);
            await enableProfile(profile);
            setIsLoading(false);
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      t('neurodivergent.reset.title', 'Reset All Settings?'),
      t('neurodivergent.reset.message', 'This will restore all neurodivergent preferences to their default values.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.reset', 'Reset'),
          style: 'destructive',
          onPress: resetToDefaults,
        },
      ]
    );
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
        disabled={disabled || isLoading}
        trackColor={{ false: palette.muted, true: palette.primary }}
        thumbColor={value ? palette.surface : palette.text}
      />
    </View>
  );

  const ProfileButton = ({ 
    profile, 
    title, 
    description, 
    icon 
  }: {
    profile: 'adhd' | 'autism' | 'dyslexia' | 'sensory-processing';
    title: string;
    description: string;
    icon: string;
  }) => (
    <TouchableOpacity
      style={styles.profileButton}
      onPress={() => handleProfileSelect(profile)}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${description}`}
    >
      <Text style={styles.profileIcon}>{icon}</Text>
      <View style={styles.profileContent}>
        <Text style={styles.profileTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {title}
        </Text>
        <Text style={styles.profileDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ThemeButton = ({ 
    themeKey, 
    theme 
  }: {
    themeKey: string;
    theme: any;
  }) => (
    <TouchableOpacity
      style={[
        styles.themeButton,
        preferences.theme === themeKey && styles.themeButtonSelected
      ]}
      onPress={() => updatePreference('theme', themeKey as any)}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={`${theme.name}: ${theme.description}`}
    >
      <Text style={styles.themeTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {theme.name}
      </Text>
      <Text style={styles.themeDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {theme.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('neurodivergent.title', 'Neurodivergent Support')}
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('neurodivergent.subtitle', 'Customize your experience for optimal comfort and accessibility')}
          </Text>
        </View>

        <ComprehensiveDisclaimer type="cultural-safety" compact={true} />

        {/* Quick Profiles */}
        <SectionHeader 
          title={t('neurodivergent.profiles.title', 'Quick Setup Profiles')}
          description={t('neurodivergent.profiles.description', 'Apply optimized settings for common neurodivergent needs')}
        />
        
        <ProfileButton
          profile="adhd"
          title={t('neurodivergent.profiles.adhd', 'ADHD Support')}
          description={t('neurodivergent.profiles.adhdDesc', 'Focus aids, time awareness, task management')}
          icon="🎯"
        />
        
        <ProfileButton
          profile="autism"
          title={t('neurodivergent.profiles.autism', 'Autism Support')}
          description={t('neurodivergent.profiles.autismDesc', 'Sensory-friendly, clear communication, predictable interface')}
          icon="🧩"
        />
        
        <ProfileButton
          profile="dyslexia"
          title={t('neurodivergent.profiles.dyslexia', 'Dyslexia Support')}
          description={t('neurodivergent.profiles.dyslexiaDesc', 'Reading aids, alternative formats, clear typography')}
          icon="📖"
        />
        
        <ProfileButton
          profile="sensory-processing"
          title={t('neurodivergent.profiles.sensory', 'Sensory Processing Support')}
          description={t('neurodivergent.profiles.sensoryDesc', 'Reduced stimulation, minimal interface, gentle interactions')}
          icon="🌈"
        />

        {/* Visual Themes */}
        <SectionHeader 
          title={t('neurodivergent.themes.title', 'Sensory-Friendly Themes')}
          description={t('neurodivergent.themes.description', 'Choose colors that work best for your visual processing')}
        />
        
        <GapView gap={8} style={styles.themeGrid}>
          {Object.entries(neurodivergentThemes).map(([key, theme]) => (
            <ThemeButton key={key} themeKey={key} theme={theme} />
          ))}
        </GapView>

        {/* Sensory Preferences */}
        <SectionHeader 
          title={t('neurodivergent.sensory.title', 'Sensory Preferences')}
          description={t('neurodivergent.sensory.description', 'Adjust visual and interaction elements for comfort')}
        />
        
        <SettingItem
          title={t('neurodivergent.sensory.reducedMotion', 'Reduced Motion')}
          description={t('neurodivergent.sensory.reducedMotionDesc', 'Minimize animations and transitions')}
          value={preferences.reducedMotion}
          onValueChange={(value) => updatePreference('reducedMotion', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.sensory.highContrast', 'High Contrast')}
          description={t('neurodivergent.sensory.highContrastDesc', 'Stronger color contrasts for better visibility')}
          value={preferences.highContrast}
          onValueChange={(value) => updatePreference('highContrast', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.sensory.colorBlindFriendly', 'Color Blind Friendly')}
          description={t('neurodivergent.sensory.colorBlindDesc', 'Use patterns and shapes in addition to color')}
          value={preferences.colorBlindFriendly}
          onValueChange={(value) => updatePreference('colorBlindFriendly', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.sensory.sensoryFriendly', 'Sensory-Friendly Mode')}
          description={t('neurodivergent.sensory.sensoryFriendlyDesc', 'Reduce overstimulating elements')}
          value={preferences.sensoryFriendlyMode}
          onValueChange={(value) => updatePreference('sensoryFriendlyMode', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.sensory.minimal', 'Minimal Interface')}
          description={t('neurodivergent.sensory.minimalDesc', 'Hide non-essential interface elements')}
          value={preferences.minimalInterface}
          onValueChange={(value) => updatePreference('minimalInterface', value)}
        />

        {/* Focus & Attention */}
        <SectionHeader 
          title={t('neurodivergent.focus.title', 'Focus & Attention')}
          description={t('neurodivergent.focus.description', 'Tools to help maintain focus and manage attention')}
        />
        
        <SettingItem
          title={t('neurodivergent.focus.focusMode', 'Focus Mode')}
          description={t('neurodivergent.focus.focusModeDesc', 'Hide distracting elements while working')}
          value={preferences.focusMode}
          onValueChange={(value) => updatePreference('focusMode', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.focus.distractionReduction', 'Distraction Reduction')}
          description={t('neurodivergent.focus.distractionDesc', 'Minimize notifications and visual noise')}
          value={preferences.distractionReduction}
          onValueChange={(value) => updatePreference('distractionReduction', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.focus.breakReminders', 'Task Break Reminders')}
          description={t('neurodivergent.focus.breakDesc', 'Gentle reminders to take breaks during long tasks')}
          value={preferences.taskBreakReminders}
          onValueChange={(value) => updatePreference('taskBreakReminders', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.focus.timeAwareness', 'Time Awareness')}
          description={t('neurodivergent.focus.timeDesc', 'Show time estimates and progress indicators')}
          value={preferences.timeAwareness}
          onValueChange={(value) => updatePreference('timeAwareness', value)}
        />

        {/* Executive Function */}
        <SectionHeader 
          title={t('neurodivergent.executive.title', 'Executive Function Support')}
          description={t('neurodivergent.executive.description', 'Tools to help with planning, organization, and task completion')}
        />
        
        <SettingItem
          title={t('neurodivergent.executive.stepByStep', 'Step-by-Step Guidance')}
          description={t('neurodivergent.executive.stepByStepDesc', 'Break complex tasks into clear steps')}
          value={preferences.stepByStepGuidance}
          onValueChange={(value) => updatePreference('stepByStepGuidance', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.executive.visualProgress', 'Visual Progress Indicators')}
          description={t('neurodivergent.executive.visualProgressDesc', 'Show clear progress through tasks and forms')}
          value={preferences.visualProgressIndicators}
          onValueChange={(value) => updatePreference('visualProgressIndicators', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.executive.taskChunking', 'Task Chunking')}
          description={t('neurodivergent.executive.taskChunkingDesc', 'Break large tasks into smaller, manageable pieces')}
          value={preferences.taskChunking}
          onValueChange={(value) => updatePreference('taskChunking', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.executive.priorityHighlighting', 'Priority Highlighting')}
          description={t('neurodivergent.executive.priorityDesc', 'Clearly mark important or urgent items')}
          value={preferences.priorityHighlighting}
          onValueChange={(value) => updatePreference('priorityHighlighting', value)}
        />

        {/* Cognitive Load */}
        <SectionHeader 
          title={t('neurodivergent.cognitive.title', 'Cognitive Load Management')}
          description={t('neurodivergent.cognitive.description', 'Reduce mental processing demands')}
        />
        
        <SettingItem
          title={t('neurodivergent.cognitive.simplifiedLanguage', 'Simplified Language')}
          description={t('neurodivergent.cognitive.simplifiedDesc', 'Use clear, direct language throughout the app')}
          value={preferences.simplifiedLanguage}
          onValueChange={(value) => updatePreference('simplifiedLanguage', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.cognitive.extraTime', 'Extra Processing Time')}
          description={t('neurodivergent.cognitive.extraTimeDesc', 'Allow more time for reading and decision-making')}
          value={preferences.extraProcessingTime}
          onValueChange={(value) => updatePreference('extraProcessingTime', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.cognitive.confirmations', 'Confirmation Dialogs')}
          description={t('neurodivergent.cognitive.confirmationsDesc', 'Ask for confirmation before important actions')}
          value={preferences.confirmationDialogs}
          onValueChange={(value) => updatePreference('confirmationDialogs', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.cognitive.undo', 'Undo Available')}
          description={t('neurodivergent.cognitive.undoDesc', 'Provide undo options for reversible actions')}
          value={preferences.undoAvailable}
          onValueChange={(value) => updatePreference('undoAvailable', value)}
        />

        {/* Communication */}
        <SectionHeader 
          title={t('neurodivergent.communication.title', 'Communication Preferences')}
          description={t('neurodivergent.communication.description', 'Adjust how information is presented and communicated')}
        />
        
        <SettingItem
          title={t('neurodivergent.communication.literal', 'Literal Language')}
          description={t('neurodivergent.communication.literalDesc', 'Avoid idioms, metaphors, and unclear expressions')}
          value={preferences.literalLanguage}
          onValueChange={(value) => updatePreference('literalLanguage', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.communication.clearInstructions', 'Clear Instructions')}
          description={t('neurodivergent.communication.clearDesc', 'Provide explicit, detailed instructions for all tasks')}
          value={preferences.clearInstructions}
          onValueChange={(value) => updatePreference('clearInstructions', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.communication.alternativeFormats', 'Alternative Formats')}
          description={t('neurodivergent.communication.alternativeDesc', 'Offer information in multiple formats (text, audio, visual)')}
          value={preferences.alternativeFormats}
          onValueChange={(value) => updatePreference('alternativeFormats', value)}
        />

        {/* Interaction */}
        <SectionHeader 
          title={t('neurodivergent.interaction.title', 'Interaction Preferences')}
          description={t('neurodivergent.interaction.description', 'Customize how you interact with the app')}
        />
        
        <SettingItem
          title={t('neurodivergent.interaction.extendedTargets', 'Extended Touch Targets')}
          description={t('neurodivergent.interaction.extendedDesc', 'Make buttons and links easier to tap accurately')}
          value={preferences.extendedTouchTargets}
          onValueChange={(value) => updatePreference('extendedTouchTargets', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.interaction.gestureAlternatives', 'Gesture Alternatives')}
          description={t('neurodivergent.interaction.gestureDesc', 'Provide button alternatives to gesture controls')}
          value={preferences.gestureAlternatives}
          onValueChange={(value) => updatePreference('gestureAlternatives', value)}
        />
        
        <SettingItem
          title={t('neurodivergent.interaction.voiceControl', 'Voice Control Friendly')}
          description={t('neurodivergent.interaction.voiceDesc', 'Optimize interface for voice control users')}
          value={preferences.voiceControlFriendly}
          onValueChange={(value) => updatePreference('voiceControlFriendly', value)}
        />

        {/* Reset Button */}
        <View style={styles.resetSection}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={t('neurodivergent.reset.accessibility', 'Reset all neurodivergent settings to defaults')}
          >
            <Text style={styles.resetButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('neurodivergent.reset.button', 'Reset All Settings')}
            </Text>
          </TouchableOpacity>
        </View>
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
      flexDirection: 'row',
      alignItems: 'center',
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
      marginRight: 16,
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
    },
    disabledText: {
      opacity: 0.6,
    },
    profileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: palette.surface,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    profileIcon: {
      fontSize: 24,
      marginRight: 16,
    },
    profileContent: {
      flex: 1,
    },
    profileTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    profileDescription: {
      fontSize: 14,
      color: palette.textSecondary,
      lineHeight: 18,
    },
    themeGrid: {
    },
    themeButton: {
      padding: 16,
      backgroundColor: palette.surface,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    themeButtonSelected: {
      borderColor: palette.primary,
      backgroundColor: palette.primary + '10',
    },
    themeTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: palette.text,
      marginBottom: 4,
    },
    themeDescription: {
      fontSize: 14,
      color: palette.textSecondary,
    },
    resetSection: {
      marginTop: 32,
      marginBottom: 32,
      alignItems: 'center',
    },
    resetButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: palette.error,
      borderRadius: 8,
    },
    resetButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.surface,
    },
  });
}