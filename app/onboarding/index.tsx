/**
 * Personalized Onboarding Wizard
 * 
 * Collects user profile during signup to personalize the experience:
 * - Role (person with disability, supporter, ally, advocate)
 * - Disability types (if applicable)
 * - Energy patterns
 * - Primary needs
 * - Accessibility preferences
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { GapView } from '../../components/GapView';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import type { DisabilityProfile } from '../../services/disabilityWizard';
import { updateDisabilityProfile } from '../../services/disabilityWizard';
import { useAppPalette } from '../../theme/usePalette';
import { logError } from '../../utils/errorLogger';

type UserRole = 'person_with_disability' | 'supporter' | 'ally' | 'advocate' | 'prefer_not_to_say';

type DisabilityType = 'physical' | 'cognitive' | 'sensory' | 'mental_health' | 'chronic_illness' | 'neurodivergent' | 'multiple';

type EnergyPattern = 'morning' | 'afternoon' | 'evening' | 'variable';

type PrimaryNeed = 'legal_help' | 'health_tracking' | 'community' | 'education' | 'advocacy_tools' | 'all';

export default function OnboardingWizard() {
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useAppPalette();
  const styles = createStyles(palette);
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [disabilityTypes, setDisabilityTypes] = useState<DisabilityType[]>([]);
  const [energyPattern, setEnergyPattern] = useState<EnergyPattern | null>(null);
  const [primaryNeeds, setPrimaryNeeds] = useState<PrimaryNeed[]>([]);
  const [saving, setSaving] = useState(false);
  
  const totalSteps = role === 'person_with_disability' ? 4 : 3;
  
  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save profile and complete onboarding
      await saveProfile();
    }
  };
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  
  const handleSkip = async () => {
    // Save minimal profile and continue
    await saveProfile();
  };
  
  const saveProfile = async () => {
    setSaving(true);
    try {
      const profile: Partial<DisabilityProfile> = {
        disabilityTypes: disabilityTypes.length > 0 ? disabilityTypes : [],
        energyPeakHours: getEnergyHours(energyPattern),
        cognitiveLoadPreference: 'variable',
        screenReaderUser: false, // Will be detected or set in settings
        reducedMotion: false,
        highContrast: false,
        simplifiedLanguage: false,
        preferredFormats: ['text'],
        independenceLevel: role === 'person_with_disability' ? 'some_support' : 'full',
        lastUpdated: Date.now(),
      };
      
      await updateDisabilityProfile(profile);
      
      // Navigate to first7 onboarding
      router.replace('/onboarding/first7');
    } catch (error) {
      logError('OnboardingWizard', 'Failed to save onboarding profile', error);
      // Continue anyway
      router.replace('/onboarding/first7');
    } finally {
      setSaving(false);
    }
  };
  
  const canProceed = () => {
    if (step === 1) return role !== null;
    if (step === 2 && role === 'person_with_disability') return disabilityTypes.length > 0;
    if (step === (role === 'person_with_disability' ? 3 : 2)) return energyPattern !== null;
    if (step === (role === 'person_with_disability' ? 4 : 3)) return primaryNeeds.length > 0;
    return false;
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="color-wand" size={32} color={palette.primary} />
        </View>
        <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('onboarding.wizard.title', 'Personalize Your Experience')}
        </Text>
        <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('onboarding.wizard.subtitle', 'Help us tailor 3mpwr to your needs')}
        </Text>
      </View>
      
      {/* Progress */}
      <GapView gap={8} style={styles.progress}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < step && styles.progressDotComplete,
              i === step - 1 && styles.progressDotActive,
            ]}
          />
        ))}
      </GapView>
      
      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && <RoleStep role={role} setRole={setRole} palette={palette} t={t} styles={styles} />}
        {step === 2 && role === 'person_with_disability' && (
          <DisabilityTypesStep types={disabilityTypes} setTypes={setDisabilityTypes} palette={palette} t={t} styles={styles} />
        )}
        {step === (role === 'person_with_disability' ? 3 : 2) && (
          <EnergyPatternStep pattern={energyPattern} setPattern={setEnergyPattern} palette={palette} t={t} styles={styles} />
        )}
        {step === (role === 'person_with_disability' ? 4 : 3) && (
          <PrimaryNeedsStep needs={primaryNeeds} setNeeds={setPrimaryNeeds} palette={palette} t={t} styles={styles} />
        )}
      </ScrollView>
      
      {/* Navigation */}
      <View style={styles.navigation}>
        <GapView gap={12} style={styles.navButtons}>
          {step > 1 && (
            <A11yPressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel={t('common.back', 'Back')}
              hitSlop={HIT_SLOP_8}
            >
              <GapView gap={8} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="arrow-back" size={20} color={palette.text} />
                <Text style={[styles.buttonText, { color: palette.text }]}>
                  {t('common.back', 'Back')}
                </Text>
              </GapView>
            </A11yPressable>
          )}
          
          <A11yPressable
            style={[styles.button, styles.buttonPrimary, !canProceed() && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!canProceed() || saving}
            accessibilityRole="button"
            accessibilityLabel={step < totalSteps ? t('common.next', 'Next') : t('common.finish', 'Finish')}
            hitSlop={HIT_SLOP_8}
          >
            <GapView gap={8} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[styles.buttonText, { color: palette.onPrimary }]}>
                {saving ? t('common.saving', 'Saving...') : step < totalSteps ? t('common.next', 'Next') : t('common.finish', 'Finish')}
              </Text>
              {!saving && <Ionicons name={step < totalSteps ? "arrow-forward" : "checkmark"} size={20} color={palette.onPrimary} />}
            </GapView>
          </A11yPressable>
        </GapView>
        
        <A11yPressable
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.wizard.skip', 'Skip for now')}
          hitSlop={HIT_SLOP_8}
        >
          <Text style={styles.skipText}>
            {t('onboarding.wizard.skip', 'Skip for now')}
          </Text>
        </A11yPressable>
      </View>
    </View>
  );
}

