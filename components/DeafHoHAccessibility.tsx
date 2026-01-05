/**
 * Deaf and Hard-of-Hearing Accessibility Features
 * 
 * This module provides comprehensive accessibility for Deaf/HoH users:
 * - Visual notification alternatives (flashing, vibration)
 * - Live visual indicators for real-time events
 * - Transcription integration for voice content
 * - ASL resource links
 * - Typing indicators with visual feedback
 * 
 * References:
 * - WCAG 1.4.2 Audio Control
 * - WCAG 1.2.1 Audio-only and Video-only (Prerecorded)
 * - WCAG 1.2.2 Captions (Prerecorded)
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Linking,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { HIT_SLOP_12 } from '../constants/A11Y';
import { MAX_FONT_SCALE, useReduceMotionEnabled } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

// AccessibilityInfo and Vibration are not available on web, conditionally import
const AccessibilityInfo = Platform.OS !== 'web'
  ? require('react-native').AccessibilityInfo
  : null;
const Vibration = Platform.OS !== 'web'
  ? require('react-native').Vibration
  : null;

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

const DEAF_HOH_PREFS_KEY = 'empowr.accessibility.deafhoh.v1';

export interface DeafHoHPreferences {
  /** Use visual flash notifications instead of/with sound */
  visualAlerts: boolean;
  /** Use vibration for notifications */
  vibrationAlerts: boolean;
  /** Show captions/transcripts by default */
  preferCaptions: boolean;
  /** Flash screen for urgent alerts */
  flashForUrgent: boolean;
  /** Show typing indicators prominently */
  prominentTypingIndicator: boolean;
}

const DEFAULT_PREFS: DeafHoHPreferences = {
  visualAlerts: false,
  vibrationAlerts: true,
  preferCaptions: true,
  flashForUrgent: true,
  prominentTypingIndicator: true,
};

/**
 * Hook to manage Deaf/HoH accessibility preferences
 */
export function useDeafHoHPreferences() {
  const [prefs, setPrefs] = useState<DeafHoHPreferences>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const raw = await AsyncStorage?.getItem?.(DEAF_HOH_PREFS_KEY);
      if (raw) {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
      }
    } catch {
      // Use defaults
    } finally {
      setLoaded(true);
    }
  };

  const updatePrefs = async (updates: Partial<DeafHoHPreferences>) => {
    const newPrefs = { ...prefs, ...updates };
    setPrefs(newPrefs);
    try {
      await AsyncStorage?.setItem?.(DEAF_HOH_PREFS_KEY, JSON.stringify(newPrefs));
    } catch {
      // Silent failure
    }
  };

  return { prefs, updatePrefs, loaded };
}

/**
 * Visual alert component - flashes screen for notifications
 */
interface VisualAlertProps {
  /** Whether alert is active */
  active: boolean;
  /** Type of alert determines color and intensity */
  type?: 'info' | 'warning' | 'urgent' | 'success';
  /** Number of flashes */
  flashCount?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
}

