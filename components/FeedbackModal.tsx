/**
 * Feedback Modal Component
 * Detailed feedback collection for suggestions and features
 * 
 * Features:
 * - Reason selection (helpful, not relevant, misleading, other)
 * - Optional comment field
 * - Store feedback in Firestore and analytics
 * - Confirmation message
 * - Full accessibility
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';
import { GapView } from './GapView';

export type FeedbackReason = 'helpful' | 'not_relevant' | 'misleading' | 'other';

export interface FeedbackModalProps {
  visible: boolean;
  _suggestionId?: string; // TODO: Use for analytics tracking in Phase 6.2
  onClose: () => void;
  onSubmit: (reason: FeedbackReason, comment?: string) => Promise<void>;
}

// Feedback reasons will be translated in component using t() function

export default function FeedbackModal({
  visible,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [selectedReason, setSelectedReason] = useState<FeedbackReason | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert(t('components.feedback.alertTitle', 'Please select a reason'), t('components.feedback.alertMessage', 'Choose a feedback reason to continue'));
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedReason, comment || undefined);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch {
      Alert.alert(t('components.feedback.error', 'Error'), t('components.feedback.errorMessage', 'Failed to submit feedback. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setComment('');
    setSubmitted(false);
    onClose();
  };

  const styles = createStyles(palette, useSafeAreaInsets());

  const feedbackReasons = [
    { label: t('components.feedback.helpful', 'Helpful'), value: 'helpful' as FeedbackReason, icon: 'thumbs-up' },
    { label: t('components.feedback.notRelevant', 'Not relevant to me'), value: 'not_relevant' as FeedbackReason, icon: 'close-circle' },
    { label: t('components.feedback.misleading', 'Misleading or incorrect'), value: 'misleading' as FeedbackReason, icon: 'warning' },
    { label: t('components.feedback.other', 'Other reason'), value: 'other' as FeedbackReason, icon: 'help-circle' },
  ];

  if (submitted) {
    return (
      <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleClose}>
        <View style={styles.centeredContainer}>
          <View style={styles.centeredContent}>
            <Ionicons name="checkmark-circle" size={64} color={palette.success} />
            <Text style={[styles.successTitle, { color: palette.text }]}>{t('components.feedback.thankYou', 'Thank you!')}</Text>
            <Text style={[styles.successMessage, { color: palette.muted }]}>
              {t('components.feedback.helpMessage', 'Your feedback helps us improve')}
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: palette.text }]}>{t('components.feedback.title', 'Share Your Feedback')}</Text>
              <A11yPressable
                onPress={handleClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel={t('components.feedback.close', 'Close feedback modal')}
                hitSlop={HIT_SLOP_8}
              >
                <Ionicons name="close" size={24} color={palette.text} />
              </A11yPressable>
            </View>

            {/* Reason Selection */}
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.sectionLabel, { color: palette.text }]}>
                {t('components.feedback.questionLabel', 'How did this suggestion help you?')}
              </Text>

              {feedbackReasons.map(reason => (
                <A11yPressable
                  key={reason.value}
                  onPress={() => setSelectedReason(reason.value)}
                  style={[
                    styles.reasonButton,
                    selectedReason === reason.value && styles.reasonButtonSelected,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedReason === reason.value }}
                  accessibilityLabel={reason.label}
                  hitSlop={HIT_SLOP_8}
                >
                  <GapView style={styles.reasonContent} gap={12}>
                    <Ionicons
                      name={selectedReason === reason.value ? 'radio-button-on' : 'radio-button-off'}
                      size={24}
                      color={selectedReason === reason.value ? palette.primary : palette.muted}
                    />
                    <Text
                      style={[
                        styles.reasonLabel,
                        {
                          color: selectedReason === reason.value ? palette.primary : palette.text,
                        },
                      ]}
                    >
                      {reason.label}
                    </Text>
                  </GapView>
                </A11yPressable>
              ))}

              {/* Comment Field */}
              <Text style={[styles.sectionLabel, { color: palette.text, marginTop: 24 }]}>
                {t('components.feedback.commentLabel', 'Add a comment (optional)')}
              </Text>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    borderColor: palette.muted,
                    backgroundColor: `${palette.text}08`,
                    color: palette.text,
                  },
                ]}
                placeholder={t('components.feedback.commentPlaceholder', 'Tell us more...')}
                placeholderTextColor={palette.muted}
                value={comment}
                onChangeText={setComment}
                multiline={true}
                numberOfLines={4}
                maxLength={500}
                accessibilityLabel={t('components.feedback.commentA11y', 'Feedback comment (optional)')}
              />
              <Text style={[styles.charCount, { color: palette.muted }]}>
                {comment.length}/500
              </Text>
            </ScrollView>

            {/* Action Buttons */}
            <GapView style={[styles.footer, { paddingBottom: insets.bottom }]} gap={12}>
              <A11yPressable
                onPress={handleClose}
                style={[styles.button, styles.cancelButton]}
                accessibilityRole="button"
                accessibilityLabel={t('components.feedback.cancel', 'Cancel')}
                disabled={loading}
                hitSlop={HIT_SLOP_8}
              >
                <Text style={[styles.buttonText, { color: palette.primary }]}>{t('components.feedback.cancel', 'Cancel')}</Text>
              </A11yPressable>

              <A11yPressable
                onPress={handleSubmit}
                style={[
                  styles.button,
                  styles.submitButton,
                  (!selectedReason || loading) && styles.buttonDisabled,
                ]}
                disabled={!selectedReason || loading}
                accessibilityRole="button"
                accessibilityLabel={t('components.feedback.submit', 'Submit feedback')}
                accessibilityState={{ disabled: !selectedReason || loading }}
                hitSlop={HIT_SLOP_8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={palette.onPrimary} />
                ) : (
                  <Text style={[styles.buttonText, { color: palette.onPrimary }]}>{t('components.feedback.submit', 'Submit')}</Text>
                )}
              </A11yPressable>
            </GapView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(palette: any, _insets: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: `${palette.text}40`,
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: palette.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '80%',
      paddingTop: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: `${palette.text}10`,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
    },
    closeButton: {
      padding: 8,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    reasonButton: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: `${palette.text}08`,
    },
    reasonButtonSelected: {
      backgroundColor: `${palette.primary}15`,
    },
    reasonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reasonLabel: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
    },
    commentInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      textAlignVertical: 'top',
      marginBottom: 8,
    },
    charCount: {
      fontSize: 12,
      textAlign: 'right',
      marginBottom: 16,
    },
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: `${palette.text}40`,
    },
    centeredContent: {
      backgroundColor: palette.background,
      borderRadius: 12,
      padding: 32,
      alignItems: 'center',
      minWidth: 200,
    },
    successTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginTop: 16,
    },
    successMessage: {
      fontSize: 14,
      marginTop: 8,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: `${palette.text}10`,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: `${palette.text}12`,
      borderWidth: 1,
      borderColor: palette.primary,
    },
    submitButton: {
      backgroundColor: palette.primary,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
