/**
 * DonationButton - Support/Donate button for sustainable development
 * 
 * Features:
 * - Multiple donation platform support (Ko-fi, Buy Me a Coffee, GitHub Sponsors, PayPal, custom)
 * - Configurable appearance (button, card, banner)
 * - Analytics tracking
 * - Accessible design
 * - Optional dismissal with persistence
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Linking,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { logEvent } from '../services/analytics';
import { useAppPalette } from '../theme/usePalette';
import { createShadow } from '../utils/shadow';

import A11yPressable from './A11yPressable';
import GapView from './GapView';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

const DISMISSAL_KEY = 'donation.button.dismissed';
const DISMISSAL_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

// Donation platform configurations
// TODO: Update these URLs once bank account is set up
// Brand colors are intentionally hardcoded per platform identity guidelines
// White text on colored buttons is intentional for contrast
/* eslint-disable no-restricted-syntax */
export const DONATION_PLATFORMS = {
  kofi: {
    name: 'Ko-fi',
    icon: 'cafe-outline' as const,
    url: 'https://ko-fi.com/3mpwr', // Placeholder - update when account created
    color: '#FF5E5B', // Ko-fi brand red
    description: 'Buy us a coffee',
  },
  buymeacoffee: {
    name: 'Buy Me a Coffee',
    icon: 'heart-outline' as const,
    url: 'https://www.buymeacoffee.com/3mpwr', // Placeholder
    color: '#FFDD00', // BMC brand yellow
    description: 'Support development',
  },
  github: {
    name: 'GitHub Sponsors',
    icon: 'logo-github' as const,
    url: 'https://github.com/sponsors/3mpwr-App', // Placeholder
    color: '#6e5494', // GitHub purple
    description: 'Sponsor on GitHub',
  },
  paypal: {
    name: 'PayPal',
    icon: 'card-outline' as const,
    url: 'https://paypal.me/3mpwrapp', // Placeholder
    color: '#003087', // PayPal blue
    description: 'Donate via PayPal',
  },
  custom: {
    name: 'Support Us',
    icon: 'gift-outline' as const,
    url: 'https://3mpwrapp.pages.dev/donate', // Website donation page
    color: '#9333EA', // 3mpwr purple (matches app primary)
    description: 'Learn about supporting 3mpwr',
  },
} as const;

type DonationPlatform = keyof typeof DONATION_PLATFORMS;

interface DonationButtonProps {
  /** Which platform to link to */
  platform?: DonationPlatform;
  /** Visual variant */
  variant?: 'button' | 'card' | 'banner' | 'compact';
  /** Allow dismissal */
  dismissible?: boolean;
  /** Custom label */
  label?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Show heart animation on press */
  showHeartAnimation?: boolean;
}

export default function DonationButton({
  platform = 'custom',
  variant = 'button',
  dismissible = false,
  label,
  subtitle,
  showHeartAnimation = true,
}: DonationButtonProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const [visible, setVisible] = useState(!dismissible);
  const [showHeart, setShowHeart] = useState(false);
  
  const config = DONATION_PLATFORMS[platform];

  useEffect(() => {
    if (dismissible) {
      checkDismissal();
    }
    logEvent('beta.donation.button.shown', { platform, variant });
  }, []);

  const checkDismissal = async () => {
    try {
      const dismissedAt = await AsyncStorage?.getItem?.(DISMISSAL_KEY);
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        if (Date.now() - dismissedTime < DISMISSAL_DURATION_MS) {
          setVisible(false);
          return;
        }
      }
      setVisible(true);
    } catch {
      setVisible(true);
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage?.setItem?.(DISMISSAL_KEY, String(Date.now()));
      logEvent('beta.donation.button.dismissed', { platform });
    } catch {}
    setVisible(false);
  };

  const handlePress = async () => {
    logEvent('beta.donation.button.pressed', { 
      platform,
      variant,
      url: config.url,
    });

    if (showHeartAnimation) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    }

    try {
      await Linking.openURL(config.url);
    } catch {
      // Fallback to website
      await Linking.openURL('https://3mpwrapp.pages.dev/donate');
    }
  };

  if (!visible) return null;

  const styles = createStyles(palette, config.color);
  const displayLabel = label || t('donation.supportUs', 'Support 3mpwr');
  const displaySubtitle = subtitle || config.description;

  // Heart animation overlay
  const HeartOverlay = showHeart ? (
    <View style={styles.heartOverlay}>
      <Text style={styles.heartEmoji}>💜</Text>
    </View>
  ) : null;

  // Compact button variant
  if (variant === 'compact') {
    return (
      <A11yPressable
        onPress={handlePress}
        style={styles.compactButton}
        accessibilityRole="button"
        accessibilityLabel={t('donation.supportA11y', 'Support 3mpwr development. Opens donation page.')}
        hitSlop={HIT_SLOP_8}
      >
        <Ionicons name="heart" size={16} color={palette.onPrimary} />
        <Text style={styles.compactText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('donation.support', 'Support')}
        </Text>
        {HeartOverlay}
      </A11yPressable>
    );
  }

  // Standard button variant
  if (variant === 'button') {
    return (
      <A11yPressable
        onPress={handlePress}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={t('donation.supportA11y', 'Support 3mpwr development. Opens donation page.')}
        hitSlop={HIT_SLOP_8}
      >
        <Ionicons name={config.icon} size={20} color={palette.onPrimary} />
        <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {displayLabel}
        </Text>
        {HeartOverlay}
      </A11yPressable>
    );
  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <View style={styles.banner}>
        <GapView style={styles.bannerContent} gap={12}>
          <Ionicons name="heart" size={24} color={palette.error} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {displayLabel}
            </Text>
            <Text style={styles.bannerSubtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('donation.bannerMessage', 'Help keep 3mpwr free and growing')}
            </Text>
          </View>
        </GapView>
        <GapView style={styles.bannerActions} gap={8}>
          <A11yPressable
            onPress={handlePress}
            style={styles.bannerButton}
            accessibilityRole="button"
            accessibilityLabel={t('donation.donateNow', 'Donate now')}
            hitSlop={HIT_SLOP_8}
          >
            <Text style={styles.bannerButtonText}>Donate</Text>
          </A11yPressable>
          {dismissible && (
            <A11yPressable
              onPress={handleDismiss}
              style={styles.bannerDismiss}
              accessibilityRole="button"
              accessibilityLabel={t('common.dismiss', 'Dismiss')}
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name="close" size={18} color={palette.muted} />
            </A11yPressable>
          )}
        </GapView>
        {HeartOverlay}
      </View>
    );
  }

  // Card variant (most prominent)
  return (
    <View style={styles.card}>
      {dismissible && (
        <A11yPressable
          onPress={handleDismiss}
          style={styles.cardDismiss}
          accessibilityRole="button"
          accessibilityLabel={t('common.dismiss', 'Dismiss')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="close" size={20} color={palette.muted} />
        </A11yPressable>
      )}

      <Text style={styles.cardEmoji}>💜</Text>
      <Text style={styles.cardTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('donation.cardTitle', 'Support 3mpwr')}
      </Text>
      <Text style={styles.cardSubtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('donation.cardMessage', 
          "3mpwr is free and community-driven. Your support helps us keep developing features for the disability community."
        )}
      </Text>

      <A11yPressable
        onPress={handlePress}
        style={styles.cardButton}
        accessibilityRole="button"
        accessibilityLabel={t('donation.supportA11y', 'Support 3mpwr development. Opens donation page.')}
        hitSlop={HIT_SLOP_8}
      >
        <Ionicons name={config.icon} size={20} color={palette.onPrimary} />
        <Text style={styles.cardButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {displaySubtitle}
        </Text>
      </A11yPressable>

      <Text style={styles.cardFooter} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('donation.cardFooter', 'Every contribution makes a difference')}
      </Text>
      {HeartOverlay}
    </View>
  );
}