// ============================================================================
// Step Components
// ============================================================================

function RoleStep({ role, setRole, palette, t, styles }: any) {
  const roles: { value: UserRole; icon: string; label: string; description: string }[] = [
    {
      value: 'person_with_disability',
      icon: 'person',
      label: t('onboarding.role.pwd', 'Person with Disability'),
      description: t('onboarding.role.pwd.desc', 'Navigating disability rights and support'),
    },
    {
      value: 'supporter',
      icon: 'heart',
      label: t('onboarding.role.supporter', 'Family/Friend Supporter'),
      description: t('onboarding.role.supporter.desc', 'Supporting someone with a disability'),
    },
    {
      value: 'ally',
      icon: 'people',
      label: t('onboarding.role.ally', 'Ally/Advocate'),
      description: t('onboarding.role.ally.desc', 'Advocating for disability rights'),
    },
    {
      value: 'advocate',
      icon: 'ribbon',
      label: t('onboarding.role.advocate', 'Professional Advocate'),
      description: t('onboarding.role.advocate.desc', 'Working professionally in disability advocacy'),
    },
    {
      value: 'prefer_not_to_say',
      icon: 'help-circle-outline',
      label: t('onboarding.role.prefer_not', 'Prefer not to say'),
      description: t('onboarding.role.prefer_not.desc', 'I\'d rather not specify'),
    },
  ];
  
  return (
    <View>
      <Text style={styles.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('onboarding.role.question', 'Which best describes you?')}
      </Text>
      <Text style={styles.stepDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('onboarding.role.help', 'This helps us show you the most relevant features')}
      </Text>
      
      <GapView gap={12} style={styles.optionsGrid}>
        {roles.map((r) => (
          <OptionCard
            key={r.value}
            icon={r.icon}
            label={r.label}
            description={r.description}
            selected={role === r.value}
            onPress={() => setRole(r.value)}
            palette={palette}
            styles={styles}
          />
        ))}
      </GapView>
    </View>
  );
}

