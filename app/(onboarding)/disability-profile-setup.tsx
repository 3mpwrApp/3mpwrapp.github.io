/**
 * Disability Profile Setup - Onboarding Wizard
 * 
 * Multi-step onboarding flow for creating a personalized disability profile
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import A11yPressable from '../../components/A11yPressable';
import { GapView } from '../../components/GapView';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { updateDisabilityProfile } from '../../services/disabilityWizard';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

// ============================================================================
// Type Definitions
// ============================================================================

type DisabilityType = 'physical' | 'cognitive' | 'sensory' | 'neurodivergent' | 'chronic_illness' | 'mental_health';
type EnergyPattern = 'morning' | 'afternoon' | 'evening' | 'variable';
type CognitiveLoadPref = 'light' | 'moderate' | 'heavy';
type AccessibilityNeed = 'screen_reader' | 'high_contrast' | 'large_text' | 'reduced_motion' | 'cognitive_support' | 'motor_assistance';

// ============================================================================
// Main Component
// ============================================================================

export default function DisabilityProfileSetup() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  
  // Profile data
  const [disabilities, setDisabilities] = useState<DisabilityType[]>([]);
  const [energyPattern, setEnergyPattern] = useState<EnergyPattern>('variable');
  const [cognitiveLoadPref, setCognitiveLoadPref] = useState<CognitiveLoadPref>('moderate');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<AccessibilityNeed[]>([]);
  
  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;
  
  // ============================================================================
  // Handlers
  // ============================================================================
  
  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };
  
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const handleSkip = async () => {
    // Skip profile setup, use defaults
    setSaving(true);
    await updateDisabilityProfile({
      disabilityTypes: [],
      energyPeakHours: [],
      cognitiveLoadPreference: 'moderate',
      screenReaderUser: false,
      reducedMotion: false,
      highContrast: false,
      simplifiedLanguage: false,
      preferredFormats: ['text'],
      independenceLevel: 'full',
      lastUpdated: Date.now(),
    });
    setSaving(false);
    router.replace('/');
  };
  
  const handleFinish = async () => {
    setSaving(true);
    
    // Convert our simple types to the full profile
    const disabilityTypes: Array<'physical' | 'cognitive' | 'sensory' | 'mental_health' | 'chronic_illness' | 'neurodivergent' | 'multiple'> = disabilities;
    const energyHours = energyPattern === 'morning' ? [6,7,8,9,10] : energyPattern === 'afternoon' ? [12,13,14,15,16] : energyPattern === 'evening' ? [18,19,20,21] : [];
    
    await updateDisabilityProfile({
      disabilityTypes,
      energyPeakHours: energyHours,
      cognitiveLoadPreference: (cognitiveLoadPref === 'heavy' ? 'moderate' : cognitiveLoadPref) as 'light' | 'moderate' | 'variable',
      screenReaderUser: accessibilityNeeds.includes('screen_reader'),
      reducedMotion: accessibilityNeeds.includes('reduced_motion'),
      highContrast: accessibilityNeeds.includes('high_contrast'),
      simplifiedLanguage: accessibilityNeeds.includes('cognitive_support'),
      preferredFormats: ['text'],
      independenceLevel: 'full',
      lastUpdated: Date.now(),
    });
    setSaving(false);
    router.replace('/');
  };
  
  // ============================================================================
  // Toggle Helpers
  // ============================================================================
  
  const toggleDisability = (type: DisabilityType) => {
    setDisabilities((prev) =>
      prev.includes(type) ? prev.filter((d) => d !== type) : [...prev, type]
    );
  };
  
  const toggleAccessibility = (need: AccessibilityNeed) => {
    setAccessibilityNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };
  
  // ============================================================================
  // Render Steps
  // ============================================================================
  
  const renderStep = () => {
    switch (step) {
      case 0:
        return <WelcomeStep styles={styles} palette={palette} />;
      case 1:
        return (
          <DisabilityTypesStep
            styles={styles}
            palette={palette}
            selected={disabilities}
            onToggle={toggleDisability}
          />
        );
      case 2:
        return (
          <EnergyPatternsStep
            styles={styles}
            palette={palette}
            selected={energyPattern}
            onSelect={setEnergyPattern}
            cognitiveLoadPref={cognitiveLoadPref}
            onCognitiveSelect={setCognitiveLoadPref}
          />
        );
      case 3:
        return (
          <AccessibilityNeedsStep
            styles={styles}
            palette={palette}
            selected={accessibilityNeeds}
            onToggle={toggleAccessibility}
          />
        );
      default:
        return null;
    }
  };
  
  // ============================================================================
  // Render
  // ============================================================================
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: palette.muted }]}>
          <View
            style={[styles.progressFill, { width: `${progress}%`, backgroundColor: palette.primary }]}
            accessibilityLabel={t('wizard.setup.progress', 'Setup progress: {{percent}}%', { percent: Math.round(progress) })}
          />
        </View>
        <Text style={styles.progressText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('wizard.setup.stepCount', 'Step {{current}} of {{total}}', { current: step + 1, total: totalSteps })}
        </Text>
      </View>
      
      {/* Step Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>
      
      {/* Navigation Buttons */}
      <GapView style={styles.footer} gap={12}>
        {step > 0 && (
          <A11yPressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={t('wizard.setup.back', 'Go back')}
            hitSlop={HIT_SLOP_8}
            disabled={saving}
          >
            <GapView
              style={[styles.button, styles.buttonSecondary, { borderColor: palette.primary }]}
              gap={8}
            >
              <Ionicons name="arrow-back" size={20} color={palette.primary} />
              <Text style={[styles.buttonText, styles.buttonTextSecondary, { color: palette.primary }]}>
                {t('wizard.setup.back', 'Back')}
              </Text>
            </GapView>
          </A11yPressable>
        )}
        
        <View style={{ flex: 1 }} />
        
        {step < totalSteps - 1 && (
          <A11yPressable
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel={t('wizard.setup.skip', 'Skip setup for now')}
            hitSlop={HIT_SLOP_8}
            disabled={saving}
          >
            <Text style={[styles.skipText, { color: palette.text }]}>
              {t('wizard.setup.skip', 'Skip')}
            </Text>
          </A11yPressable>
        )}
        
        <A11yPressable
          style={[styles.button, styles.buttonPrimary, { backgroundColor: palette.primary }]}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={step < totalSteps - 1 ? t('wizard.setup.next', 'Next step') : t('wizard.setup.finish', 'Finish setup')}
          hitSlop={HIT_SLOP_8}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={palette.onPrimary} />
          ) : (
            <GapView style={{flexDirection: 'row', alignItems: 'center'}} gap={8}>
              <Text style={styles.buttonText}>
                {step < totalSteps - 1 ? t('wizard.setup.next', 'Next') : t('wizard.setup.finish', 'Finish')}
              </Text>
              <Ionicons name={step < totalSteps - 1 ? 'arrow-forward' : 'checkmark'} size={20} color={palette.onPrimary} />
            </GapView>
          )}
        </A11yPressable>
      </GapView>
    </SafeAreaView>
  );
}

