import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

import type { Event } from '../data/events';

/**
 * Generate a unique iCalUID for an event
 */
export function generateICalUID(event: Event): string {
  if (event.iCalUID) return event.iCalUID;
  
  // Format: event-id@3mpwrapp.pages.dev
  return `${event.id}@3mpwrapp.pages.dev`;
}

/**
 * Format date for iCal format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/**
 * Generate enhanced ICS content with all event fields
 */
export function generateEnhancedICS(event: Event): string {
  const uid = generateICalUID(event);
  const startDate = new Date(event.date);
  const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);
  
  const dtstart = formatICalDate(startDate);
  const dtend = formatICalDate(endDate);
  const dtstamp = formatICalDate(new Date());
  
  // Build description with all details
  let description = event.description || '';
  
  // Add energy cost
  if (event.energyCost) {
    const energyLabels = { low: 'Low Energy', medium: 'Medium Energy', high: 'High Energy' };
    description += `\\n\\nEnergy Level: ${energyLabels[event.energyCost]}`;
  }
  
  // Add accessibility features
  const accessibilityFeatures = [];
  if (event.wheelchairAccessible) accessibilityFeatures.push('Wheelchair accessible');
  if (event.asl) accessibilityFeatures.push('ASL interpretation');
  if (event.captions) accessibilityFeatures.push('Closed captions');
  if (event.stepFree) accessibilityFeatures.push('Step-free entrance');
  if (event.quietRoom) accessibilityFeatures.push('Quiet room available');
  if (event.sensorySpace) accessibilityFeatures.push('Sensory-friendly space');
  if (event.parkingAccessible) accessibilityFeatures.push('Accessible parking');
  if (event.assistiveListening) accessibilityFeatures.push('Assistive listening');
  if (event.braille) accessibilityFeatures.push('Braille materials');
  if (event.serviceAnimalsWelcome) accessibilityFeatures.push('Service animals welcome');
  
  if (accessibilityFeatures.length > 0) {
    description += `\\n\\nAccessibility: ${accessibilityFeatures.join(', ')}`;
  }
  
  if (event.accessibilityNotes) {
    description += `\\n\\n${event.accessibilityNotes}`;
  }
  
  // Add registration info
  if (event.registrationRequired) {
    description += '\\n\\nRegistration required';
    if (event.registrationLink) {
      description += `: ${event.registrationLink}`;
    }
    if (event.registrationDeadline) {
      description += `\\nDeadline: ${new Date(event.registrationDeadline).toLocaleDateString()}`;
    }
    if (event.capacity && event.attendeeCount !== undefined) {
      description += `\\nCapacity: ${event.attendeeCount} / ${event.capacity}`;
    }
  }
  
  // Add organizer info
  if (event.organizer) {
    description += `\\n\\nOrganized by: ${event.organizer}`;
    if (event.organizerContact) {
      description += `\\nContact: ${event.organizerContact}`;
    }
  }
  
  // Add powered by footer
  description += '\\n\\n✨ Powered by 3mpwr App\\n🔗 https://3mpwrapp.pages.dev/events/';
  
  // Location
  const location = event.isVirtual 
    ? (event.virtualLink || 'Virtual Event') 
    : (event.location || '');
  
  // URL
  const url = event.registrationLink || event.virtualLink || `https://3mpwrapp.pages.dev/events/${event.id}`;
  
  // Categories/tags
  const categories = [event.category, ...(event.tags || [])].filter(Boolean).join(',');
  
  // Build ICS
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//3mpwr App//Events Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:3mpwr Events',
    'X-WR-TIMEZONE:America/Toronto',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `URL:${url}`,
    `STATUS:${event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
    categories && `CATEGORIES:${categories}`,
    event.imageUrl && `IMAGE:${event.imageUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  
  return lines.filter(Boolean).join('\r\n');
}

/**
 * Request calendar permissions
 */
export async function requestCalendarPermissions(): Promise<boolean> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[CalendarSync] Permission request failed:', error);
    return false;
  }
}

