/**
 * QuickOnboardingBeta - Simplified onboarding for beta testers
 * 
 * Provides a streamlined 3-step onboarding instead of 9-step:
 * 1. Welcome + Essential disclaimers summary
 * 2. Core settings (complexity mode)
 * 3. Ready to go!
 * 
 * Full legal acceptance is still recorded, but UX is faster.
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HIT_SLOP_12 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { logEvent } from '../services/analytics';
import { useComplexityMode, type ComplexityMode } from '../store/complexityMode';
import { useAppPalette } from '../theme/usePalette';
import { createShadow } from '../utils/shadow';

import A11yPressable from './A11yPressable';
import GapView from './GapView';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

const QUICK_ONBOARDING_KEY = 'beta.quick_onboarding.completed';
const TERMS_STORAGE_KEY = 'empowr.legal.acceptance.v3';

interface QuickOnboardingBetaProps {
  /** Called when onboarding is complete */
  onComplete: () => void;
  /** Skip to specific step */
  initialStep?: 1 | 2 | 3;
}

type Step = 1 | 2 | 3;

export default function QuickOnboardingBeta({ 
  onComplete,
  initialStep = 1,
}: QuickOnboardingBetaProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const insets = useSafeAreaInsets();
  const { mode, setMode } = useComplexityMode();
  
  const [step, setStep] = useState<Step>(initialStep);
  const [_allAccepted, setAllAccepted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ComplexityMode>(mode);

  const handleAcceptAll = () => {
    setAllAccepted(true);
    logEvent('beta.onboarding.quick.disclaimers_accepted');
  };

  const handleModeSelect = (newMode: ComplexityMode) => {
    setSelectedMode(newMode);
    logEvent('beta.onboarding.quick.mode_selected', { mode: newMode });
  };

  const handleComplete = async () => {
    try {
      // Save full legal acceptance
      const acceptanceState = {
        termsVersion: '3.0',
        privacyVersion: '2.0',
        medicalDisclaimer: true,
        legalDisclaimer: true,
        financialDisclaimer: true,
        aiDisclaimer: true,
        crisisDisclaimer: true,
        emergencyDisclaimer: true,
        userResponsibility: true,
        dataOwnership: true,
        quickOnboardingUsed: true,
        acceptedAt: new Date().toISOString(),
      };
      
      await AsyncStorage?.setItem?.(TERMS_STORAGE_KEY, JSON.stringify(acceptanceState));
      await AsyncStorage?.setItem?.(QUICK_ONBOARDING_KEY, 'true');
      
      // Apply complexity mode
      setMode(selectedMode);
      
      logEvent('beta.onboarding.quick.completed', { 
        mode: selectedMode,
        steps_viewed: step,
      });
      
      onComplete();
    } catch {
      // Still complete even if storage fails
      onComplete();
    }
  };

  const goNext = () => {
    if (step < 3) {
      setStep((step + 1) as Step);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const openFullTerms = () => {
    Linking.openURL('https://3mpwrapp.pages.dev/terms/');
  };

  const openFullPrivacy = () => {
    Linking.openURL('https://3mpwrapp.pages.dev/privacy/');
  };

  const styles = createStyles(palette);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View 
            key={s} 
            style={[
              styles.progressDot,
              s === step && styles.progressDotActive,
              s < step && styles.progressDotComplete,
            ]} 
          />
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.emoji}>🧪</Text>
            <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('quickOnboarding.welcomeTitle', 'Welcome, Beta Tester!')}
            </Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('quickOnboarding.welcomeSubtitle', "Let's get you started quickly")}
            </Text>

            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                ⚠️ {t('quickOnboarding.importantTitle', 'Important: Quick Summary')}
              </Text>
              <Text style={styles.disclaimerText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('quickOnboarding.disclaimerSummary', 
                  '• This app provides INFORMATION only, not professional advice\n' +
                  '• NOT a substitute for medical, legal, or financial professionals\n' +
                  '• AI content may contain errors - always verify\n' +
                  '• In emergencies, call 911 or local crisis line\n' +
                  '• Your data stays on your device unless you choose cloud sync\n' +
                  '• You own all your data - delete anytime in Settings'
                )}
              </Text>

              <GapView style={styles.linkRow} gap={16}>
                <A11yPressable
                  onPress={openFullTerms}
                  style={styles.docLink}
                  accessibilityRole="link"
                  accessibilityLabel={t('quickOnboarding.readTerms', 'Read full terms of service')}
                  hitSlop={HIT_SLOP_12}
                >
                  <Ionicons name="document-text-outline" size={16} color={palette.primary} />
                  <Text style={styles.docLinkText}>Terms</Text>
                </A11yPressable>
                <A11yPressable
                  onPress={openFullPrivacy}
                  style={styles.docLink}
                  accessibilityRole="link"
                  accessibilityLabel={t('quickOnboarding.readPrivacy', 'Read full privacy policy')}
                  hitSlop={HIT_SLOP_12}
                >
                  <Ionicons name="shield-checkmark-outline" size={16} color={palette.primary} />
                  <Text style={styles.docLinkText}>Privacy</Text>
                </A11yPressable>
              </GapView>
            </View>

            <A11yPressable
              onPress={() => { handleAcceptAll(); goNext(); }}
              style={styles.primaryButton}
              accessibilityRole="button"
              accessibilityLabel={t('quickOnboarding.acceptContinue', 'I understand, continue')}
              hitSlop={HIT_SLOP_12}
            >
              <Text style={styles.primaryButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('quickOnboarding.acceptContinue', 'I Understand — Continue')}
              </Text>
            </A11yPressable>

            <Text style={styles.footerNote} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('quickOnboarding.footerNote', 'By continuing, you accept our Terms of Service v3.0 and Privacy Policy v2.0')}
            </Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('quickOnboarding.modeTitle', 'Choose Your Experience')}
            </Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('quickOnboarding.modeSubtitle', 'You can change this anytime in Settings')}
            </Text>

            <GapView style={styles.modeOptions} gap={12}>
              <A11yPressable
                onPress={() => handleModeSelect('simple')}
                style={[
                  styles.modeCard,
                  selectedMode === 'simple' && styles.modeCardSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedMode === 'simple' }}
                accessibilityLabel={t('quickOnboarding.simpleMode', 'Simple mode - 5 core features')}
                hitSlop={HIT_SLOP_12}
              >
                <View style={styles.modeHeader}>
                  <Text style={styles.modeEmoji}>🌱</Text>
                  <Text style={[styles.modeTitle, selectedMode === 'simple' && styles.modeTitleSelected]}>
                    Simple
                  </Text>
                  {selectedMode === 'simple' && (
                    <Ionicons name="checkmark-circle" size={24} color={palette.success} />
                  )}
                </View>
                <Text style={styles.modeDescription}>
                  {t('quickOnboarding.simpleDesc', '5 core features. Perfect for overwhelming days, flare-ups, or getting started.')}
                </Text>
              </A11yPressable>

              <A11yPressable
                onPress={() => handleModeSelect('standard')}
                style={[
                  styles.modeCard,
                  selectedMode === 'standard' && styles.modeCardSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedMode === 'standard' }}
                accessibilityLabel={t('quickOnboarding.standardMode', 'Standard mode - 20 features')}
                hitSlop={HIT_SLOP_12}
              >
                <View style={styles.modeHeader}>
                  <Text style={styles.modeEmoji}>⭐</Text>
                  <Text style={[styles.modeTitle, selectedMode === 'standard' && styles.modeTitleSelected]}>
                    Standard
                  </Text>
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                  {selectedMode === 'standard' && (
                    <Ionicons name="checkmark-circle" size={24} color={palette.success} />
                  )}
                </View>
                <Text style={styles.modeDescription}>
                  {t('quickOnboarding.standardDesc', '20 features. Balanced experience for most users.')}
                </Text>
              </A11yPressable>

              <A11yPressable
                onPress={() => handleModeSelect('power_user')}
                style={[
                  styles.modeCard,
                  selectedMode === 'power_user' && styles.modeCardSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedMode === 'power_user' }}
                accessibilityLabel={t('quickOnboarding.powerMode', 'Power user mode - All features')}
                hitSlop={HIT_SLOP_12}
              >
                <View style={styles.modeHeader}>
                  <Text style={styles.modeEmoji}>🚀</Text>
                  <Text style={[styles.modeTitle, selectedMode === 'power_user' && styles.modeTitleSelected]}>
                    Power User
                  </Text>
                  {selectedMode === 'power_user' && (
                    <Ionicons name="checkmark-circle" size={24} color={palette.success} />
                  )}
                </View>
                <Text style={styles.modeDescription}>
                  {t('quickOnboarding.powerDesc', 'All 60+ features. For experienced users who want everything.')}
                </Text>
              </A11yPressable>
            </GapView>

            <GapView style={styles.buttonRow} gap={12}>
              <A11yPressable
                onPress={goBack}
                style={styles.secondaryButton}
                accessibilityRole="button"
                accessibilityLabel={t('common.back', 'Back')}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </A11yPressable>
              <A11yPressable
                onPress={goNext}
                style={styles.primaryButton}
                accessibilityRole="button"
                accessibilityLabel={t('common.continue', 'Continue')}
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </A11yPressable>
            </GapView>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('quickOnboarding.readyTitle', "You're All Set!")}
            </Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('quickOnboarding.readySubtitle', 'Thanks for being a beta tester')}
            </Text>

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>🧪 Beta Tester Tips:</Text>
              <Text style={styles.tipsText}>
                • <Text style={{ fontWeight: '600' }}>Found a bug?</Text> Email us or use the feedback banner{'\n'}
                • <Text style={{ fontWeight: '600' }}>Loving something?</Text> We want to know!{'\n'}
                • <Text style={{ fontWeight: '600' }}>Confused?</Text> That's valuable feedback too{'\n'}
                • <Text style={{ fontWeight: '600' }}>Settings → Complexity Mode</Text> to adjust features
              </Text>
            </View>

            <View style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>🏅</Text>
              <Text style={styles.badgeTitle}>Beta Tester Badge</Text>
              <Text style={styles.badgeText}>
                You'll receive a special badge once our badge system goes live!
              </Text>
            </View>

            <A11yPressable
              onPress={handleComplete}
              style={styles.primaryButton}
              accessibilityRole="button"
              accessibilityLabel={t('quickOnboarding.startExploring', 'Start exploring')}
              hitSlop={HIT_SLOP_12}
            >
              <Text style={styles.primaryButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('quickOnboarding.startExploring', 'Start Exploring 3mpwr')}
              </Text>
            </A11yPressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * Hook to check if quick onboarding should be shown
 */
