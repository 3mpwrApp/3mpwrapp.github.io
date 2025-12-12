/**
 * ContentWarning Component
 * 
 * Provides trauma-informed content warnings before displaying potentially
 * triggering content. Users can choose to continue, go back, or dismiss
 * warnings for this session/permanently.
 * 
 * Usage:
 * <ContentWarning
 *   type="grief"
 *   title="Content Warning"
 *   message="This section discusses loss and grief."
 *   onContinue={() => setShowContent(true)}
 *   onExit={() => router.back()}
 * />
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    AccessibilityInfo,
    Modal,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { HIT_SLOP_12 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

const DISMISSED_WARNINGS_KEY = 'accessibility.contentWarnings.dismissed';

// Warning types with associated icons and colors
export type ContentWarningType = 
  | 'grief'
  | 'trauma'
  | 'discrimination'
  | 'medical'
  | 'legal_denial'
  | 'abuse'
  | 'mental_health'
  | 'violence'
  | 'financial_stress'
  | 'workplace_injury'
  | 'general';

interface ContentWarningConfig {
  icon: keyof typeof Ionicons.glyphMap;
  defaultTitle: string;
  defaultMessage: string;
  colorKey: 'primary' | 'error' | 'warning' | 'success' | 'muted';
}

const WARNING_CONFIGS: Record<ContentWarningType, ContentWarningConfig> = {
  grief: {
    icon: 'heart-outline',
    defaultTitle: 'Content Warning: Grief & Loss',
    defaultMessage: 'This section discusses grief, loss, and identity changes. Take your time and practice self-care.',
    colorKey: 'primary',
  },
  trauma: {
    icon: 'shield-outline',
    defaultTitle: 'Content Warning: Trauma',
    defaultMessage: 'This content may include references to traumatic experiences. Your safety comes first.',
    colorKey: 'warning',
  },
  discrimination: {
    icon: 'warning-outline',
    defaultTitle: 'Content Warning: Discrimination',
    defaultMessage: 'This section discusses discrimination, denial of rights, or systemic barriers. This can be emotionally challenging.',
    colorKey: 'error',
  },
  medical: {
    icon: 'medkit-outline',
    defaultTitle: 'Content Warning: Medical Information',
    defaultMessage: 'This content includes medical topics, symptoms, or health conditions that some may find distressing.',
    colorKey: 'success',
  },
  legal_denial: {
    icon: 'document-text-outline',
    defaultTitle: 'Content Warning: Claim Denials',
    defaultMessage: 'This section involves claim denials, appeals, or adverse legal decisions. These topics can be stressful.',
    colorKey: 'primary',
  },
  abuse: {
    icon: 'alert-circle-outline',
    defaultTitle: 'Content Warning: Abuse',
    defaultMessage: 'This content may reference abuse, harassment, or harmful situations. Your wellbeing matters.',
    colorKey: 'error',
  },
  mental_health: {
    icon: 'heart-half-outline',
    defaultTitle: 'Content Warning: Mental Health',
    defaultMessage: 'This section discusses mental health challenges, crisis, or emotional difficulties.',
    colorKey: 'primary',
  },
  violence: {
    icon: 'alert-outline',
    defaultTitle: 'Content Warning: Violence',
    defaultMessage: 'This content may include references to violence or harmful situations.',
    colorKey: 'error',
  },
  financial_stress: {
    icon: 'cash-outline',
    defaultTitle: 'Content Warning: Financial Stress',
    defaultMessage: 'This section discusses financial hardship, benefit denials, or economic challenges.',
    colorKey: 'warning',
  },
  workplace_injury: {
    icon: 'body-outline',
    defaultTitle: 'Content Warning: Workplace Injury',
    defaultMessage: 'This content discusses workplace injuries, WCB/WSIB claims, and recovery challenges.',
    colorKey: 'warning',
  },
  general: {
    icon: 'information-circle-outline',
    defaultTitle: 'Content Warning',
    defaultMessage: 'The following content may be sensitive or emotionally challenging for some readers.',
    colorKey: 'muted',
  },
};

interface ContentWarningProps {
  /** Type of warning - determines icon, color, and default messaging */
  type: ContentWarningType;
  /** Custom title (overrides default) */
  title?: string;
  /** Custom message (overrides default) */
  message?: string;
  /** Called when user chooses to view content */
  onContinue: () => void;
  /** Called when user chooses to go back */
  onExit?: () => void;
  /** Unique ID for this warning (for "don't show again" feature) */
  warningId?: string;
  /** Show as modal overlay */
  asModal?: boolean;
  /** Children to show after warning is dismissed */
  children?: React.ReactNode;
  /** Whether to show "Don't show this again" option */
  allowPermanentDismiss?: boolean;
  /** Additional context to display */
  additionalInfo?: string;
}