export function VisualAlert({ 
  active, 
  type = 'info', 
  flashCount = 3,
  onComplete 
}: VisualAlertProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();

  const getColor = () => {
    switch (type) {
      case 'urgent': return palette.error;
      case 'warning': return palette.warning;
      case 'success': return palette.success;
      default: return palette.primary;
    }
  };

  useEffect(() => {
    if (active) {
      if (!reduceMotion) {
        // Create flash animation sequence (skip if reduce motion is enabled)
        const flashes: Animated.CompositeAnimation[] = [];
        for (let i = 0; i < flashCount; i++) {
          flashes.push(
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            })
          );
        }

        Animated.sequence(flashes).start(() => {
          onComplete?.();
        });
      } else {
        // Snap to opacity 0.7 without animation and immediately complete
        opacity.setValue(0.7);
        setTimeout(() => {
          opacity.setValue(0);
          onComplete?.();
        }, 200);
      }

      // Also trigger vibration
      if (Platform.OS !== 'web') {
        try {
          if (type === 'urgent' && Vibration) {
            Vibration.vibrate([100, 100, 100, 100, 200]);
          } else {
            Haptics.notificationAsync(
              type === 'warning'
                ? Haptics.NotificationFeedbackType.Warning
                : Haptics.NotificationFeedbackType.Success
            );
          }
        } catch {
          // Haptics not available
        }
      }
    }
  }, [active, flashCount, type]);

  if (!active) return null;

  return (
    <Animated.View
      style={[
        styles.visualAlertOverlay,
        { backgroundColor: getColor(), opacity }
      ]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/**
 * Prominent typing indicator for community/chat features
 */
interface TypingIndicatorProps {
  /** Whether someone is typing */
  isTyping: boolean;
  /** Name of person typing (optional) */
  typerName?: string;
  /** Use prominent display */
  prominent?: boolean;
}

export function AccessibleTypingIndicator({
  isTyping,
  typerName,
  prominent = false,
}: TypingIndicatorProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isTyping) {
      return;
    }

    if (!reduceMotion) {
      // Only run animation if reduce motion is not enabled
      const animate = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          ])
        );
      };

      const anim1 = animate(dot1, 0);
      const anim2 = animate(dot2, 150);
      const anim3 = animate(dot3, 300);

      anim1.start();
      anim2.start();
      anim3.start();

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
      };
    } else {
      // Snap dots to visible state without animation
      dot1.setValue(0.6);
      dot2.setValue(0.6);
      dot3.setValue(0.6);
    }
  }, [isTyping, reduceMotion]);

  if (!isTyping) return null;

  const message = typerName 
    ? t('community.typingNamed', '{{name}} is typing...', { name: typerName })
    : t('community.typing', 'Someone is typing...');

  return (
    <View 
      style={[
        styles.typingContainer,
        prominent && styles.typingContainerProminent,
        { backgroundColor: palette.surface, borderColor: palette.border }
      ]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
    >
      <View style={styles.typingDots}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              { 
                backgroundColor: palette.primary,
                transform: [{ 
                  translateY: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6]
                  })
                }]
              }
            ]}
          />
        ))}
      </View>
      <Text 
        style={[styles.typingText, { color: palette.textSecondary }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {message}
      </Text>
      {prominent && (
        <Ionicons name="chatbubble-ellipses" size={20} color={palette.primary} />
      )}
    </View>
  );
}

/**
 * Transcription display component for voice notes
 */
interface TranscriptionDisplayProps {
  /** The transcribed text */
  text: string;
  /** Whether transcription is in progress */
  isTranscribing?: boolean;
  /** Confidence level if available */
  confidence?: number;
  /** Error state */
  error?: string;
  /** Callback to request re-transcription */
  onRetry?: () => void;
}

export function TranscriptionDisplay({
  text,
  isTranscribing = false,
  confidence,
  error,
  onRetry,
}: TranscriptionDisplayProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();

  if (isTranscribing) {
    return (
      <View 
        style={[styles.transcriptionBox, { backgroundColor: palette.surface, borderColor: palette.border }]}
        accessibilityLiveRegion="polite"
      >
        <View style={styles.transcriptionLoading}>
          <Ionicons name="mic" size={20} color={palette.primary} />
          <Text style={[styles.transcriptionLoadingText, { color: palette.text }]}>
            {t('voiceNotes.transcribing', 'Transcribing audio...')}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View 
        style={[styles.transcriptionBox, { backgroundColor: palette.error + '10', borderColor: palette.error }]}
        accessibilityRole="alert"
      >
        <View style={styles.transcriptionError}>
          <Ionicons name="warning" size={20} color={palette.error} />
          <Text style={[styles.transcriptionErrorText, { color: palette.error }]}>
            {error}
          </Text>
        </View>
        {onRetry && (
          <A11yPressable
            onPress={onRetry}
            style={[styles.transcriptionRetry, { borderColor: palette.error }]}
            accessibilityLabel={t('common.retry', 'Retry')}
          >
            <Ionicons name="refresh" size={16} color={palette.error} />
            <Text style={[styles.transcriptionRetryText, { color: palette.error }]}>
              {t('common.retry', 'Retry')}
            </Text>
          </A11yPressable>
        )}
      </View>
    );
  }

  if (!text) {
    return (
      <View 
        style={[styles.transcriptionBox, { backgroundColor: palette.surface, borderColor: palette.border }]}
      >
        <Text style={[styles.transcriptionPlaceholder, { color: palette.textSecondary }]}>
          {t('voiceNotes.noTranscript', 'No transcript available. Tap to generate.')}
        </Text>
      </View>
    );
  }

  return (
    <View 
      style={[styles.transcriptionBox, { backgroundColor: palette.surface, borderColor: palette.border }]}
      accessibilityRole="text"
    >
      <View style={styles.transcriptionHeader}>
        <View style={styles.transcriptionHeaderLeft}>
          <Ionicons name="document-text" size={16} color={palette.primary} />
          <Text style={[styles.transcriptionLabel, { color: palette.primary }]}>
            {t('voiceNotes.transcript', 'Transcript')}
          </Text>
        </View>
        {confidence !== undefined && (
          <Text 
            style={[styles.transcriptionConfidence, { color: palette.textSecondary }]}
            accessibilityLabel={`Confidence: ${Math.round(confidence * 100)}%`}
          >
            {Math.round(confidence * 100)}% accurate
          </Text>
        )}
      </View>
      <Text 
        style={[styles.transcriptionText, { color: palette.text }]}
        selectable
      >
        {text}
      </Text>
    </View>
  );
}