// ============================================================================
// STEP 0: Welcome
// ============================================================================

function WelcomeStep({ styles, palette }: any) {
  const { t } = useTranslation();
  
  return (
    <View style={styles.stepContainer}>
      <View style={[styles.stepIcon, { backgroundColor: palette.primary + '20' }]}>
        <Ionicons name="sparkles" size={48} color={palette.primary} />
      </View>
      
      <Text style={styles.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wizard.setup.welcome.title', 'Welcome to the Disability Wizard!')}
      </Text>
      
      <Text style={styles.stepDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wizard.setup.welcome.description', 
          "Let's personalize your experience! This wizard will help us understand your needs so we can recommend the right tools at the right time."
        )}
      </Text>
      
      <View style={styles.featureList}>
        <FeatureItem
          icon="checkmark-circle"
          text={t('wizard.setup.welcome.feature1', 'Disability-aware recommendations')}
          palette={palette}
        />
        <FeatureItem
          icon="calendar"
          text={t('wizard.setup.welcome.feature2', 'Daily rotation of features')}
          palette={palette}
        />
        <FeatureItem
          icon="git-network"
          text={t('wizard.setup.welcome.feature3', 'Smart interconnections between tools')}
          palette={palette}
        />
        <FeatureItem
          icon="battery-charging"
          text={t('wizard.setup.welcome.feature4', 'Energy-level matching')}
          palette={palette}
        />
      </View>
      
      <Text style={styles.privacyNote} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wizard.setup.welcome.privacy', 
          "🔒 Your profile stays on your device. You can skip this step or change these settings anytime."
        )}
      </Text>
    </View>
  );
}