function DisabilityTypesStep({ types, setTypes, palette, t, styles }: any) {
  const disabilityOptions: { value: DisabilityType; icon: string; label: string }[] = [
    { value: 'physical', icon: 'accessibility', label: t('onboarding.disability.physical', 'Physical') },
    { value: 'cognitive', icon: 'brain', label: t('onboarding.disability.cognitive', 'Cognitive') },
    { value: 'sensory', icon: 'eye', label: t('onboarding.disability.sensory', 'Sensory') },
    { value: 'mental_health', icon: 'heart-half', label: t('onboarding.disability.mental', 'Mental Health') },
    { value: 'chronic_illness', icon: 'medkit', label: t('onboarding.disability.chronic', 'Chronic Illness') },
    { value: 'neurodivergent', icon: 'infinite', label: t('onboarding.disability.neuro', 'Neurodivergent') },
    { value: 'multiple', icon: 'grid', label: t('onboarding.disability.multiple', 'Multiple') },
  ];
  
  const toggleType = (type: DisabilityType) => {
    if (types.includes(type)) {
      setTypes(types.filter((t: DisabilityType) => t !== type));
    } else {
      setTypes([...types, type]);
    }
  };
  
  return (
    <View>
      <Text style={styles.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('onboarding.disability.question', 'What type(s) of disability?')}
      </Text>
      <Text style={styles.stepDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('onboarding.disability.help', 'Select all that apply. This helps us personalize tools.')}
      </Text>
      
      <GapView gap={10} style={styles.chipGrid}>
        {disabilityOptions.map((option) => (
          <Chip
            key={option.value}
            icon={option.icon}
            label={option.label}
            selected={types.includes(option.value)}
            onPress={() => toggleType(option.value)}
            palette={palette}
            styles={styles}
          />
        ))}
      </GapView>
    </View>
  );
}

function EnergyPatternStep({ pattern, setPattern, palette, t, styles }: any) {
  const patterns: { value: EnergyPattern; icon: string; label: string; description: string }[] = [
    {
      value: 'morning',
      icon: 'sunny',
      label: t('onboarding.energy.morning', 'Morning Person'),
      description: t('onboarding.energy.morning.desc', 'Most energy in the morning'),
    },
    {
      value: 'afternoon',
      icon: 'partly-sunny',
      label: t('onboarding.energy.afternoon', 'Afternoon Peak'),
      description: t('onboarding.energy.afternoon.desc', 'Peak energy in the afternoon'),
    },
    {
      value: 'evening',
      icon: 'moon',
      label: t('onboarding.energy.evening', 'Evening/Night'),
      description: t('onboarding.energy.evening.desc', 'More energy in the evening'),
    },
    {
      value: 'variable',
      icon: 'shuffle',
      label: t('onboarding.energy.variable', 'It Varies'),
      description: t('onboarding.energy.variable.desc', 'Energy levels change day to day'),
    },
  ];
  
  return (
    <View>
      <Text style={styles.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('onboarding.energy.question', 'When do you have the most energy?')}
      </Text>
      <Text style={styles.stepDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('onboarding.energy.help', 'We\'ll suggest features at your best times')}
      </Text>
      
      <GapView gap={12} style={styles.optionsGrid}>
        {patterns.map((p) => (
          <OptionCard
            key={p.value}
            icon={p.icon}
            label={p.label}
            description={p.description}
            selected={pattern === p.value}
            onPress={() => setPattern(p.value)}
            palette={palette}
            styles={styles}
          />
        ))}
      </GapView>
    </View>
  );
}

function PrimaryNeedsStep({ needs, setNeeds, palette, t, styles }: any) {
  const needsOptions: { value: PrimaryNeed; icon: string; label: string; description: string }[] = [
    {
      value: 'legal_help',
      icon: 'document-text',
      label: t('onboarding.needs.legal', 'Legal Help'),
      description: t('onboarding.needs.legal.desc', 'Appeals, letters, rights'),
    },
    {
      value: 'health_tracking',
      icon: 'heart-circle',
      label: t('onboarding.needs.health', 'Health Tracking'),
      description: t('onboarding.needs.health.desc', 'Symptoms, meds, wellness'),
    },
    {
      value: 'community',
      icon: 'people-circle',
      label: t('onboarding.needs.community', 'Community'),
      description: t('onboarding.needs.community.desc', 'Connect with others'),
    },
    {
      value: 'education',
      icon: 'school',
      label: t('onboarding.needs.education', 'Education'),
      description: t('onboarding.needs.education.desc', 'Learn about rights & resources'),
    },
    {
      value: 'advocacy_tools',
      icon: 'construct',
      label: t('onboarding.needs.tools', 'Advocacy Tools'),
      description: t('onboarding.needs.tools.desc', 'AI assistants, templates'),
    },
    {
      value: 'all',
      icon: 'apps',
      label: t('onboarding.needs.all', 'Everything'),
      description: t('onboarding.needs.all.desc', 'Show me all features'),
    },
  ];
  
  const toggleNeed = (need: PrimaryNeed) => {
    if (needs.includes(need)) {
      setNeeds(needs.filter((n: PrimaryNeed) => n !== need));
    } else {
      setNeeds([...needs, need]);
    }
  };
  
  return (
    <View>
      <Text style={styles.stepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('onboarding.needs.question', 'What are your primary needs?')}
      </Text>
      <Text style={styles.stepDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('onboarding.needs.help', 'Select all that interest you')}
      </Text>
      
      <GapView gap={12} style={styles.optionsGrid}>
        {needsOptions.map((need) => (
          <OptionCard
            key={need.value}
            icon={need.icon}
            label={need.label}
            description={need.description}
            selected={needs.includes(need.value)}
            onPress={() => toggleNeed(need.value)}
            palette={palette}
            styles={styles}
            small={true}
          />
        ))}
      </GapView>
    </View>
  );
}

