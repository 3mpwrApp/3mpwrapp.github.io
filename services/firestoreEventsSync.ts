/**
 * Real-time Firestore Events Sync Service
 * 
 * Syncs events from Firestore to:
 * 1. JSON API endpoint for website consumption
 * 2. ICS calendar feed
 * 3. Local cache for offline access
 * 
 * This enables real-time updates on the website when events are created/updated/deleted.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type * as Fire from 'firebase/firestore';

import type { Event } from '../data/events';
import { db as sharedDb } from '../firebase/config';
import { logger } from '../utils/logger';

let mod: typeof Fire | null = null;

async function ensure(): Promise<typeof Fire | null> {
  if (mod) return mod;
  try {
    mod = await import('firebase/firestore');
    return mod;
  } catch {
    return null;
  }
}

const CACHE_KEY = 'events:firestore:v1';
const LAST_SYNC_KEY = 'events:firestore:lastSync';

/**
 * Subscribe to real-time events from Firestore
 * Calls callback whenever events change
 */
export function subscribeToFirestoreEvents(
  onEventsChange: (events: Event[]) => void,
  onError?: (error: Error) => void
): () => void {
  // Default unsubscribe (no-op)
  let unsubscribe = () => {};

  (async () => {
    try {
      const m = await ensure();
      if (!m || !sharedDb) {
        logger.warn('[FirestoreEventsSync] Firestore not available');
        onError?.(new Error('Firestore not available'));
        return;
      }

      // Subscribe to events collection
      unsubscribe = m.onSnapshot(
        m.collection(sharedDb, 'events'),
        (snapshot) => {
          const events: Event[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            events.push({
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              date: data.date || '',
              location: data.location,
              isVirtual: data.isVirtual,
              asl: data.asl,
              captions: data.captions,
              stepFree: data.stepFree,
              sensorySpace: data.sensorySpace,
              category: data.category,
              tags: data.tags,
            });
          });

          // Sort by date
          events.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          // Cache locally
          AsyncStorage.setItem(CACHE_KEY, JSON.stringify(events)).catch((err) => {
            logger.warn('[FirestoreEventsSync] Cache write failed:', err);
          });

          // Update last sync timestamp
          AsyncStorage.setItem(LAST_SYNC_KEY, String(Date.now())).catch(() => {});

          // Call callback
          onEventsChange(events);

          logger.log(`[FirestoreEventsSync] Synced ${events.length} events`);
        },
        (error) => {
          logger.error('[FirestoreEventsSync] Subscription error:', error);
          onError?.(error as Error);
        }
      );
    } catch (err) {
      logger.error('[FirestoreEventsSync] Setup failed:', err);
      onError?.(err as Error);
    }
  })();

  return () => unsubscribe();
}

/**
 * Get cached events from local storage
 */
export async function getCachedEvents(): Promise<Event[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

/**
 * Get timestamp of last sync
 */
export async function getLastSyncTime(): Promise<number> {
  try {
    const last = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return last ? parseInt(last, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Generate JSON API response for events
 * Format: { events: Event[], lastUpdated: ISO string, count: number }
 */
export async function generateEventsJSON(): Promise<{
  events: Event[];
  lastUpdated: string;
  count: number;
}> {
  try {
    const events = await getCachedEvents();
    return {
      events,
      lastUpdated: new Date().toISOString(),
      count: events.length,
    };
  } catch (err) {
    logger.error('[FirestoreEventsSync] JSON generation failed:', err);
    return {
      events: [],
      lastUpdated: new Date().toISOString(),
      count: 0,
    };
  }
}

/**
 * Generate iCalendar (ICS) format from events
 * Can be served at /events.ics endpoint
 */
export async function generateEventsICS(): Promise<string> {
  try {
    const events = await getCachedEvents();
    const lines: string[] = [];

    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//3mpwr App//Events//EN');
    lines.push('CALSCALE:GREGORIAN');
    lines.push('METHOD:PUBLISH');
    lines.push('X-WR-CALNAME:3mpwr App Events');
    lines.push('X-WR-TIMEZONE:America/Toronto');
    lines.push('BEGIN:VTIMEZONE');
    lines.push('TZID:America/Toronto');
    lines.push('BEGIN:STANDARD');
    lines.push('DTSTART:20231105T020000');
    lines.push('RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU');
    lines.push('TZOFFSETFROM:-0400');
    lines.push('TZOFFSETTO:-0500');
    lines.push('TZNAME:EST');
    lines.push('END:STANDARD');
    lines.push('BEGIN:DAYLIGHT');
    lines.push('DTSTART:20230312T020000');
    lines.push('RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU');
    lines.push('TZOFFSETFROM:-0500');
    lines.push('TZOFFSETTO:-0400');
    lines.push('TZNAME:EDT');
    lines.push('END:DAYLIGHT');
    lines.push('END:VTIMEZONE');

    for (const event of events) {
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${event.id}@3mpwrapp.pages.dev`);
      lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);

      // Parse date - handle various formats
      let startDate = new Date(event.date);
      if (isNaN(startDate.getTime())) {
        // Try parsing custom format like "2025-11-15 18:00"
        const parts = event.date.split(' ');
        if (parts.length === 2) {
          startDate = new Date(`${parts[0]}T${parts[1]}:00`);
        }
      }

      if (!isNaN(startDate.getTime())) {
        const isoStart = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(startDate.getTime() + 3600000); // 1 hour duration
        const isoEnd = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        lines.push(`DTSTART:${isoStart}`);
        lines.push(`DTEND:${isoEnd}`);
      }

      lines.push(`SUMMARY:${escapeICS(event.title)}`);

      if (event.description) {
        lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
      }

      if (event.location) {
        lines.push(`LOCATION:${escapeICS(event.location)}`);
      }

      if (event.isVirtual) {
        lines.push('X-VIRTUAL:TRUE');
      }

      const access: string[] = [];
      if (event.asl) access.push('ASL');
      if (event.captions) access.push('Captions');
      if (event.stepFree) access.push('Step-free');
      if (event.sensorySpace) access.push('Sensory space');

      if (access.length > 0) {
        lines.push(`X-ACCESSIBILITY:${access.join(', ')}`);
      }

      lines.push('URL:https://3mpwrapp.pages.dev/');
      lines.push('ORGANIZER;CN=3mpwr App:mailto:empowrapp08162025@gmail.com');
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  } catch (err) {
    logger.error('[FirestoreEventsSync] ICS generation failed:', err);
    return '';
  }
}

/**
 * Escape special characters in ICS format
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Manually trigger sync from Firestore
 * Useful for when subscription needs to be refreshed
 */
export async function syncEventsNow(): Promise<Event[]> {
  try {
    const m = await ensure();
    if (!m || !sharedDb) {
      throw new Error('Firestore not available');
    }

    const snapshot = await m.getDocs(m.collection(sharedDb, 'events'));
    const events: Event[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        location: data.location,
        isVirtual: data.isVirtual,
        asl: data.asl,
        captions: data.captions,
        stepFree: data.stepFree,
        sensorySpace: data.sensorySpace,
        category: data.category,
        tags: data.tags,
      });
    });

    // Sort by date
    events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Cache
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(events));
    await AsyncStorage.setItem(LAST_SYNC_KEY, String(Date.now()));

    logger.log(`[FirestoreEventsSync] Manual sync: ${events.length} events`);
    return events;
  } catch (err) {
    logger.error('[FirestoreEventsSync] Manual sync failed:', err);
    return [];
  }
}