export default function ContentWarning({
  type,
  title,
  message,
  onContinue,
  onExit,
  warningId,
  asModal = true,
  children,
  allowPermanentDismiss = true,
  additionalInfo,
}: ContentWarningProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const config = WARNING_CONFIGS[type];
  
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const displayTitle = title || t(`contentWarning.${type}.title`, config.defaultTitle);
  const displayMessage = message || t(`contentWarning.${type}.message`, config.defaultMessage);
  
  // Check if warning was previously dismissed
  useEffect(() => {
    (async () => {
      if (!warningId || !allowPermanentDismiss) {
        setLoading(false);
        return;
      }
      
      try {
        const dismissedJson = await AsyncStorage?.getItem?.(DISMISSED_WARNINGS_KEY);
        if (dismissedJson) {
          const dismissedList: string[] = JSON.parse(dismissedJson);
          if (dismissedList.includes(warningId)) {
            setDismissed(true);
            setVisible(false);
            onContinue();
          }
        }
      } catch {}
      
      setLoading(false);
    })();
  }, [warningId, allowPermanentDismiss, onContinue]);
  
  // Announce to screen readers when warning appears
  useEffect(() => {
    if (visible && !loading && !dismissed) {
      AccessibilityInfo.announceForAccessibility(
        `Content warning: ${displayTitle}. ${displayMessage}`
      );
    }
  }, [visible, loading, dismissed, displayTitle, displayMessage]);
  
  const handleContinue = () => {
    setVisible(false);
    onContinue();
  };
  
  const handleExit = () => {
    setVisible(false);
    onExit?.();
  };
  
  const handleDismissPermanently = async () => {
    if (!warningId) {
      handleContinue();
      return;
    }
    
    try {
      const dismissedJson = await AsyncStorage?.getItem?.(DISMISSED_WARNINGS_KEY);
      const dismissedList: string[] = dismissedJson ? JSON.parse(dismissedJson) : [];
      
      if (!dismissedList.includes(warningId)) {
        dismissedList.push(warningId);
        await AsyncStorage?.setItem?.(DISMISSED_WARNINGS_KEY, JSON.stringify(dismissedList));
      }
    } catch {}
    
    handleContinue();
  };
  
  if (loading || dismissed) {
    return children ? <>{children}</> : null;
  }
  
  if (!visible) {
    return children ? <>{children}</> : null;
  }
  
  const warningContent = (
    <View 
      style={[styles.container, { backgroundColor: palette.card }]}
      accessibilityRole="alert"
      accessibilityLabel={`${displayTitle}. ${displayMessage}`}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: palette[config.colorKey] + '20' }]}>
        <Ionicons 
          name={config.icon} 
          size={48} 
          color={palette[config.colorKey]}
          accessibilityLabel={`${type} warning icon`}
        />
      </View>
      
      {/* Title */}
      <Text 
        style={[styles.title, { color: palette.text }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        accessibilityRole="header"
      >
        {displayTitle}
      </Text>
      
      {/* Message */}
      <Text 
        style={[styles.message, { color: palette.textSecondary }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {displayMessage}
      </Text>
      
      {/* Additional info */}
      {additionalInfo && (
        <Text 
          style={[styles.additionalInfo, { color: palette.textSecondary }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {additionalInfo}
        </Text>
      )}
      
      {/* Self-care reminder */}
      <View style={[styles.selfCareBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <Ionicons name="heart" size={20} color={palette.primary} />
        <Text 
          style={[styles.selfCareText, { color: palette.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t('contentWarning.selfCare', 'Take your time. There\'s no rush. Your wellbeing comes first.')}
        </Text>
      </View>
      
      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        {onExit && (
          <A11yPressable
            onPress={handleExit}
            style={[styles.button, styles.exitButton, { borderColor: palette.border }]}
            accessibilityLabel={t('contentWarning.goBack', 'Go back to safety')}
            accessibilityHint="Returns to the previous screen"
            hitSlop={HIT_SLOP_12}
          >
            <Ionicons name="arrow-back" size={20} color={palette.text} />
            <Text style={[styles.buttonText, { color: palette.text }]}>
              {t('contentWarning.goBack', 'Go Back')}
            </Text>
          </A11yPressable>
        )}
        
        <A11yPressable
          onPress={handleContinue}
          style={[styles.button, styles.continueButton, { backgroundColor: palette.primary }]}
          accessibilityLabel={t('contentWarning.continue', 'I\'m ready to continue')}
          accessibilityHint="Proceeds to view the content"
          hitSlop={HIT_SLOP_12}
        >
          <Text style={[styles.buttonText, { color: palette.onPrimary }]}>
            {t('contentWarning.continue', 'Continue')}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={palette.onPrimary} />
        </A11yPressable>
      </View>
      
      {/* Don't show again option */}
      {allowPermanentDismiss && warningId && (
        <A11yPressable
          onPress={handleDismissPermanently}
          style={styles.dismissLink}
          accessibilityLabel={t('contentWarning.dontShowAgain', 'Don\'t show this warning again')}
          hitSlop={HIT_SLOP_12}
        >
          <Text style={[styles.dismissText, { color: palette.textSecondary }]}>
            {t('contentWarning.dontShowAgain', 'Don\'t show this warning again')}
          </Text>
        </A11yPressable>
      )}
    </View>
  );
  
  if (asModal) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleExit}
        accessibilityViewIsModal
      >
        <View style={styles.modalOverlay}>
          {warningContent}
        </View>
      </Modal>
    );
  }
  
  return warningContent;
}

/**
 * Hook to check if a content warning should be shown
 */
export function useContentWarningDismissed(warningId: string): {
  isDismissed: boolean;
  loading: boolean;
  resetWarning: () => Promise<void>;
} {
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    (async () => {
      try {
        const dismissedJson = await AsyncStorage?.getItem?.(DISMISSED_WARNINGS_KEY);
        if (dismissedJson) {
          const dismissedList: string[] = JSON.parse(dismissedJson);
          setIsDismissed(dismissedList.includes(warningId));
        }
      } catch {}
      setLoading(false);
    })();
  }, [warningId]);
  
  const resetWarning = async () => {
    try {
      const dismissedJson = await AsyncStorage?.getItem?.(DISMISSED_WARNINGS_KEY);
      if (dismissedJson) {
        const dismissedList: string[] = JSON.parse(dismissedJson);
        const filtered = dismissedList.filter(id => id !== warningId);
        await AsyncStorage?.setItem?.(DISMISSED_WARNINGS_KEY, JSON.stringify(filtered));
        setIsDismissed(false);
      }
    } catch {}
  };
  
  return { isDismissed, loading, resetWarning };
}

/**
 * Reset all content warning dismissals
 */
export async function resetAllContentWarnings(): Promise<void> {
  try {
    await AsyncStorage?.removeItem?.(DISMISSED_WARNINGS_KEY);
  } catch {}
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  additionalInfo: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  selfCareBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  selfCareText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    minHeight: 48,
  },
  exitButton: {
    borderWidth: 2,
  },
  continueButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dismissLink: {
    marginTop: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
