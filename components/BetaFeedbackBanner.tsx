/**
 * BetaFeedbackBanner - Persistent banner encouraging beta testers to share feedback
 * 
 * Features:
 * - Dismissible (persists dismissal for 7 days)
 * - Links to email feedback and in-app feedback
 * - Accessible with screen reader support
 * - Respects complexity mode
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { logEvent } from '../services/analytics';
import { useAppPalette } from '../theme/usePalette';
import { sendFeedbackEmailInternal } from '../utils/feedback';

import A11yPressable from './A11yPressable';
import GapView from './GapView';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

const DISMISSAL_KEY = 'beta.feedback.banner.dismissed';
const DISMISSAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BetaFeedbackBannerProps {
  /** Variant style */
  variant?: 'default' | 'compact' | 'prominent';
  /** Called when feedback is initiated */
  onFeedbackPress?: () => void;
  /** Show Sentry feedback widget instead of email */
  useSentryFeedback?: boolean;
}

export default function BetaFeedbackBanner({ 
  variant = 'default',
  onFeedbackPress,
  useSentryFeedback = false,
}: BetaFeedbackBannerProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDismissal();
  }, []);

  const checkDismissal = async () => {
    try {
      const dismissedAt = await AsyncStorage?.getItem?.(DISMISSAL_KEY);
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        if (Date.now() - dismissedTime < DISMISSAL_DURATION_MS) {
          setVisible(false);
          setLoading(false);
          return;
        }
      }
      setVisible(true);
    } catch {
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage?.setItem?.(DISMISSAL_KEY, String(Date.now()));
      logEvent('beta_feedback_banner_dismissed');
    } catch {}
    setVisible(false);
  };

  const handleFeedback = async () => {
    logEvent('beta_feedback_initiated', { source: 'banner' });
    
    if (onFeedbackPress) {
      onFeedbackPress();
      return;
    }

    if (useSentryFeedback) {
      try {
        const { showFeedbackWidget } = await import('../services/telemetry');
        showFeedbackWidget();
      } catch {
        // Fallback to email
        sendFeedbackEmailInternal(t);
      }
    } else {
      sendFeedbackEmailInternal(t);
    }
  };

  const handleDiscord = () => {
    logEvent('beta_discord_opened', { source: 'banner' });
    Linking.openURL('https://discord.gg/3mpwr');
  };

  if (loading || !visible) return null;

  const styles = createStyles(palette, variant);

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <A11yPressable
          onPress={handleFeedback}
          style={styles.compactButton}
          accessibilityRole="button"
          accessibilityLabel={t('beta.feedbackBanner.compactLabel', 'Share beta feedback')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={palette.onPrimary} />
          <Text style={styles.compactText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('beta.feedbackBanner.compactText', 'Beta Feedback')}
          </Text>
        </A11yPressable>
        <A11yPressable
          onPress={handleDismiss}
          style={styles.compactDismiss}
          accessibilityRole="button"
          accessibilityLabel={t('common.dismiss', 'Dismiss')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="close" size={16} color={palette.muted} />
        </A11yPressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GapView style={styles.titleRow} gap={8}>
          <Text style={styles.emoji}>🧪</Text>
          <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('beta.feedbackBanner.title', 'Beta Tester')}
          </Text>
        </GapView>
        <A11yPressable
          onPress={handleDismiss}
          style={styles.dismissButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.dismiss', 'Dismiss for 7 days')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="close" size={20} color={palette.muted} />
        </A11yPressable>
      </View>

      <Text style={styles.message} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('beta.feedbackBanner.message', 'Your feedback shapes this app! Found a bug? Have an idea? Let us know.')}
      </Text>

      <GapView style={styles.buttonRow} gap={12}>
        <A11yPressable
          onPress={handleFeedback}
          style={styles.primaryButton}
          accessibilityRole="button"
          accessibilityLabel={t('beta.feedbackBanner.sendFeedback', 'Send feedback via email')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="mail-outline" size={18} color={palette.onPrimary} />
          <Text style={styles.primaryButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('beta.feedbackBanner.emailButton', 'Email Feedback')}
          </Text>
        </A11yPressable>

        <A11yPressable
          onPress={handleDiscord}
          style={styles.secondaryButton}
          accessibilityRole="button"
          accessibilityLabel={t('beta.feedbackBanner.joinDiscord', 'Join Discord community')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="logo-discord" size={18} color={palette.primary} />
          <Text style={styles.secondaryButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('beta.feedbackBanner.discordButton', 'Discord')}
          </Text>
        </A11yPressable>
      </GapView>

      <Text style={styles.footer} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('beta.feedbackBanner.footer', '💜 Thank you for being an early tester!')}
      </Text>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, variant: string) {
  const isProminent = variant === 'prominent';
  
  return StyleSheet.create({
    container: {
      backgroundColor: isProminent ? palette.primary + '15' : palette.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: isProminent ? palette.primary + '40' : palette.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    emoji: {
      fontSize: 20,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
    },
    dismissButton: {
      padding: 4,
    },
    message: {
      fontSize: 14,
      color: palette.text,
      lineHeight: 20,
      marginBottom: 12,
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 6,
    },
    primaryButtonText: {
      color: palette.onPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.primary,
      gap: 6,
    },
    secondaryButtonText: {
      color: palette.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    footer: {
      fontSize: 12,
      color: palette.muted,
      marginTop: 12,
      textAlign: 'center',
    },
    // Compact variant styles
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.primary,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 8,
    },
    compactButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    compactText: {
      color: palette.onPrimary,
      fontSize: 13,
      fontWeight: '600',
    },
    compactDismiss: {
      padding: 4,
    },
  });
}
