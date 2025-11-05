import { Alert, Platform, Share, StyleSheet, Text, View } from 'react-native';

import { ANALYTICS_EVENTS, trackEvent } from '../services/analyticsClient';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

// Lazy load clipboard to avoid test issues
let Clipboard: any = null;
try {
  Clipboard = require('expo-clipboard');
} catch (err) {
  // Clipboard not available in test environment or failed to load
  console.warn('[CalendarSubscriptionCard] Clipboard not available:', err);
}

/**
 * Enhanced card component for calendar subscription feature.
 * Displays information and action button for subscribing to auto-updating events calendar.
 * Includes improved UI/UX with step-by-step instructions and better visual feedback.
 */
export default function CalendarSubscriptionCard() {
  const palette = useAppPalette();

  // Safety check for palette
  if (!palette || !palette.surface || !palette.primary || !palette.text) {
    console.error('[CalendarSubscriptionCard] Invalid palette:', palette);
    return null;
  }

  const handleSubscribe = async () => {
    // Updated URL to use website's public directory
    // The calendar feed should be generated via scripts/generate-calendar-feed.mjs and hosted at this location
    const subscriptionUrl = process.env.EXPO_PUBLIC_CALENDAR_FEED_URL || 'https://3mpwrapp.pages.dev/events.ics';
    
    try {
      // Copy to clipboard if available
      if (Clipboard?.setStringAsync) {
        await Clipboard.setStringAsync(subscriptionUrl);
      }
      
      Alert.alert(
        '📅 Subscribe to Auto-Updating Calendar',
        `${Clipboard?.setStringAsync ? '✅ URL copied to clipboard!\n\n' : ''}${subscriptionUrl}\n\n📱 Follow these steps:\n\n${Platform.select({
          ios: '1. Open Calendar app\n2. Tap "Calendars" at bottom\n3. Tap "Add Calendar"\n4. Tap "Add Subscription Calendar"\n5. Paste the URL\n6. Tap "Subscribe"',
          android: '1. Open Google Calendar\n2. Tap ☰ menu\n3. Tap "Settings"\n4. Tap "Add calendar"\n5. Tap "From URL"\n6. Paste the URL\n7. Tap "Add calendar"',
          default: '1. Open your calendar app\n2. Look for "Add subscription"\n3. Paste the URL\n4. Save'
        })}\n\n🔄 Your calendar will auto-update with new events!`,
        [
          {
            text: '📋 Copy Again',
            onPress: async () => {
              if (Clipboard?.setStringAsync) {
                await Clipboard.setStringAsync(subscriptionUrl);
                Alert.alert('✅ Copied!', 'URL copied to clipboard');
              } else {
                Alert.alert('URL', subscriptionUrl);
              }
            },
          },
          {
            text: '📤 Share URL',
            onPress: () => {
              Share.share({ 
                message: `Subscribe to 3mpwr App events: ${subscriptionUrl}`,
                title: '3mpwr App Calendar Subscription'
              });
            },
          },
          { text: 'Done', style: 'default' },
        ]
      );
      
      trackEvent(ANALYTICS_EVENTS.EVENTS_SUBSCRIBE_CALENDAR, { 
        source: 'events_screen',
        platform: Platform.OS
      });
    } catch {
      Alert.alert('Error', 'Could not copy URL. Please try again.');
    }
  };

  return (
    <View style={[styles.card, { 
      backgroundColor: palette.surface, 
      borderColor: palette.primary,
      shadowColor: palette.text,
    }]}>
      <View style={styles.header}>
        <Text style={[styles.emoji]}>📅</Text>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: palette.text }]}>
            Auto-Updating Calendar
          </Text>
          <Text style={[styles.badge, { backgroundColor: palette.primary, color: palette.onPrimary }]}>
            ✨ NEW
          </Text>
        </View>
      </View>
      
      <Text style={[styles.description, { color: palette.text }]}>
        Never miss disability awareness days, health observances, or community events. Subscribe once and your calendar stays up-to-date automatically!
      </Text>
      
      <View style={[styles.features, { borderTopColor: palette.muted }]}>
        <Text style={[styles.feature, { color: palette.text }]}>
          ✓ Automatic updates - no manual imports
        </Text>
        <Text style={[styles.feature, { color: palette.text }]}>
          ✓ Works with any calendar app
        </Text>
        <Text style={[styles.feature, { color: palette.text }]}>
          ✓ Privacy-first - no tracking
        </Text>
      </View>
      
      <A11yPressable
        onPress={handleSubscribe}
        accessibilityRole="button"
        accessibilityLabel="Subscribe to auto-updating calendar feed. Opens instructions for adding calendar subscription to your device."
        accessibilityHint="Copies subscription URL to clipboard and shows step-by-step instructions"
        style={[styles.button, { 
          backgroundColor: palette.primary,
          shadowColor: palette.primary,
        }]}
      >
        <Text style={[styles.buttonText, { color: palette.onPrimary }]}>
          📲 Get Instructions & Copy URL
        </Text>
      </A11yPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.9,
  },
  features: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginBottom: 16,
    gap: 6,
  },
  feature: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
