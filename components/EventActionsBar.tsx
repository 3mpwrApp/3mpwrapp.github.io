import { Alert, Linking, Share, StyleSheet, Text, View } from 'react-native';
this

import { ANALYTICS_EVENTS, trackEvent } from '../services/analyticsClient';
import type { Palette } from '../theme/colors';

import A11yPressable from './A11yPressable';
import { GapView } from './GapView';

// Lazy load Calendar to avoid crashes if expo-calendar is not available
let Calendar: any = null;
try {
  Calendar = require('expo-calendar');
} catch (err) {
  console.warn('[EventActionsBar] expo-calendar not available:', err);
}

interface EventActionsBarProps {
  event: {
    id: string;
    title: string;
    date: string;
    description?: string;
    location?: string;
    isVirtual?: boolean;
  };
  palette: Palette;
  onEdit?: () => void;
  onDelete?: () => void;
  showEditDelete?: boolean;
}

/**
 * Enhanced action bar for events with share, calendar, social media, edit, and delete
 */
export default function EventActionsBar({ 
  event, 
  palette, 
  onEdit, 
  onDelete,
  showEditDelete = false 
}: EventActionsBarProps) {
  
  const handleShare = async () => {
    try {
      const message = `${event.title}\n📅 ${event.date}\n📍 ${event.isVirtual ? 'Virtual' : (event.location || 'TBD')}\n\n${event.description || ''}\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/events/`.trim();
      await Share.share({
        message,
        title: event.title,
      });
      trackEvent(ANALYTICS_EVENTS.EVENTS_SHARE, { id: event.id, method: 'native' });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleShareTwitter = async () => {
    try {
      const text = encodeURIComponent(`${event.title}\n📅 ${event.date}\n📍 ${event.isVirtual ? 'Virtual' : (event.location || 'TBD')}\n\n#Disability #Accessibility #3mpwrApp\n\n🌐 https://3mpwrapp.pages.dev/events/`);
      const url = `https://twitter.com/intent/tweet?text=${text}`;
      await Linking.openURL(url);
      trackEvent(ANALYTICS_EVENTS.EVENTS_SHARE, { id: event.id, method: 'twitter' });
    } catch {
      Alert.alert('Error', 'Could not open Twitter');
    }
  };

  const handleShareFacebook = async () => {
    try {
      const url = encodeURIComponent('https://3mpwrapp.pages.dev/events/');
      const quote = encodeURIComponent(`${event.title} - ${event.date}\n\n🔗 Powered by 3mpwr App`);
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
      await Linking.openURL(fbUrl);
      trackEvent(ANALYTICS_EVENTS.EVENTS_SHARE, { id: event.id, method: 'facebook' });
    } catch {
      Alert.alert('Error', 'Could not open Facebook');
    }
  };

  const handleShareLinkedIn = async () => {
    try {
      const url = encodeURIComponent('https://3mpwrapp.pages.dev/events/');
      const title = encodeURIComponent(event.title);
      const summary = encodeURIComponent(`${event.date} - ${event.description || ''}\n\n🔗 Powered by 3mpwr App`);
      const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
      await Linking.openURL(liUrl);
      trackEvent(ANALYTICS_EVENTS.EVENTS_SHARE, { id: event.id, method: 'linkedin' });
    } catch {
      Alert.alert('Error', 'Could not open LinkedIn');
    }
  };

  const handleAddToCalendar = async () => {
    // Check if Calendar module is available
    if (!Calendar) {
      Alert.alert(
        '📅 Calendar Not Available',
        'Calendar permissions are blocked in this build. Please use the subscription calendar feature from the Events tab instead for auto-updating events.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '📅 Calendar Permission',
          'Please allow calendar access to add events.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
      
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find((c: any) => c.allowsModifications) || calendars[0];
      
      if (!defaultCalendar) {
        Alert.alert('No Calendar', 'No calendars found on your device.');
        return;
      }
      
      const startDate = new Date(event.date);
      const endDate = new Date(startDate.getTime() + 3600000); // 1 hour duration
      
      const eventDetails = {
        title: event.title,
        startDate,
        endDate,
        location: event.isVirtual ? 'Virtual Event' : (event.location || ''),
        notes: `${event.description || ''}\n\n🔗 Powered by 3mpwr App\nhttps://3mpwrapp.pages.dev/`,
        organizerEmail: 'empowrapp08162025@gmail.com',
        url: 'https://3mpwrapp.pages.dev/',
      };
      
      await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      Alert.alert(
        '✅ Success!',
        `"${event.title}" has been added to your calendar!`,
        [{ text: 'OK' }]
      );
      trackEvent(ANALYTICS_EVENTS.EVENTS_ADD_TO_CALENDAR, { id: event.id });
    } catch (error) {
      console.error('Calendar error:', error);
      Alert.alert('Error', 'Could not add event to calendar. Please try the subscription calendar feature instead.');
    }
  };

  const handleShareToSocials = () => {
    Alert.alert(
      '📤 Share to Social Media',
      'Choose a platform to share this event:',
      [
        { text: '🐦 Twitter', onPress: handleShareTwitter },
        { text: '📘 Facebook', onPress: handleShareFacebook },
        { text: '💼 LinkedIn', onPress: handleShareLinkedIn },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      '🗑️ Delete Event',
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: onDelete
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <GapView gap={6} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {/* Share button */}
        <A11yPressable
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel={`Share ${event.title}`}
          style={[styles.button, { 
            backgroundColor: palette.surface, 
            borderColor: palette.muted 
          }]}
        >
          <Text style={[styles.buttonText, { color: palette.text }]}>
            📤 Share
          </Text>
        </A11yPressable>

        {/* Share to Socials */}
        <A11yPressable
          onPress={handleShareToSocials}
          accessibilityRole="button"
          accessibilityLabel="Share to social media"
          style={[styles.button, { 
            backgroundColor: palette.info, 
            borderColor: palette.info 
          }]}
        >
          <Text style={[styles.buttonText, { color: palette.onPrimary }]}>
            🌐 Socials
          </Text>
        </A11yPressable>

        {/* Add to Calendar */}
        <A11yPressable
          onPress={handleAddToCalendar}
          accessibilityRole="button"
          accessibilityLabel={`Add ${event.title} to calendar`}
          style={[styles.button, { 
            backgroundColor: palette.primary, 
            borderColor: palette.primary 
          }]}
        >
          <Text style={[styles.buttonText, { color: palette.onPrimary }]}>
            📅 Add to Calendar
          </Text>
        </A11yPressable>

        {/* Edit button (only for custom events) */}
        {showEditDelete && onEdit && (
          <A11yPressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${event.title}`}
            style={[styles.button, { 
              backgroundColor: palette.surface, 
              borderColor: palette.muted 
            }]}
          >
            <Text style={[styles.buttonText, { color: palette.text }]}>
              ✏️ Edit
            </Text>
          </A11yPressable>
        )}

        {/* Delete button (only for custom events) */}
        {showEditDelete && onDelete && (
          <A11yPressable
            onPress={handleDeleteConfirm}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${event.title}`}
            style={[styles.button, { 
              backgroundColor: palette.error, 
              borderColor: palette.error 
            }]}
          >
            <Text style={[styles.buttonText, { color: palette.onPrimary }]}>
              🗑️ Delete
            </Text>
          </A11yPressable>
        )}
      </GapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