function FeatureItem({ icon, text, palette }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
      <Ionicons name={icon} size={24} color={palette.primary} style={{ marginRight: 12 }} />
      <Text style={{ flex: 1, fontSize: 16, color: palette.text }} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {text}
      </Text>
    </View>
  );
}

// ============================================================================
// STEP 1: Disability Types
// ============================================================================

function DisabilityTypesStep({ styles, palette, selected, onToggle }: any) {
  const { t } = useTranslation();
  
  const options: { value: DisabilityType; label: string; icon: string; description: string }[] = [
    {
      value: 'physical',
      label: t('wizard.setup.disability.physical', 'Physical'),
      icon: 'accessibility',
      description: t('wizard.setup.disability.physical.desc', 'Mobility, chronic pain, motor challenges'),
    },
    {
      value: 'cognitive',
      label: t('wizard.setup.disability.cognitive', 'Cognitive'),
      icon: 'bulb',
      description: t('wizard.setup.disability.cognitive.desc', 'Memory, executive function, processing'),
    },
    {
      value: 'sensory',
      label: t('wizard.setup.disability.sensory', 'Sensory'),
      icon: 'eye',
      description: t('wizard.setup.disability.sensory.desc', 'Vision, hearing, sensory processing'),
    },
    {
      value: 'neurodivergent',
      label: t('wizard.setup.disability.neurodivergent', 'Neurodivergent'),
      icon: 'color-palette',
      description: t('wizard.setup.disability.neurodivergent.desc', 'ADHD, autism, dyslexia, etc.'),
    },
    {
      value: 'chronic_illness',
      label: t('wizard.setup.disability.chronic', 'Chronic Illness'),
      icon: 'medkit',
      description: t('wizard.setup.disability.chronic.desc', 'Ongoing health conditions'),
    },
    {
      value: 'mental_health',
      label: t('wizard.setup.disability.mental', 'Mental Health'),
      icon: 'heart',
      description: t('wizard.setup.disability.mental.desc', 'Anxiety, depression, PTSD, etc.'),
    },
  ];
  
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wizard.setup.disability.title', 'What describes your experience?')}
      </Text>
      
      <Text style={styles.stepDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wizard.setup.disability.subtitle', 'Select all that apply. This helps us recommend tools that match your needs.')}
      </Text>
      
      <GapView style={styles.optionsGrid} gap={12}>
        {options.map((option) => (
          <OptionCard
            key={option.value}
            icon={option.icon}
            label={option.label}
            description={option.description}
            selected={selected.includes(option.value)}
            onPress={() => onToggle(option.value)}
            palette={palette}
          />
        ))}
      </GapView>
    </View>
  );
}

// ============================================================================
// STEP 2: Energy & Cognitive Load
// ============================================================================