// ============================================================================
// Shared Components
// ============================================================================

function OptionCard({ icon, label, description, selected, onPress, palette, styles, small }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionCard,
        selected && { ...styles.optionCardSelected, borderColor: palette.primary, backgroundColor: palette.primary + '15' },
        small && styles.optionCardSmall,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={HIT_SLOP_8}
    >
      <View style={[styles.optionIcon, { backgroundColor: selected ? palette.primary : palette.surface }]}>
        <Ionicons name={icon as any} size={small ? 20 : 24} color={selected ? palette.onPrimary : palette.primary} />
      </View>
      <Text style={[styles.optionLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {label}
      </Text>
      <Text style={[styles.optionDescription, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
        {description}
      </Text>
      {selected && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={20} color={palette.primary} />
        </View>
      )}
    </Pressable>
  );
}

function Chip({ icon, label, selected, onPress, palette, styles }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: selected ? palette.primary : palette.muted, backgroundColor: selected ? palette.primary + '15' : palette.surface },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={HIT_SLOP_8}
    >
      <GapView gap={6} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={icon as any} size={18} color={selected ? palette.primary : palette.text} />
        <Text style={[styles.chipLabel, { color: selected ? palette.primary : palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {label}
        </Text>
      </GapView>
    </Pressable>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getEnergyHours(pattern: EnergyPattern | null): number[] {
  switch (pattern) {
    case 'morning': return [6, 7, 8, 9, 10, 11];
    case 'afternoon': return [12, 13, 14, 15, 16, 17];
    case 'evening': return [18, 19, 20, 21, 22];
    case 'variable': return [9, 10, 11, 14, 15, 16]; // Default to morning + afternoon
    default: return [9, 10, 11, 14, 15, 16];
  }
}

// ============================================================================
// Styles
// ============================================================================

function createStyles(palette: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      padding: 20,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      alignItems: 'center',
    },
    headerIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: palette.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: palette.text,
      opacity: 0.7,
      textAlign: 'center',
    },
    progress: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: palette.muted,
    },
    progressDotActive: {
      width: 24,
      backgroundColor: palette.primary,
    },
    progressDotComplete: {
      backgroundColor: palette.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    stepTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    stepDescription: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.7,
      marginBottom: 24,
    },
    optionsGrid: {
    },
    optionCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: palette.muted,
      backgroundColor: palette.surface,
      position: 'relative',
    },
    optionCardSmall: {
      padding: 12,
    },
    optionCardSelected: {
      borderWidth: 2,
    },
    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 13,
      opacity: 0.8,
    },
    checkmark: {
      position: 'absolute',
      top: 12,
      right: 12,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    chipLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    navigation: {
      padding: 20,
      paddingBottom: Platform.OS === 'ios' ? 32 : 20,
      borderTopWidth: 1,
      borderTopColor: palette.muted,
      backgroundColor: palette.surface,
    },
    navButtons: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
    },
    buttonPrimary: {
      backgroundColor: palette.primary,
    },
    buttonSecondary: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    skipButton: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    skipText: {
      fontSize: 14,
      color: palette.text,
      opacity: 0.6,
    },
  });
}
