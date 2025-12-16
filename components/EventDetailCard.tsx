 
import { StyleSheet, Text, View } from 'react-native';

import type { Event } from '../data/events';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';
import { createShadow } from '../utils/shadow';

import A11yPressable from './A11yPressable';

interface EventDetailCardProps {
  event: Event;
  onPress?: () => void;
  showFullDetails?: boolean;
}

export default function EventDetailCard({ event, onPress, showFullDetails = false }: EventDetailCardProps) {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);

  const formatDate = (dateStr: string | Date) => {
    try {
      const dateStrForChecks = typeof dateStr === 'string' ? dateStr : '';
      
      // Detect if this is an all-day event (holidays, observances, health awareness)
      // These have IDs starting with holiday-, obs-, health-, or prov-
      // Or date strings with T12:00:00 (our marker for all-day events)
      const isAllDayEvent = 
        event.id.startsWith('holiday-') || 
        event.id.startsWith('obs-') || 
        event.id.startsWith('health-') ||
        event.id.startsWith('prov-') ||
        dateStrForChecks.includes('T12:00:00') ||
        dateStrForChecks.includes('T00:00:00');
      
      // For all-day events, parse as local date to avoid timezone shift
      // e.g., "2025-12-25T00:00:00.000Z" should display as Dec 25, not Dec 24 in EST
      let date: Date;
      if (isAllDayEvent && typeof dateStr === 'string') {
        // Extract just the date part (YYYY-MM-DD) and parse as local
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-indexed
      } else {
        date = dateStr instanceof Date ? dateStr : new Date(dateStr);
      }
      
      // For all-day events, only show date without time
      if (isAllDayEvent) {
        return date.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      
      // For timed events (community events with specific times)
      // Display in America/Toronto timezone (EST/EDT) since events are Canadian
      const hasSpecificTime = event.endDate || dateStrForChecks.includes('T');
      
      if (hasSpecificTime) {
        return date.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/Toronto',
          timeZoneName: 'short',
        });
      }
      
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return typeof dateStr === 'string' ? dateStr : dateStr?.toString?.() || 'Invalid date';
    }
  };

  const energyIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  const accessibilityFeatures = [
    { key: 'asl', icon: '🤟', label: 'ASL interpretation' },
    { key: 'captions', icon: '📝', label: 'Closed captions' },
    { key: 'wheelchairAccessible', icon: '♿', label: 'Wheelchair accessible' },
    { key: 'stepFree', icon: '🚪', label: 'Step-free entrance' },
    { key: 'sensorySpace', icon: '🎧', label: 'Quiet/sensory space' },
    { key: 'quietRoom', icon: '🤫', label: 'Quiet room available' },
    { key: 'parkingAccessible', icon: '🅿️', label: 'Accessible parking' },
    { key: 'assistiveListening', icon: '👂', label: 'Assistive listening' },
    { key: 'braille', icon: '⠃', label: 'Braille materials' },
    { key: 'serviceAnimalsWelcome', icon: '🐕', label: 'Service animals welcome' },
  ];

  const availableFeatures = accessibilityFeatures.filter(
    (feature) => event[feature.key as keyof Event]
  );

  const content = (
    <View style={[styles.card, { backgroundColor: palette.card, borderRadius: 12 * factor }, createShadow({ shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 })]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={showFullDetails ? undefined : 2}>
          {event.title}
        </Text>
        {event.energyCost && (
          <View style={styles.energyBadge}>
            <Text style={styles.energyIcon}>{energyIcons[event.energyCost]}</Text>
            <Text style={styles.energyText}>
              {event.energyCost === 'low' && 'Low energy'}
              {event.energyCost === 'medium' && 'Med energy'}
              {event.energyCost === 'high' && 'High energy'}
            </Text>
          </View>
        )}
      </View>

      {/* Date and Location */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>📅 {formatDate(event.date)}</Text>
        {event.endDate && (
          <Text style={styles.metaText}> → {formatDate(event.endDate)}</Text>
        )}
      </View>

      {event.isVirtual ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>🌐 Virtual Event</Text>
          {event.virtualLink && showFullDetails && (
            <Text style={styles.linkText} numberOfLines={1}> • {event.virtualLink}</Text>
          )}
        </View>
      ) : event.location ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>📍 {event.location}</Text>
        </View>
      ) : null}

      {/* Description */}
      {event.description && (
        <Text style={styles.description} numberOfLines={showFullDetails ? undefined : 3}>
          {event.description}
        </Text>
      )}

      {/* Accessibility Features */}
      {availableFeatures.length > 0 && (
        <View style={styles.accessibilitySection}>
          <Text style={styles.sectionLabel}>Accessibility:</Text>
          <View style={styles.chipContainer}>
            {availableFeatures.map((feature) => (
              <View key={feature.key} style={styles.chip}>
                <Text style={styles.chipText}>
                  {feature.icon} {feature.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {event.accessibilityNotes && showFullDetails && (
        <View style={styles.notesSection}>
          <Text style={styles.notesText}>ℹ️ {event.accessibilityNotes}</Text>
        </View>
      )}

      {/* Registration Info */}
      {event.registrationRequired && (
        <View style={styles.registrationSection}>
          <Text style={styles.registrationLabel}>
            {event.registrationLink ? '📝 Registration required' : '📝 RSVP required'}
          </Text>
          {event.capacity && event.attendeeCount !== undefined && (
            <Text style={styles.capacityText}>
              {event.attendeeCount} / {event.capacity} registered
            </Text>
          )}
          {event.registrationDeadline && (
            <Text style={styles.deadlineText}>
              Deadline: {formatDate(event.registrationDeadline)}
            </Text>
          )}
        </View>
      )}

      {/* Organizer */}
      {showFullDetails && event.organizer && (
        <View style={styles.organizerSection}>
          <Text style={styles.organizerText}>
            Organized by: {event.organizer}
          </Text>
          {event.organizerContact && (
            <Text style={styles.contactText}>
              Contact: {event.organizerContact}
            </Text>
          )}
        </View>
      )}

      {/* Category/Tags */}
      {(event.category || event.tags?.length) && !showFullDetails && (
        <View style={styles.tagContainer}>
          {event.category && (
            <View style={[styles.tag, styles.categoryTag]}>
              <Text style={styles.tagText}>{event.category}</Text>
            </View>
          )}
          {event.tags?.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <A11yPressable
        onPress={onPress}
        accessibilityLabel={`${event.title}. ${formatDate(event.date)}. ${
          event.isVirtual ? 'Virtual event' : event.location || 'Location TBD'
        }. Tap for details.`}
        accessibilityHint="Double tap to view full event details"
      >
        {content}
      </A11yPressable>
    );
  }

  return content;
}

const createStyles = (palette: ReturnType<typeof useAppPalette>, factor: number) =>
  StyleSheet.create({
    card: {
      marginBottom: 12 * factor,
      padding: 16 * factor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8 * factor,
    },
    title: {
      flex: 1,
      fontSize: 18 * factor,
      fontWeight: '700',
      color: palette.text,
      marginRight: 8 * factor,
    },
    energyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.cardAlt,
      borderRadius: 12 * factor,
      paddingHorizontal: 8 * factor,
      paddingVertical: 4 * factor,
    },
    energyIcon: {
      fontSize: 14 * factor,
      marginRight: 4 * factor,
    },
    energyText: {
      fontSize: 11 * factor,
      color: palette.textSecondary,
      fontWeight: '600',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6 * factor,
      flexWrap: 'wrap',
    },
    metaText: {
      fontSize: 14 * factor,
      color: palette.textSecondary,
    },
    linkText: {
      fontSize: 12 * factor,
      color: palette.link,
    },
    description: {
      fontSize: 14 * factor,
      color: palette.text,
      lineHeight: 20 * factor,
      marginTop: 8 * factor,
      marginBottom: 12 * factor,
    },
    accessibilitySection: {
      marginTop: 12 * factor,
      marginBottom: 8 * factor,
    },
    sectionLabel: {
      fontSize: 13 * factor,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 6 * factor,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6 * factor,
    },
    chip: {
      backgroundColor: palette.cardAlt,
      borderRadius: 16 * factor,
      paddingHorizontal: 10 * factor,
      paddingVertical: 5 * factor,
      borderWidth: 1,
      borderColor: palette.border,
    },
    chipText: {
      fontSize: 12 * factor,
      color: palette.text,
    },
    notesSection: {
      marginTop: 8 * factor,
      padding: 10 * factor,
      backgroundColor: palette.cardAlt,
      borderRadius: 8 * factor,
    },
    notesText: {
      fontSize: 13 * factor,
      color: palette.textSecondary,
      lineHeight: 18 * factor,
    },
    registrationSection: {
      marginTop: 12 * factor,
      padding: 10 * factor,
      backgroundColor: palette.linkBg || palette.cardAlt,
      borderRadius: 8 * factor,
      borderLeftWidth: 3 * factor,
      borderLeftColor: palette.link,
    },
    registrationLabel: {
      fontSize: 14 * factor,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4 * factor,
    },
    capacityText: {
      fontSize: 12 * factor,
      color: palette.textSecondary,
      marginTop: 2 * factor,
    },
    deadlineText: {
      fontSize: 12 * factor,
      color: palette.error,
      marginTop: 2 * factor,
    },
    organizerSection: {
      marginTop: 12 * factor,
      paddingTop: 12 * factor,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    organizerText: {
      fontSize: 13 * factor,
      color: palette.text,
      fontWeight: '500',
    },
    contactText: {
      fontSize: 12 * factor,
      color: palette.textSecondary,
      marginTop: 2 * factor,
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6 * factor,
      marginTop: 12 * factor,
    },
    tag: {
      backgroundColor: palette.cardAlt,
      borderRadius: 12 * factor,
      paddingHorizontal: 8 * factor,
      paddingVertical: 4 * factor,
    },
    categoryTag: {
      backgroundColor: palette.linkBg || palette.cardAlt,
    },
    tagText: {
      fontSize: 11 * factor,
      color: palette.textSecondary,
      fontWeight: '500',
    },
  });
