/**
 * Suggestion Feedback Button Component
 * Inline thumbs up/down button for rating suggestions
 * 
 * Features:
 * - Quick thumbs up/down feedback
 * - Opens detailed feedback modal on selection
 * - Haptic feedback on interaction
 * - Accessible with screen reader support
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text
} from 'react-native';

import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';
import GapView from './GapView';

export interface SuggestionFeedbackButtonProps {
  _suggestionId?: string; // TODO: Use for analytics in Phase 6.2
  onFeedbackSubmit?: (feedbackType: 'helpful' | 'not_relevant' | 'misleading') => Promise<void>;
  disabled?: boolean;
}

export default function SuggestionFeedbackButton({
  onFeedbackSubmit,
  disabled = false,
}: SuggestionFeedbackButtonProps) {
  const palette = useAppPalette();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleThumbsUp = async () => {
    setFeedback('up');
    setLoading(true);
    try {
      await onFeedbackSubmit?.('helpful');
      setShowConfirmation(true);
      // WCAG 2.2.1: Confirmation auto-dismiss for feedback display, not user-interaction timeout
      setTimeout(() => setShowConfirmation(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbsDown = () => {
    setFeedback('down');
    // Will trigger feedback modal (handled by parent component)
  };

  if (showConfirmation) {
    return (
      <GapView style={styles.confirmationContainer} gap={6}>
        <Ionicons name="checkmark-circle" size={20} color={palette.success} />
        <Text style={[styles.confirmationText, { color: palette.success }]}>Thank you!</Text>
      </GapView>
    );
  }

  return (
    <GapView style={styles.container} gap={12}>
      <A11yPressable
        onPress={handleThumbsUp}
        disabled={disabled || loading}
        style={[
          styles.button,
          feedback === 'up' && styles.buttonSelected,
        ]}
        accessibilityRole="button"
        accessibilityLabel="This suggestion was helpful"
        accessibilityState={{ disabled: disabled || loading }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {loading && feedback === 'up' ? (
          <ActivityIndicator size="small" color={palette.primary} />
        ) : (
          <Ionicons
            name={feedback === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
            size={20}
            color={feedback === 'up' ? palette.primary : palette.muted}
          />
        )}
      </A11yPressable>

      <A11yPressable
        onPress={handleThumbsDown}
        disabled={disabled || loading}
        style={[
          styles.button,
          feedback === 'down' && styles.buttonSelected,
        ]}
        accessibilityRole="button"
        accessibilityLabel="This suggestion was not helpful"
        accessibilityState={{ disabled: disabled || loading }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={feedback === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
          size={20}
          color={feedback === 'down' ? palette.error : palette.muted}
        />
      </A11yPressable>
    </GapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 8,
    borderRadius: 6,
  },
  buttonSelected: {
    opacity: 0.8,
  },
  confirmationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmationText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
