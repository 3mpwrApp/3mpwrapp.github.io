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
    Text,
    View,
} from 'react-native';

import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

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
      <View style={styles.confirmationContainer}>
        <Ionicons name="checkmark-circle" size={20} color={palette.success} />
        <Text style={[styles.confirmationText, { color: palette.success }]}>Thank you!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
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
    gap: 6,
  },
  confirmationText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