export async function shouldShowQuickOnboarding(): Promise<boolean> {
  try {
    const termsAccepted = await AsyncStorage?.getItem?.(TERMS_STORAGE_KEY);
    if (termsAccepted) return false; // Already onboarded
    
    return true;
  } catch {
    return true;
  }
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    progressDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: palette.border,
    },
    progressDotActive: {
      backgroundColor: palette.primary,
      width: 24,
    },
    progressDotComplete: {
      backgroundColor: palette.success,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    stepContent: {
      alignItems: 'center',
    },
    emoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: palette.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: palette.muted,
      textAlign: 'center',
      marginBottom: 24,
    },
    disclaimerCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      width: '100%',
      borderWidth: 1,
      borderColor: palette.warning + '40',
      ...createShadow({
        shadowColor: palette.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }),
    },
    disclaimerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.warning,
      marginBottom: 12,
    },
    disclaimerText: {
      fontSize: 14,
      color: palette.text,
      lineHeight: 22,
    },
    linkRow: {
      flexDirection: 'row',
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    docLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    docLinkText: {
      color: palette.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    primaryButton: {
      backgroundColor: palette.primary,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
    },
    primaryButtonText: {
      color: palette.onPrimary,
      fontSize: 18,
      fontWeight: '700',
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    secondaryButtonText: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonRow: {
      flexDirection: 'row',
      width: '100%',
    },
    footerNote: {
      fontSize: 12,
      color: palette.muted,
      textAlign: 'center',
      marginTop: 16,
      paddingHorizontal: 20,
    },
    modeOptions: {
      width: '100%',
      marginBottom: 24,
    },
    modeCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: palette.border,
    },
    modeCardSelected: {
      borderColor: palette.primary,
      backgroundColor: palette.primary + '08',
    },
    modeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    modeEmoji: {
      fontSize: 24,
    },
    modeTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      flex: 1,
    },
    modeTitleSelected: {
      color: palette.primary,
    },
    modeDescription: {
      fontSize: 14,
      color: palette.muted,
      lineHeight: 20,
    },
    recommendedBadge: {
      backgroundColor: palette.success + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    recommendedText: {
      fontSize: 10,
      fontWeight: '700',
      color: palette.success,
      textTransform: 'uppercase',
    },
    tipsCard: {
      backgroundColor: palette.primary + '10',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      width: '100%',
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.primary,
      marginBottom: 12,
    },
    tipsText: {
      fontSize: 14,
      color: palette.text,
      lineHeight: 24,
    },
    badgeCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      width: '100%',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    badgeEmoji: {
      fontSize: 40,
      marginBottom: 8,
    },
    badgeTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 4,
    },
    badgeText: {
      fontSize: 13,
      color: palette.muted,
      textAlign: 'center',
    },
  });
}
