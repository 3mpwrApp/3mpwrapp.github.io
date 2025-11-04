import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import { ANALYTICS_EVENTS, trackEvent } from '../services/analyticsClient';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

/**
 * Card component for calendar subscription feature.
 * Displays information and action button for subscribing to auto-updating events calendar.
 */
export default function CalendarSubscriptionCard() {
  const palette = useAppPalette();

  const handleSubscribe = () => {
    const subscriptionUrl = process.env.EXPO_PUBLIC_CALENDAR_FEED_URL || 'https://your-server.com/events.ics';
    
    Alert.alert(
      'Subscribe to Calendar',
      `To receive automatic updates:\n\n1. Copy this URL:\n${subscriptionUrl}\n\n2. Open your calendar app\n3. Add a new calendar subscription\n4. Paste the URL\n\nYour calendar will refresh automatically!`,
      [
        {
          text: 'Copy URL',
          onPress: () => {
            Share.share({ message: subscriptionUrl });
            trackEvent(ANALYTICS_EVENTS.EVENTS_SUBSCRIBE_CALENDAR, { source: 'events_screen' });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
      <Text style={[styles.title, { color: palette.text }]}>
        📅 Subscribe to Auto-Updating Calendar
      </Text>
      <Text style={[styles.description, { color: palette.text }]}>
        Get automatic updates for new events, observances, and holidays
      </Text>
      <A11yPressable
        onPress={handleSubscribe}
        accessibilityRole="button"
        accessibilityLabel="Subscribe to calendar feed for automatic updates"
        style={[styles.button, { backgroundColor: palette.primary }]}
      >
        <Text style={[styles.buttonText, { color: palette.onPrimary }]}>
          📲 Subscribe to Calendar
        </Text>
      </A11yPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
