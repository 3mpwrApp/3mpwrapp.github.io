/**
 * Beta Tester Badge Component
 * 
 * Displays a badge for beta testers in their profile or settings.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { getBetaBadgeDisplay, markBetaBadgeWelcomeSeen, shouldShowBetaBadgeWelcome } from '../services/betaBadge';
import { useAppPalette } from '../theme/usePalette';

export function BetaTesterBadge({ 
  size = 'medium',
  showWelcome = false,
  onWelcomeDismiss,
}: {
  size?: 'small' | 'medium' | 'large';
  showWelcome?: boolean;
  onWelcomeDismiss?: () => void;
}) {
  const palette = useAppPalette();
  const [badgeData, setBadgeData] = React.useState<Awaited<ReturnType<typeof getBetaBadgeDisplay>> | null>(null);
  const [showWelcomeCard, setShowWelcomeCard] = React.useState(false);

  React.useEffect(() => {
    loadBadgeData();
  }, []);

  async function loadBadgeData() {
    const data = await getBetaBadgeDisplay();
    setBadgeData(data);

    if (showWelcome) {
      const shouldShow = await shouldShowBetaBadgeWelcome();
      setShowWelcomeCard(shouldShow);
    }
  }

  const handleWelcomeDismiss = async () => {
    await markBetaBadgeWelcomeSeen();
    setShowWelcomeCard(false);
    onWelcomeDismiss?.();
  };

  if (!badgeData?.show) {
    return null;
  }

  const iconSize = size === 'small' ? 16 : size === 'large' ? 32 : 24;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;

  return (
    <>
      {showWelcomeCard && (
        <View style={[styles.welcomeCard, { backgroundColor: badgeData.color + '15', borderColor: badgeData.color }]}>
          <View style={styles.welcomeHeader}>
            <MaterialCommunityIcons name={badgeData.icon as any} size={32} color={badgeData.color} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.welcomeTitle, { color: palette.text }]}>
                Welcome, Beta Tester!
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: palette.textSecondary }]}>
                You've earned the exclusive Beta Tester badge
              </Text>
            </View>
          </View>
          <Text style={[styles.welcomeBody, { color: palette.text }]}>
            Thank you for being part of our closed beta! Your feedback is invaluable in helping us 
            improve 3mpwr App. This badge will appear on your profile as a thank you for your early support.
          </Text>
          <Pressable 
            onPress={handleWelcomeDismiss}
            style={[styles.welcomeButton, { backgroundColor: badgeData.color }]}
            accessibilityRole="button"
            accessibilityLabel="Dismiss beta badge welcome message"
            hitSlop={HIT_SLOP_8}
          >
            <Text style={styles.welcomeButtonText}>Got it!</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.badge, { backgroundColor: badgeData.color + '15' }]}>
        <MaterialCommunityIcons name={badgeData.icon as any} size={iconSize} color={badgeData.color} />
        <View style={styles.badgeText}>
          <Text style={[styles.badgeTitle, { fontSize, color: badgeData.color }]}>
            {badgeData.title}
          </Text>
          {size !== 'small' && (
            <Text style={[styles.badgeSubtitle, { fontSize: fontSize * 0.85, color: palette.textSecondary }]}>
              {badgeData.subtitle}
            </Text>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    marginLeft: 6,
  },
  badgeTitle: {
    fontWeight: '700',
  },
  badgeSubtitle: {
    opacity: 0.8,
  },
  welcomeCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  welcomeBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  welcomeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  welcomeButtonText: {
    // Note: Using white color for button text - acceptable for high contrast buttons
    color: '#ffffff', // eslint-disable-line no-restricted-syntax
    fontWeight: '700',
    fontSize: 14,
  },
});
