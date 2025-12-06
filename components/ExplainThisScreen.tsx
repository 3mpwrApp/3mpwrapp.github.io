/**
 * Explain This Screen Component
 * 
 * A help button that provides context-aware explanations
 * of what the current screen does and how to use it.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { HIT_SLOP_12 } from '../constants/A11Y';
import { useTranslation } from '../i18n';
import {
    getPreferences,
    SCREEN_EXPLANATIONS
} from '../store/cognitiveComfort';
import { useAppPalette } from '../theme/usePalette';
import { announce } from '../utils/announce';

interface ExplainThisScreenProps {
  screenKey: string;
  customExplanation?: {
    simple: string;
    detailed: string;
  };
  visible?: boolean;
  position?: 'header' | 'floating';
}

export function ExplainThisScreen({
  screenKey,
  customExplanation,
  visible = true,
  position = 'header',
}: ExplainThisScreenProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const prefs = getPreferences();
  const explanation = customExplanation || SCREEN_EXPLANATIONS[screenKey];
  
  if (!visible || !explanation) return null;
  
  const currentExplanation = prefs.useSimpleExplanations ? explanation.simple : explanation.detailed;
  
  const handleOpen = () => {
    setIsOpen(true);
    announce(t('cognitive.screenExplanationOpened', 'Screen explanation opened'));
  };
  
  const handleClose = () => {
    setIsOpen(false);
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    }
  };
  
  const handleSpeak = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    try {
      await Speech.speak(currentExplanation, {
        language: 'en',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch {
      setIsSpeaking(false);
    }
  };
  
  const toggleExplanationType = () => {
    // Toggle between simple and detailed (reserved for future implementation)
    const _newValue = !prefs.useSimpleExplanations;
    // Note: In real implementation, this would update preferences
  };
  
  return (
    <>
      {/* Help Button */}
      {position === 'header' ? (
        <Pressable
          onPress={handleOpen}
          accessibilityRole="button"
          accessibilityLabel={t('cognitive.explainThisScreen', 'Explain this screen')}
          accessibilityHint={t('cognitive.explainHint', 'Opens an explanation of what this screen does')}
          hitSlop={HIT_SLOP_12}
          style={styles.headerButton}
        >
          <Ionicons name="help-circle" size={24} color={palette.primary} />
        </Pressable>
      ) : (
        <View style={styles.floatingContainer}>
          <Pressable
            onPress={handleOpen}
            accessibilityRole="button"
            accessibilityLabel={t('cognitive.explainThisScreen', 'Explain this screen')}
            style={[styles.floatingButton, { backgroundColor: palette.info }]}
          >
            <Ionicons name="help" size={24} color={palette.onPrimary} />
          </Pressable>
        </View>
      )}
      
      {/* Explanation Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconBg, { backgroundColor: palette.info + '20' }]}>
                <Ionicons name="information-circle" size={28} color={palette.info} />
              </View>
              <Text style={[styles.title, { color: palette.text }]}>
                {t('cognitive.aboutThisScreen', 'About This Screen')}
              </Text>
              <Pressable
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel={t('common.close', 'Close')}
                hitSlop={HIT_SLOP_12}
              >
                <Ionicons name="close-circle" size={28} color={palette.muted} />
              </Pressable>
            </View>
            
            {/* Explanation */}
            <View style={[styles.explanationBox, { backgroundColor: palette.card }]}>
              <Text style={[styles.explanationText, { color: palette.text }]}>
                {currentExplanation}
              </Text>
            </View>
            
            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                onPress={handleSpeak}
                accessibilityRole="button"
                accessibilityLabel={isSpeaking ? t('cognitive.stopReading', 'Stop reading') : t('cognitive.readAloud', 'Read aloud')}
                style={[styles.actionButton, { backgroundColor: palette.card, borderColor: palette.border }]}
              >
                <Ionicons 
                  name={isSpeaking ? 'stop-circle' : 'volume-high'} 
                  size={20} 
                  color={palette.primary} 
                />
                <Text style={[styles.actionText, { color: palette.text }]}>
                  {isSpeaking 
                    ? t('cognitive.stopReading', 'Stop') 
                    : t('cognitive.readAloud', 'Read Aloud')
                  }
                </Text>
              </Pressable>
              
              <Pressable
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel={t('cognitive.gotIt', 'Got it')}
                style={[styles.actionButton, styles.primaryButton, { backgroundColor: palette.primary }]}
              >
                <Ionicons name="checkmark" size={20} color={palette.onPrimary} />
                <Text style={[styles.actionText, { color: palette.onPrimary }]}>
                  {t('cognitive.gotIt', 'Got It')}
                </Text>
              </Pressable>
            </View>
            
            {/* Toggle Explanation Type */}
            <Pressable
              onPress={toggleExplanationType}
              accessibilityRole="button"
              style={styles.toggleLink}
            >
              <Text style={[styles.toggleText, { color: palette.primary }]}>
                {prefs.useSimpleExplanations 
                  ? t('cognitive.showDetailed', 'Show more details')
                  : t('cognitive.showSimple', 'Show simpler explanation')
                }
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 8,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    zIndex: 999,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    // Note: Shadow color applied dynamically with palette.text
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    // Note: Shadow color applied dynamically with palette.text
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  explanationBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  primaryButton: {
    borderWidth: 0,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleLink: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default ExplainThisScreen;