/**
 * ASL Resources Link Component
 */
interface ASLResourcesProps {
  /** Topic to search for (optional) */
  topic?: string;
  /** Style variant */
  variant?: 'button' | 'link' | 'card';
}

export function ASLResources({ topic, variant = 'link' }: ASLResourcesProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const [modalVisible, setModalVisible] = useState(false);

  const resources = [
    {
      name: 'HandSpeak',
      url: topic 
        ? `https://www.handspeak.com/word/search/index.php?id=${encodeURIComponent(topic)}`
        : 'https://www.handspeak.com/',
      description: 'ASL dictionary with video demonstrations',
      icon: 'hand-right' as const,
    },
    {
      name: 'Signing Savvy',
      url: topic
        ? `https://www.signingsavvy.com/search/${encodeURIComponent(topic)}`
        : 'https://www.signingsavvy.com/',
      description: 'Sign language dictionary and learning resources',
      icon: 'book' as const,
    },
    {
      name: 'Lifeprint / ASLU',
      url: 'https://www.lifeprint.com/',
      description: 'Free ASL lessons by Dr. Bill Vicars',
      icon: 'school' as const,
    },
    {
      name: 'ASL THAT!',
      url: 'https://www.youtube.com/@ASLTHAT',
      description: 'Deaf-led YouTube channel with ASL content',
      icon: 'play-circle' as const,
    },
  ];

  const openResource = (url: string) => {
    Linking.openURL(url).catch(() => {
      // Handle error silently
    });
  };

  if (variant === 'link') {
    return (
      <Pressable
        onPress={() => setModalVisible(true)}
        style={styles.aslLink}
        accessibilityRole="button"
        accessibilityLabel={t('accessibility.aslResources', 'ASL Resources')}
        hitSlop={HIT_SLOP_12}
      >
        <Ionicons name="hand-right" size={16} color={palette.primary} />
        <Text style={[styles.aslLinkText, { color: palette.primary }]}>
          {t('accessibility.aslResources', 'ASL Resources')}
        </Text>
      </Pressable>
    );
  }

  const renderContent = () => (
    <View style={[styles.aslCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={styles.aslCardHeader}>
        <Ionicons name="hand-right" size={24} color={palette.primary} />
        <Text style={[styles.aslCardTitle, { color: palette.text }]}>
          {t('accessibility.aslResources', 'ASL Resources')}
        </Text>
      </View>
      <Text style={[styles.aslCardDesc, { color: palette.textSecondary }]}>
        {t('accessibility.aslDescription', 'Learn American Sign Language and find Deaf community resources')}
      </Text>
      
      {resources.map((resource, index) => (
        <A11yPressable
          key={index}
          onPress={() => openResource(resource.url)}
          style={[styles.aslResourceRow, { borderBottomColor: palette.border }]}
          accessibilityRole="link"
          accessibilityLabel={`${resource.name}: ${resource.description}`}
        >
          <Ionicons name={resource.icon} size={20} color={palette.primary} />
          <View style={styles.aslResourceText}>
            <Text style={[styles.aslResourceName, { color: palette.text }]}>
              {resource.name}
            </Text>
            <Text style={[styles.aslResourceDesc, { color: palette.textSecondary }]}>
              {resource.description}
            </Text>
          </View>
          <Ionicons name="open-outline" size={16} color={palette.textSecondary} />
        </A11yPressable>
      ))}
    </View>
  );

  if (variant === 'card') {
    return renderContent();
  }

  // Button variant with modal
  return (
    <>
      <A11yPressable
        onPress={() => setModalVisible(true)}
        style={[styles.aslButton, { backgroundColor: palette.primary }]}
        accessibilityRole="button"
        accessibilityLabel={t('accessibility.aslResources', 'ASL Resources')}
        hitSlop={HIT_SLOP_12}
      >
        <Ionicons name="hand-right" size={20} color={palette.onPrimary} />
        <Text style={[styles.aslButtonText, { color: palette.onPrimary }]}>
          {t('accessibility.aslResources', 'ASL Resources')}
        </Text>
      </A11yPressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        accessibilityViewIsModal
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.card }]}>
            <View style={styles.modalHeader}>
              <Text 
                style={[styles.modalTitle, { color: palette.text }]}
                accessibilityRole="header"
              >
                {t('accessibility.aslResources', 'ASL Resources')}
              </Text>
              <A11yPressable
                onPress={() => setModalVisible(false)}
                style={[styles.closeButton, { backgroundColor: palette.surface }]}
                accessibilityLabel={t('common.close', 'Close')}
              >
                <Ionicons name="close" size={24} color={palette.text} />
              </A11yPressable>
            </View>
            
            {resources.map((resource, index) => (
              <A11yPressable
                key={index}
                onPress={() => {
                  openResource(resource.url);
                  setModalVisible(false);
                }}
                style={[styles.aslResourceRow, { borderBottomColor: palette.border }]}
                accessibilityRole="link"
              >
                <Ionicons name={resource.icon} size={20} color={palette.primary} />
                <View style={styles.aslResourceText}>
                  <Text style={[styles.aslResourceName, { color: palette.text }]}>
                    {resource.name}
                  </Text>
                  <Text style={[styles.aslResourceDesc, { color: palette.textSecondary }]}>
                    {resource.description}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={16} color={palette.textSecondary} />
              </A11yPressable>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

/**
 * Deaf/HoH Settings Panel Component
 */
export function DeafHoHSettingsPanel() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { prefs, updatePrefs, loaded } = useDeafHoHPreferences();

  if (!loaded) return null;

  const renderToggle = (
    value: boolean, 
    onToggle: () => void, 
    label: string,
    description?: string,
    icon?: keyof typeof Ionicons.glyphMap
  ) => (
    <A11yPressable
      onPress={onToggle}
      style={[styles.settingRow, { borderBottomColor: palette.border }]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={`${label}. ${description || ''}`}
    >
      <View style={styles.settingContent}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={24} 
            color={value ? palette.primary : palette.textSecondary} 
          />
        )}
        <View style={styles.settingText}>
          <Text style={[styles.settingLabel, { color: palette.text }]}>
            {label}
          </Text>
          {description && (
            <Text style={[styles.settingDesc, { color: palette.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <View style={[
        styles.toggle,
        { backgroundColor: value ? palette.primary : palette.muted }
      ]}>
        <View style={[
          styles.toggleKnob,
          { 
            backgroundColor: palette.card,
            transform: [{ translateX: value ? 20 : 0 }]
          }
        ]} />
      </View>
    </A11yPressable>
  );

  return (
    <View style={[styles.settingsPanel, { backgroundColor: palette.card }]}>
      <Text 
        style={[styles.settingsTitle, { color: palette.text }]}
        accessibilityRole="header"
      >
        🦻 {t('accessibility.deafHoHSettings', 'Deaf/Hard-of-Hearing Settings')}
      </Text>
      
      {renderToggle(
        prefs.visualAlerts,
        () => updatePrefs({ visualAlerts: !prefs.visualAlerts }),
        t('accessibility.visualAlerts', 'Visual Alerts'),
        t('accessibility.visualAlertsDesc', 'Flash screen for notifications instead of sound'),
        'flash'
      )}
      
      {renderToggle(
        prefs.vibrationAlerts,
        () => updatePrefs({ vibrationAlerts: !prefs.vibrationAlerts }),
        t('accessibility.vibrationAlerts', 'Vibration Alerts'),
        t('accessibility.vibrationAlertsDesc', 'Use vibration for important notifications'),
        'phone-portrait'
      )}
      
      {renderToggle(
        prefs.preferCaptions,
        () => updatePrefs({ preferCaptions: !prefs.preferCaptions }),
        t('accessibility.preferCaptions', 'Prefer Captions'),
        t('accessibility.preferCaptionsDesc', 'Always show transcripts for audio content'),
        'text'
      )}
      
      {renderToggle(
        prefs.flashForUrgent,
        () => updatePrefs({ flashForUrgent: !prefs.flashForUrgent }),
        t('accessibility.flashUrgent', 'Flash for Urgent Alerts'),
        t('accessibility.flashUrgentDesc', 'Use brighter flash for emergency notifications'),
        'alert-circle'
      )}
      
      {renderToggle(
        prefs.prominentTypingIndicator,
        () => updatePrefs({ prominentTypingIndicator: !prefs.prominentTypingIndicator }),
        t('accessibility.prominentTyping', 'Prominent Typing Indicator'),
        t('accessibility.prominentTypingDesc', 'Show larger, more visible typing indicators'),
        'chatbubble-ellipses'
      )}
      
      <View style={styles.settingsDivider} />
      
      <ASLResources variant="card" />
    </View>
  );
}

/**
 * Hook to trigger visual/vibration alerts based on user preferences
 */
export function useAccessibleNotification() {
  const { prefs } = useDeafHoHPreferences();
  const [alertState, setAlertState] = useState<{
    active: boolean;
    type: 'info' | 'warning' | 'urgent' | 'success';
  }>({ active: false, type: 'info' });

  const notify = useCallback((
    message: string,
    type: 'info' | 'warning' | 'urgent' | 'success' = 'info'
  ) => {
    // Announce for screen readers (native only)
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(message);
    }

    // Visual alert if enabled
    if (prefs.visualAlerts || (prefs.flashForUrgent && type === 'urgent')) {
      setAlertState({ active: true, type });
    }

    // Vibration if enabled
    if (prefs.vibrationAlerts && Platform.OS !== 'web') {
      try {
        if (type === 'urgent' && Vibration) {
          Vibration.vibrate([100, 100, 100, 100, 200]);
        } else {
          Haptics.notificationAsync(
            type === 'warning'
              ? Haptics.NotificationFeedbackType.Warning
              : type === 'success'
              ? Haptics.NotificationFeedbackType.Success
              : Haptics.NotificationFeedbackType.Success
          );
        }
      } catch {
        // Haptics not available
      }
    }
  }, [prefs]);

  const clearAlert = useCallback(() => {
    setAlertState({ active: false, type: 'info' });
  }, []);

  return {
    notify,
    alertState,
    clearAlert,
    VisualAlertComponent: (
      <VisualAlert
        active={alertState.active}
        type={alertState.type}
        onComplete={clearAlert}
      />
    ),
  };
}

const styles = StyleSheet.create({
  // Visual Alert
  visualAlertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  
  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  typingContainerProminent: {
    padding: 12,
    borderRadius: 20,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingText: {
    fontSize: 14,
    flex: 1,
  },
  
  // Transcription
  transcriptionBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transcriptionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transcriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transcriptionConfidence: {
    fontSize: 11,
  },
  transcriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  transcriptionLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transcriptionLoadingText: {
    fontSize: 14,
  },
  transcriptionError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transcriptionErrorText: {
    fontSize: 14,
    flex: 1,
  },
  transcriptionRetry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  transcriptionRetryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  transcriptionPlaceholder: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  // ASL Resources
  aslLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  aslLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aslButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 48,
  },
  aslButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  aslCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  aslCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aslCardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  aslCardDesc: {
    fontSize: 14,
    marginBottom: 12,
  },
  aslResourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 48,
  },
  aslResourceText: {
    flex: 1,
  },
  aslResourceName: {
    fontSize: 15,
    fontWeight: '600',
  },
  aslResourceDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Settings Panel
  settingsPanel: {
    borderRadius: 12,
    padding: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  settingsDivider: {
    height: 16,
  },
});

export default {
  VisualAlert,
  AccessibleTypingIndicator,
  TranscriptionDisplay,
  ASLResources,
  DeafHoHSettingsPanel,
  useDeafHoHPreferences,
  useAccessibleNotification,
};