function EnergyPatternsStep({ styles, palette, selected, onSelect, cognitiveLoadPref, onCognitiveSelect }: any) {
  const { t } = useTranslation();
  
  const energyOptions: { value: EnergyPattern; label: string; icon: string; description: string }[] = [
    {
      value: 'morning',
      label: t('wizard.setup.energy.morning', 'Morning Person'),
      icon: 'sunny',
      description: t('wizard.setup.energy.morning.desc', 'Most energy early in the day'),
    },
    {
      value: 'afternoon',
      label: t('wizard.setup.energy.afternoon', 'Afternoon Peak'),
      icon: 'partly-sunny',
      description: t('wizard.setup.energy.afternoon.desc', 'Energy peaks in afternoon'),
    },
    {
      value: 'evening',
      label: t('wizard.setup.energy.evening', 'Night Owl'),
      icon: 'moon',
      description: t('wizard.setup.energy.evening.desc', 'More energy in the evening'),
    },
    {
      value: 'variable',
      label: t('wizard.setup.energy.variable', 'It Varies'),
      icon: 'shuffle',
      description: t('wizard.setup.energy.variable.desc', 'Energy levels change day to day'),
    },
  ];
  
  const cognitiveOptions: { value: CognitiveLoadPref; label: string; icon: string; description: string }[] = [
    {
      value: 'light',
      label: t('wizard.setup.cognitive.light', 'Light Tasks'),
      icon: 'leaf',
      description: t('wizard.setup.cognitive.light.desc', 'Prefer simple, low-effort activities'),
    },
    {
      value: 'moderate',
      label: t('wizard.setup.cognitive.moderate', 'Mixed Tasks'),
      icon: 'balance',
      description: t('wizard.setup.cognitive.moderate.desc', 'Mix of simple and complex'),
    },
    {
      value: 'heavy',
      label: t('wizard.setup.cognitive.heavy', 'Deep Work'),
      icon: 'flash',
      description: t('wizard.setup.cognitive.heavy.desc', 'Can handle complex tasks'),
    },
  ];
  
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wizard.setup.energy.title', 'When do you have the most energy?')}
      </Text>
      
      <Text style={styles.stepDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wizard.setup.energy.subtitle', "We'll suggest activities when you're most likely to have energy for them.")}
      </Text>
      
      <GapView style={styles.optionsGrid} gap={12}>
        {energyOptions.map((option) => (
          <OptionCard
            key={option.value}
            icon={option.icon}
            label={option.label}
            description={option.description}
            selected={selected === option.value}
            onPress={() => onSelect(option.value)}
            palette={palette}
          />
        ))}
      </GapView>
      
      <Text style={[styles.stepTitle, { marginTop: 24 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wizard.setup.cognitive.title', 'How much mental energy do you usually have?')}
      </Text>
      
      <GapView style={styles.optionsGrid} gap={12}>
        {cognitiveOptions.map((option) => (
          <OptionCard
            key={option.value}
            icon={option.icon}
            label={option.label}
            description={option.description}
            selected={cognitiveLoadPref === option.value}
            onPress={() => onCognitiveSelect(option.value)}
            palette={palette}
          />
        ))}
      </GapView>
    </View>
  );
}

// ============================================================================
// STEP 3: Accessibility Needs
// ============================================================================

function AccessibilityNeedsStep({ styles, palette, selected, onToggle }: any) {
  const { t } = useTranslation();
  
  const options: { value: AccessibilityNeed; label: string; icon: string; description: string }[] = [
    {
      value: 'screen_reader',
      label: t('wizard.setup.a11y.screenReader', 'Screen Reader'),
      icon: 'volume-high',
      description: t('wizard.setup.a11y.screenReader.desc', 'VoiceOver or TalkBack support'),
    },
    {
      value: 'high_contrast',
      label: t('wizard.setup.a11y.highContrast', 'High Contrast'),
      icon: 'contrast',
      description: t('wizard.setup.a11y.highContrast.desc', 'Better visibility for text'),
    },
    {
      value: 'large_text',
      label: t('wizard.setup.a11y.largeText', 'Large Text'),
      icon: 'text',
      description: t('wizard.setup.a11y.largeText.desc', 'Bigger fonts throughout app'),
    },
    {
      value: 'reduced_motion',
      label: t('wizard.setup.a11y.reducedMotion', 'Reduced Motion'),
      icon: 'hand-left',
      description: t('wizard.setup.a11y.reducedMotion.desc', 'Minimize animations'),
    },
    {
      value: 'cognitive_support',
      label: t('wizard.setup.a11y.cognitiveSupport', 'Cognitive Support'),
      icon: 'bulb',
      description: t('wizard.setup.a11y.cognitiveSupport.desc', 'Simplified interfaces, extra guidance'),
    },
    {
      value: 'motor_assistance',
      label: t('wizard.setup.a11y.motorAssistance', 'Motor Assistance'),
      icon: 'hand-right',
      description: t('wizard.setup.a11y.motorAssistance.desc', 'Larger tap targets, fewer gestures'),
    },
  ];
  
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wizard.setup.a11y.title', 'Which accessibility features help you?')}
      </Text>
      
      <Text style={styles.stepDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('wizard.setup.a11y.subtitle', "We'll optimize the interface for your needs.")}
      </Text>
      
      <GapView style={styles.optionsGrid} gap={12}>
        {options.map((option) => (
          <OptionCard
            key={option.value}
            icon={option.icon}
            label={option.label}
            description={option.description}
            selected={selected.includes(option.value)}
            onPress={() => onToggle(option.value)}
            palette={palette}
          />
        ))}
      </GapView>
    </View>
  );
}

// ============================================================================
// Option Card Component
// ============================================================================

function OptionCard({ icon, label, description, selected, onPress, palette }: any) {
  return (
    <A11yPressable
      style={[
        {
          flex: 1,
          minWidth: '45%',
          backgroundColor: selected ? palette.primary + '20' : palette.surface,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: selected ? palette.primary : palette.muted,
          padding: 16,
          marginBottom: 12,
        },
      ]}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${label}. ${description}`}
      hitSlop={HIT_SLOP_8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons name={icon as any} size={28} color={selected ? palette.primary : palette.text} />
        {selected && (
          <View style={{ marginLeft: 'auto' }}>
            <Ionicons name="checkmark-circle" size={24} color={palette.primary} />
          </View>
        )}
      </View>
      <Text
        style={{ fontSize: 16, fontWeight: '600', color: palette.text, marginBottom: 4 }}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {label}
      </Text>
      <Text
        style={{ fontSize: 13, color: palette.textSecondary }}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {description}
      </Text>
    </A11yPressable>
  );
}

// ============================================================================
// Styles
// ============================================================================

function createStyles(palette: any, factor: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    
    // Progress
    progressContainer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    progressText: {
      fontSize: Math.round(13 * factor),
      color: palette.textSecondary,
      textAlign: 'center',
    },
    
    // Content
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    
    // Steps
    stepContainer: {
      paddingVertical: 20,
    },
    stepIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 20,
    },
    stepTitle: {
      fontSize: Math.round(24 * factor),
      fontWeight: '700',
      color: palette.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    stepDescription: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 0.8,
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: Math.round(24 * factor),
    },
    featureList: {
      marginVertical: 20,
    },
    privacyNote: {
      fontSize: Math.round(14 * factor),
      color: palette.textSecondary,
      textAlign: 'center',
      marginTop: 20,
      fontStyle: 'italic',
    },
    
    // Options
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    
    // Footer
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: palette.muted,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
    },
    buttonPrimary: {
      minWidth: 120,
    },
    buttonSecondary: {
      borderWidth: 2,
      backgroundColor: 'transparent',
    },
    buttonText: {
      fontSize: Math.round(16 * factor),
      fontWeight: '600',
      color: palette.onPrimary,
    },
    buttonTextSecondary: {
      // color set inline
    },
    skipButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    skipText: {
      fontSize: Math.round(15 * factor),
      color: palette.textSecondary,
    },
  });
}