/**
 * Component to show multiple donation options
 */
export function DonationOptions() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const styles = createStyles(palette, palette.primary);

  const handlePlatformPress = (platform: DonationPlatform) => {
    const config = DONATION_PLATFORMS[platform];
    logEvent('beta.donation.platform.selected', { platform });
    Linking.openURL(config.url);
  };

  return (
    <View style={styles.optionsContainer}>
      <Text style={styles.optionsTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('donation.chooseMethod', 'Choose how to support')}
      </Text>
      <GapView style={styles.optionsGrid} gap={12}>
        {(Object.keys(DONATION_PLATFORMS) as DonationPlatform[])
          .filter(p => p !== 'custom')
          .map((platform) => {
            const config = DONATION_PLATFORMS[platform];
            return (
              <A11yPressable
                key={platform}
                onPress={() => handlePlatformPress(platform)}
                style={[styles.optionCard, { borderColor: config.color + '40' }]}
                accessibilityRole="button"
                accessibilityLabel={`${config.name}: ${config.description}`}
                hitSlop={HIT_SLOP_8}
              >
                <Ionicons name={config.icon} size={24} color={config.color} />
                <Text style={styles.optionName}>{config.name}</Text>
              </A11yPressable>
            );
          })}
      </GapView>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, accentColor: string) {
  return StyleSheet.create({
    // Compact variant
    compactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.error,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      gap: 4,
    },
    compactText: {
      color: palette.onPrimary,
      fontSize: 12,
      fontWeight: '600',
    },

    // Button variant
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: accentColor,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      gap: 8,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },

    // Banner variant
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: palette.card,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.error + '30',
    },
    bannerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    bannerTextContainer: {
      flex: 1,
    },
    bannerTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
    },
    bannerSubtitle: {
      fontSize: 12,
      color: palette.muted,
    },
    bannerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bannerButton: {
      backgroundColor: palette.error,
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 6,
    },
    bannerButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },
    bannerDismiss: {
      padding: 4,
    },

    // Card variant
    card: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 16,
      marginVertical: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
      ...createShadow({
        shadowColor: palette.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }),
    },
    cardDismiss: {
      position: 'absolute',
      top: 12,
      right: 12,
      padding: 4,
    },
    cardEmoji: {
      fontSize: 40,
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    cardSubtitle: {
      fontSize: 14,
      color: palette.muted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    cardButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.error,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      gap: 8,
      width: '100%',
    },
    cardButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    cardFooter: {
      fontSize: 12,
      color: palette.muted,
      marginTop: 12,
    },

    // Options component
    optionsContainer: {
      padding: 16,
    },
    optionsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    optionCard: {
      alignItems: 'center',
      backgroundColor: palette.card,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 10,
      borderWidth: 1,
      minWidth: 100,
    },
    optionName: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
      marginTop: 6,
    },

    // Heart animation
    heartOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    heartEmoji: {
      fontSize: 48,
      opacity: 0.8,
    },
  });
}
