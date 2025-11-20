/**
 * Voice-First Mode Button
 * 
 * Floating button for hands-free voice control with listening indicator
 */

/* eslint-disable no-restricted-syntax */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Animated,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

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
    processVoiceCommand,
    speak,
    VOICE_COMMANDS
} from '../services/voiceFirst';
import { useAppPalette } from '../theme/usePalette';

interface VoiceFirstButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export default function VoiceFirstButton({ position = 'bottom-right' }: VoiceFirstButtonProps) {
  const palette = useAppPalette();
  const { t: _t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isListening) {
      // Pulse animation while listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const handlePress = async () => {
    if (Haptics && Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (isListening) {
      // Stop listening
      setIsListening(false);
      await speak('Voice mode cancelled');
    } else {
      // Start listening
      setIsListening(true);
      await speak('Listening. What would you like to do?');
      
      // Simulate voice recognition (in real app, would use speech recognition API)
      setTimeout(async () => {
        setIsListening(false);
        // For demo purposes, just speak the help text
        await speak('Say commands like: open mood tracker, or go home');
      }, 3000);
    }
  };

  const handleToggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  const handleSuggestionPress = async (phrase: string) => {
    if (Haptics && Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    processVoiceCommand(phrase);
    setShowSuggestions(false);
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: 80, left: 20 };
      case 'top-right':
        return { top: 80, right: 20 };
      case 'top-left':
        return { top: 80, left: 20 };
      default: // bottom-right
        return { bottom: 80, right: 20 };
    }
  };

  return (
    <>
      {/* Command Suggestions Overlay */}
      {showSuggestions && (
        <View style={[styles.suggestionsOverlay, getPositionStyles()]}>
          <View style={[styles.suggestionsContainer, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
            <View style={styles.suggestionsHeader}>
              <Text style={[styles.suggestionsTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Voice Commands
              </Text>
              <Pressable onPress={handleToggleSuggestions} accessibilityRole="button" accessibilityLabel="Close suggestions" hitSlop={8}>
                <Ionicons name="close" size={20} color={palette.textSecondary} />
              </Pressable>
            </View>
            
            {VOICE_COMMANDS.map((cmd, index) => (
              <Pressable
                key={index}
                style={[styles.suggestionItem, { borderBottomColor: palette.muted }]}
                onPress={() => handleSuggestionPress(cmd.phrases[0])}
                accessibilityRole="button"
                accessibilityLabel={`Execute ${cmd.description}`}
              >
                <Ionicons name="mic-outline" size={18} color={palette.primary} />
                <View style={styles.suggestionContent}>
                  <Text style={[styles.suggestionPhrase, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    "{cmd.phrases[0]}"
                  </Text>
                  <Text style={[styles.suggestionDesc, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {cmd.description}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Listening Indicator */}
      {isListening && (
        <View style={[styles.listeningIndicator, getPositionStyles()]}>
          <View style={[styles.listeningPulse, { backgroundColor: palette.primary }]}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={[styles.listeningRing, { borderColor: palette.primary }]} />
            </Animated.View>
          </View>
        </View>
      )}

      {/* Main Voice Button */}
      <View style={[styles.container, getPositionStyles()]}>
        <Pressable
          onPress={handlePress}
          onLongPress={handleToggleSuggestions}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: isListening ? '#dc2626' : palette.primary },
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isListening ? 'Stop listening' : 'Start voice mode'}
          accessibilityHint="Long press to see available commands"
        >
          <Ionicons 
            name={isListening ? 'stop' : 'mic'} 
            size={28} 
            color={palette.onPrimary}
          />
        </Pressable>

        {/* Help Badge */}
        {!isListening && (
          <Pressable
            style={[styles.helpBadge, { backgroundColor: palette.surface, borderColor: palette.muted }]}
            onPress={handleToggleSuggestions}
            accessibilityRole="button"
            accessibilityLabel="Show voice commands"
          >
            <Ionicons name="help-circle-outline" size={16} color={palette.primary} />
          </Pressable>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
  },
  helpBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningIndicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  listeningPulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.2,
  },
  listeningRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    opacity: 0.5,
  },
  suggestionsOverlay: {
    position: 'absolute',
    width: 280,
    maxHeight: 400,
  },
  suggestionsContainer: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 80,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionPhrase: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionDesc: {
    fontSize: 12,
  },
});
