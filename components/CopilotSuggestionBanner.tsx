/**
 * Copilot Suggestion Banner
 * 
 * Displays proactive AI suggestions based on user behavior patterns
 */

/* eslint-disable no-restricted-syntax */
/* eslint-disable import/order */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { createShadow } from '../utils/shadow';

// Lazy-load Haptics only on native platforms
let Haptics: any = null;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch {
    // Haptics not available
  }
}

import { MAX_FONT_SCALE } from '../constants/A11Y';
import { useTranslation } from '../i18n';
import {
    dismissSuggestion,
    type ProactiveSuggestion
} from '../services/copilotProactive';
import { useAppPalette } from '../theme/usePalette';

interface CopilotSuggestionBannerProps {
  suggestion: ProactiveSuggestion;
  onDismiss?: () => void;
  onAction?: () => void;
}

export function CopilotSuggestionBanner({
  suggestion,
  onDismiss,
  onAction
}: CopilotSuggestionBannerProps) {
  const palette = useAppPalette();
  const { t: _t } = useTranslation();
  const [showExplanation, setShowExplanation] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleDismiss = async () => {
    if (Haptics && Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await dismissSuggestion(suggestion.id);
    setVisible(false);
    onDismiss?.();
  };

  const handleSnooze = async () => {
    if (Haptics && Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Simple snooze: just hide for now; a full implementation could clone with delayed expiresAt
    setVisible(false);
    onDismiss?.();
  };

  const handleAction = () => {
    if (Haptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onAction?.();
  };

  const getTypeIcon = () => {
    switch (suggestion.type) {
      case 'mood-log': return 'trending-up';
      case 'pacing-break': return 'time';
      case 'evidence-capture': return 'document-text';
      case 'appeal-deadline': return 'calendar';
      case 'community-checkin': return 'people';
      case 'wellness-tip': return 'bulb';
      default: return 'sparkles';
    }
  };

  const getTypeColor = () => {
    switch (suggestion.type) {
      case 'mood-log': return palette.secondary || palette.primary;
      case 'pacing-break': return '#06b6d4';
      case 'evidence-capture': return palette.primary;
      case 'appeal-deadline': return palette.warning || palette.primary;
      case 'community-checkin': return palette.success || palette.primary;
      case 'wellness-tip': return palette.error || palette.primary;
      default: return palette.primary;
    }
  };

  const getPriorityLabel = () => {
    switch (suggestion.priority) {
      case 'high': return 'Important';
      case 'medium': return 'Suggested';
      case 'low': return 'FYI';
      default: return '';
    }
  };

  if (!visible) return null;

  return (
    <>
      <View
        style={[
          styles.container,
          { backgroundColor: palette.surface, borderLeftColor: getTypeColor() }
        ]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: getTypeColor() }]}>
            <Ionicons name={getTypeIcon() as any} size={20} color="#ffffff" />
          </View>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {suggestion.title}
              </Text>
              {suggestion.priority === 'high' && (
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {getPriorityLabel()}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.message, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {suggestion.message}
            </Text>
          </View>
          <Pressable
            onPress={handleDismiss}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Dismiss suggestion"
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color={palette.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: getTypeColor() }]}
            onPress={handleAction}
            accessibilityRole="button"
            accessibilityLabel="Open suggestion"
          >
            <Text style={styles.actionButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Open
            </Text>
          </Pressable>
          
          <Pressable
            style={styles.explainButton}
            onPress={() => setShowExplanation(true)}
            accessibilityRole="button"
            accessibilityLabel="Why this suggestion?"
          >
            <Ionicons name="information-circle-outline" size={16} color={palette.primary} />
            <Text style={[styles.explainButtonText, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Why?
            </Text>
          </Pressable>

          <Pressable
            style={styles.snoozeButton}
            onPress={handleSnooze}
            accessibilityRole="button"
            accessibilityLabel="Snooze for now"
          >
            <Ionicons name="time-outline" size={16} color={palette.textSecondary} />
            <Text style={[styles.snoozeButtonText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Later
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Explanation Modal */}
      <Modal
        visible={showExplanation}
        animationType="fade"
        transparent
        onRequestClose={() => setShowExplanation(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowExplanation(false)}
          accessibilityRole="button"
          accessibilityLabel="Close explanation"
        >
          <View
            style={[styles.modalContent, { backgroundColor: palette.surface }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Ionicons name="information-circle" size={24} color={getTypeColor()} />
              <Text style={[styles.modalTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Why this suggestion?
              </Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                This suggestion was generated based on your recent activity and preferences.
              </Text>
            </View>

            <Pressable
              style={[styles.modalButton, { backgroundColor: palette.primary }]}
              onPress={() => setShowExplanation(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.modalButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Got it
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexShrink: 1,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  explainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  explainButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  snoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 'auto',
  },
  snoozeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    ...createShadow({
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  contextCard: {
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contextKey: {
    fontSize: 12,
    fontWeight: '500',
  },
  contextValue: {
    fontSize: 12,
    flex: 1,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