/**
 * Get or create 3mpwr events calendar
 */
export async function get3mpwrCalendar(): Promise<string | null> {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    // Find existing 3mpwr calendar
    const existing = calendars.find(
      (cal) => cal.title === '3mpwr Events' && cal.allowsModifications
    );
    
    if (existing) {
      return existing.id;
    }
    
    // Create new calendar
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await Calendar.getDefaultCalendarAsync()
        : { isLocalAccount: true, name: '3mpwr Events', type: Calendar.SourceType.LOCAL };
    
    const newCalendarId = await Calendar.createCalendarAsync({
      title: '3mpwr Events',
      color: '#7B3FF2', // 3mpwr brand color
      entityType: Calendar.EntityTypes.EVENT,
      sourceId:
        Platform.OS === 'ios' ? (defaultCalendarSource as any).source.id : undefined,
      source:
        Platform.OS === 'android' ? (defaultCalendarSource as any) : undefined,
      name: '3mpwr Events',
      ownerAccount: '3mpwr',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    
    return newCalendarId;
  } catch (error) {
    console.error('[CalendarSync] Failed to get/create calendar:', error);
    return null;
  }
}

/**
 * Sync event to device calendar
 */
export async function syncEventToCalendar(event: Event): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    // Request permissions
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      return { success: false, error: 'Calendar permission denied' };
    }
    
    // Get calendar
    const calendarId = await get3mpwrCalendar();
    if (!calendarId) {
      return { success: false, error: 'Failed to create calendar' };
    }
    
    // Parse dates
    const startDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);
    
    // Build notes with accessibility info
    let notes = event.description || '';
    
    if (event.energyCost) {
      const energyLabels = { low: 'Low Energy', medium: 'Medium Energy', high: 'High Energy' };
      notes += `\n\nEnergy Level: ${energyLabels[event.energyCost]}`;
    }
    
    const accessibilityFeatures = [];
    if (event.wheelchairAccessible) accessibilityFeatures.push('♿ Wheelchair accessible');
    if (event.asl) accessibilityFeatures.push('🤟 ASL interpretation');
    if (event.captions) accessibilityFeatures.push('📝 Closed captions');
    if (event.stepFree) accessibilityFeatures.push('🚪 Step-free entrance');
    if (event.quietRoom) accessibilityFeatures.push('🤫 Quiet room');
    if (event.sensorySpace) accessibilityFeatures.push('🎧 Sensory space');
    
    if (accessibilityFeatures.length > 0) {
      notes += `\n\nAccessibility:\n${accessibilityFeatures.join('\n')}`;
    }
    
    if (event.accessibilityNotes) {
      notes += `\n\n${event.accessibilityNotes}`;
    }
    
    if (event.registrationRequired && event.registrationLink) {
      notes += `\n\nRegister: ${event.registrationLink}`;
    }
    
    // Create event
    const calendarEventId = await Calendar.createEventAsync(calendarId, {
      title: event.title,
      startDate,
      endDate,
      location: event.isVirtual ? (event.virtualLink || 'Virtual Event') : (event.location || ''),
      notes,
      timeZone: 'America/Toronto', // TODO: Make this dynamic based on user location
      alarms: [
        { relativeOffset: -60 }, // 1 hour before
        event.energyCost === 'high' ? { relativeOffset: -1440 } : null, // 1 day before for high-energy events
      ].filter(Boolean) as any[],
      url: event.registrationLink || event.virtualLink || undefined,
      availability: Calendar.Availability.BUSY,
    });
    
    return { success: true, eventId: calendarEventId };
  } catch (error) {
    console.error('[CalendarSync] Failed to sync event:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Remove event from device calendar
 */
export async function removeEventFromCalendar(calendarEventId: string): Promise<boolean> {
  try {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) return false;
    
    await Calendar.deleteEventAsync(calendarEventId);
    return true;
  } catch (error) {
    console.error('[CalendarSync] Failed to remove event:', error);
    return false;
  }
}
