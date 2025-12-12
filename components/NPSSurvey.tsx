/**
 * NPSSurvey - Net Promoter Score survey component for beta feedback
 * 
 * Features:
 * - 0-10 NPS scale with clear labels
 * - Optional follow-up question
 * - Stores results in AsyncStorage and optionally Firestore
 * - Triggers after configurable number of sessions/days
 * - Accessible with screen reader support
 * - Beautiful modal UI
 */

// Rating color scale (red→yellow→green) is intentionally hardcoded for NPS visual feedback
/* eslint-disable no-restricted-syntax */
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { trackEvent } from '../services/analyticsClient';
import { useAppPalette } from '../theme/usePalette';
import { createShadow } from '../utils/shadow';

import A11yPressable from './A11yPressable';
import GapView from './GapView';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

const NPS_KEY = 'beta.nps.survey';
const SESSION_COUNT_KEY = 'beta.session.count';
const FIRST_OPEN_KEY = 'beta.first.open';

// Show NPS survey after this many sessions OR days (whichever comes first)
const TRIGGER_SESSION_COUNT = 5;
const TRIGGER_DAYS = 3;
const COOLDOWN_DAYS = 30; // Don't show again for 30 days after completing

interface NPSSurveyProps {
  /** Force show the survey (for testing) */
  forceShow?: boolean;
  /** Callback when survey is completed */
  onComplete?: (score: number, feedback?: string) => void;
  /** Callback when survey is dismissed */
  onDismiss?: () => void;
}

export default function NPSSurvey({ 
  forceShow = false, 
  onComplete, 
  onDismiss 
}: NPSSurveyProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const insets = useSafeAreaInsets();
  
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<'score' | 'feedback' | 'thanks'>('score');
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setVisible(true);
      return;
    }
    checkShouldShow();
  }, [forceShow]);

  const checkShouldShow = async () => {
    try {
      // Check if already completed recently
      const npsData = await AsyncStorage?.getItem?.(NPS_KEY);
      if (npsData) {
        const { completedAt } = JSON.parse(npsData);
        const daysSinceCompletion = (Date.now() - completedAt) / (1000 * 60 * 60 * 24);
        if (daysSinceCompletion < COOLDOWN_DAYS) {
          return; // Don't show, completed recently
        }
      }

      // Increment session count
      const currentCount = parseInt(await AsyncStorage?.getItem?.(SESSION_COUNT_KEY) || '0', 10);
      await AsyncStorage?.setItem?.(SESSION_COUNT_KEY, String(currentCount + 1));

      // Check first open date
      let firstOpen = await AsyncStorage?.getItem?.(FIRST_OPEN_KEY);
      if (!firstOpen) {
        firstOpen = String(Date.now());
        await AsyncStorage?.setItem?.(FIRST_OPEN_KEY, firstOpen);
      }
      const daysSinceFirstOpen = (Date.now() - parseInt(firstOpen, 10)) / (1000 * 60 * 60 * 24);

      // Show if either trigger condition is met
      if (currentCount + 1 >= TRIGGER_SESSION_COUNT || daysSinceFirstOpen >= TRIGGER_DAYS) {
        setVisible(true);
        trackEvent('nps_survey_shown', { 
          sessions: currentCount + 1, 
          days_since_install: Math.floor(daysSinceFirstOpen) 
        });
      }
    } catch {
      // Silently fail
    }
  };

  const handleScoreSelect = (selectedScore: number) => {
    setScore(selectedScore);
    trackEvent('nps_score_selected', { score: selectedScore });
  };

  const handleContinue = () => {
    if (score === null) {
      Alert.alert(
        t('nps.selectScore', 'Please select a score'),
        t('nps.selectScoreMessage', 'Tap a number from 0 to 10 to rate your experience.')
      );
      return;
    }
    setStep('feedback');
  };

  const handleSubmit = async () => {
    if (score === null) return;
    
    setSubmitting(true);
    try {
      // Store locally
      await AsyncStorage?.setItem?.(NPS_KEY, JSON.stringify({
        score,
        feedback: feedback || undefined,
        completedAt: Date.now(),
      }));

      // Log analytics
      trackEvent('nps_survey_completed', { 
        score,
        has_feedback: !!feedback,
        feedback_length: feedback.length,
        category: score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor',
      });

      // TODO: Add Firestore sync for NPS data when submitNPSFeedback is implemented
      // For now, data is stored locally only

      onComplete?.(score, feedback || undefined);
      setStep('thanks');
      
      // Auto-close after showing thanks
      setTimeout(() => {
        setVisible(false);
      }, 2000);
    } catch {
      Alert.alert(t('common.error', 'Error'), t('nps.submitError', 'Failed to submit. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    trackEvent('nps_survey_dismissed', { step, score_selected: score !== null });
    onDismiss?.();
    setVisible(false);
  };

  const handleSkipFeedback = () => {
    handleSubmit();
  };

  if (!visible) return null;

  const styles = createStyles(palette);

  // Thanks screen
  if (step === 'thanks') {
    return (
      <Modal visible={true} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.thanksContainer}>
              <Text style={styles.thanksEmoji}>💜</Text>
              <Text style={styles.thanksTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('nps.thanksTitle', 'Thank you!')}
              </Text>
              <Text style={styles.thanksMessage} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('nps.thanksMessage', 'Your feedback helps us build a better app for the disability community.')}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Feedback step
  if (step === 'feedback') {
    const feedbackPrompt = score !== null && score >= 9
      ? t('nps.feedbackPromoter', "That's great! What do you love most about 3mpwr?")
      : score !== null && score >= 7
      ? t('nps.feedbackPassive', 'Thanks! What would make 3mpwr even better?')
      : t('nps.feedbackDetractor', "We're sorry to hear that. What can we improve?");

    return (
      <Modal visible={true} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.header}>
              <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('nps.feedbackTitle', 'Tell us more')}
              </Text>
              <A11yPressable
                onPress={handleDismiss}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel={t('common.close', 'Close')}
                hitSlop={HIT_SLOP_8}
              >
                <Ionicons name="close" size={24} color={palette.muted} />
              </A11yPressable>
            </View>

            <Text style={styles.feedbackPrompt} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {feedbackPrompt}
            </Text>

            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholder={t('nps.feedbackPlaceholder', 'Your thoughts... (optional)')}
              placeholderTextColor={palette.muted}
              value={feedback}
              onChangeText={setFeedback}
              accessibilityLabel={t('nps.feedbackLabel', 'Feedback text input')}
            />
            <Text style={styles.charCount}>{feedback.length}/500</Text>

            <GapView style={styles.buttonRow} gap={12}>
              <A11yPressable
                onPress={handleSkipFeedback}
                style={styles.secondaryButton}
                accessibilityRole="button"
                accessibilityLabel={t('nps.skip', 'Skip and submit')}
                hitSlop={HIT_SLOP_8}
              >
                <Text style={styles.secondaryButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t('nps.skip', 'Skip')}
                </Text>
              </A11yPressable>

              <A11yPressable
                onPress={handleSubmit}
                style={[styles.primaryButton, submitting && styles.buttonDisabled]}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel={t('nps.submit', 'Submit feedback')}
                hitSlop={HIT_SLOP_8}
              >
                <Text style={styles.primaryButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {submitting ? t('common.submitting', 'Submitting...') : t('nps.submit', 'Submit')}
                </Text>
              </A11yPressable>
            </GapView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // Score selection step
  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.header}>
            <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('nps.title', 'Quick Question')}
            </Text>
            <A11yPressable
              onPress={handleDismiss}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('common.close', 'Close')}
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name="close" size={24} color={palette.muted} />
            </A11yPressable>
          </View>

          <Text style={styles.question} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('nps.question', 'How likely are you to recommend 3mpwr to a friend or colleague?')}
          </Text>

          <View style={styles.scaleContainer}>
            <View style={styles.scaleRow}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <A11yPressable
                  key={num}
                  onPress={() => handleScoreSelect(num)}
                  style={[
                    styles.scoreButton,
                    score === num && styles.scoreButtonSelected,
                    num <= 6 && score === num && styles.scoreButtonDetractor,
                    num >= 7 && num <= 8 && score === num && styles.scoreButtonPassive,
                    num >= 9 && score === num && styles.scoreButtonPromoter,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: score === num }}
                  accessibilityLabel={`${num} out of 10`}
                  hitSlop={HIT_SLOP_8}
                >
                  <Text 
                    style={[
                      styles.scoreText,
                      score === num && styles.scoreTextSelected,
                    ]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {num}
                  </Text>
                </A11yPressable>
              ))}
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('nps.notLikely', 'Not likely')}
              </Text>
              <Text style={styles.scaleLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('nps.veryLikely', 'Very likely')}
              </Text>
            </View>
          </View>

          <A11yPressable
            onPress={handleContinue}
            style={[styles.primaryButton, score === null && styles.buttonDisabled]}
            disabled={score === null}
            accessibilityRole="button"
            accessibilityLabel={t('nps.continue', 'Continue')}
            hitSlop={HIT_SLOP_8}
          >
            <Text style={styles.primaryButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('nps.continue', 'Continue')}
            </Text>
          </A11yPressable>

          <Text style={styles.disclaimer} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('nps.disclaimer', 'Your feedback is anonymous and helps us improve.')}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

// Hook to manually trigger NPS survey
export function useNPSSurvey() {
  const [showSurvey, setShowSurvey] = useState(false);

  const triggerSurvey = () => {
    setShowSurvey(true);
    trackEvent('nps_survey_manual_trigger');
  };

  const hideSurvey = () => {
    setShowSurvey(false);
  };

  return { showSurvey, triggerSurvey, hideSurvey };
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: palette.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      ...createShadow({
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 16,
      }),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
    },
    closeButton: {
      padding: 4,
    },
    question: {
      fontSize: 16,
      color: palette.text,
      lineHeight: 24,
      marginBottom: 20,
      textAlign: 'center',
    },
    scaleContainer: {
      marginBottom: 20,
    },
    scaleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    scoreButton: {
      width: 28,
      height: 40,
      borderRadius: 6,
      backgroundColor: palette.background,
      borderWidth: 1,
      borderColor: palette.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scoreButtonSelected: {
      borderWidth: 2,
    },
    scoreButtonDetractor: {
      backgroundColor: '#FEE2E2',
      borderColor: '#EF4444',
    },
    scoreButtonPassive: {
      backgroundColor: '#FEF3C7',
      borderColor: '#F59E0B',
    },
    scoreButtonPromoter: {
      backgroundColor: '#D1FAE5',
      borderColor: '#10B981',
    },
    scoreText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.muted,
    },
    scoreTextSelected: {
      color: palette.text,
    },
    scaleLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    scaleLabel: {
      fontSize: 12,
      color: palette.muted,
    },
    primaryButton: {
      backgroundColor: palette.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: palette.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    secondaryButtonText: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonRow: {
      flexDirection: 'row',
    },
    disclaimer: {
      fontSize: 12,
      color: palette.muted,
      textAlign: 'center',
      marginTop: 12,
    },
    feedbackPrompt: {
      fontSize: 16,
      color: palette.text,
      lineHeight: 24,
      marginBottom: 16,
    },
    textInput: {
      backgroundColor: palette.background,
      borderRadius: 10,
      padding: 14,
      fontSize: 15,
      color: palette.text,
      borderWidth: 1,
      borderColor: palette.border,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    charCount: {
      fontSize: 12,
      color: palette.muted,
      textAlign: 'right',
      marginTop: 4,
      marginBottom: 16,
    },
    thanksContainer: {
      alignItems: 'center',
      padding: 40,
    },
    thanksEmoji: {
      fontSize: 48,
      marginBottom: 16,
    },
    thanksTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    thanksMessage: {
      fontSize: 16,
      color: palette.muted,
      textAlign: 'center',
      lineHeight: 24,
    },
  });
}
