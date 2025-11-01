/**
 * Event Sync Service
 * Syncs events from website calendar feed to local app storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../utils/logger';

const EVENTS_SYNC_KEY = 'events:synced:v1';
const SYNC_TIMESTAMP_KEY = 'events:sync:timestamp';
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export interface SyncedEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  isVirtual?: boolean;
  asl?: boolean;
  captions?: boolean;
  stepFree?: boolean;
  sensorySpace?: boolean;
  url?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch events from website ICS feed
 * @param icsUrl URL to the ICS feed endpoint
 * @returns Array of parsed events
 */
export async function fetchEventsFromWebsite(icsUrl: string): Promise<SyncedEvent[]> {
  try {
    logger.log('[EventSync] Fetching events from:', icsUrl);
    
    const response = await fetch(icsUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const icsContent = await response.text();
    const events = parseICS(icsContent);
    
    logger.log('[EventSync] Successfully fetched and parsed', events.length, 'events');
    return events;
  } catch (error) {
    logger.error('[EventSync] Failed to fetch events:', error);
    throw error;
  }
}

/**
 * Parse ICS/iCal format to event objects
 * @param icsContent Raw ICS file content
 * @returns Array of parsed events
 */
export function parseICS(icsContent: string): SyncedEvent[] {
  const events: SyncedEvent[] = [];
  
  // Split by VEVENT blocks
  const eventBlocks = icsContent.split('BEGIN:VEVENT');
  
  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i];
    const endIndex = block.indexOf('END:VEVENT');
    if (endIndex === -1) continue;
    
    const eventContent = block.substring(0, endIndex);
    
    try {
      const event = parseVEvent(eventContent);
      if (event) {
        events.push(event);
      }
    } catch (error) {
      logger.warn('[EventSync] Failed to parse event block:', error);
    }
  }
  
  return events;
}

/**
 * Parse a single VEVENT block
 */
function parseVEvent(content: string): SyncedEvent | null {
  const lines = content.split('\n').filter(line => line.trim());
  
  const event: Partial<SyncedEvent> = {};
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    
    switch (key) {
      case 'UID':
        event.id = value.replace('@empowr.app', '').replace('@3mpwr.app', '');
        break;
      case 'SUMMARY':
        event.title = value;
        break;
      case 'DESCRIPTION':
        event.description = value.replace(/\\n/g, '\n');
        break;
      case 'LOCATION':
        event.location = value;
        event.isVirtual = value.toLowerCase().includes('virtual') || value.toLowerCase().includes('online');
        break;
      case 'URL':
        event.url = value;
        break;
      case 'DTSTART':
      case 'DTSTART;VALUE=DATE':
        event.startDate = parseICalDateTime(value);
        event.date = event.startDate; // Fallback for compatibility
        break;
      case 'DTEND':
      case 'DTEND;VALUE=DATE':
        event.endDate = parseICalDateTime(value);
        break;
    }
    
    // Check for accessibility features in description
    if (event.description) {
      const desc = event.description.toLowerCase();
      event.asl = desc.includes('asl') || desc.includes('sign language');
      event.captions = desc.includes('captions') || desc.includes('subtitles');
      event.stepFree = desc.includes('step-free') || desc.includes('accessible');
      event.sensorySpace = desc.includes('sensory') || desc.includes('quiet space');
    }
  }
  
  // Validate required fields
  if (!event.id || !event.title || !event.date) {
    logger.warn('[EventSync] Skipping event with missing required fields:', event);
    return null;
  }
  
  return event as SyncedEvent;
}

/**
 * Parse iCal date/time format to ISO string
 * Supports: 20250115T140000Z or 20250115
 */
function parseICalDateTime(icalDate: string): string {
  try {
    // Remove any trailing 'Z' for UTC
    const cleaned = icalDate.replace(/Z$/, '');
    
    // Parse format: YYYYMMDDTHHMMSS or YYYYMMDD
    if (cleaned.length === 8) {
      // Date only: YYYYMMDD
      const year = cleaned.substring(0, 4);
      const month = cleaned.substring(4, 6);
      const day = cleaned.substring(6, 8);
      return `${year}-${month}-${day}`;
    } else if (cleaned.length === 15 && cleaned.includes('T')) {
      // DateTime: YYYYMMDDTHHMMSS
      const [datePart, timePart] = cleaned.split('T');
      const year = datePart.substring(0, 4);
      const month = datePart.substring(4, 6);
      const day = datePart.substring(6, 8);
      const hour = timePart.substring(0, 2);
      const minute = timePart.substring(2, 4);
      const second = timePart.substring(4, 6);
      return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    }
    
    // Fallback: return as-is
    return icalDate;
  } catch (error) {
    logger.warn('[EventSync] Failed to parse date:', icalDate);
    return icalDate;
  }
}

/**
 * Sync events from website to local storage
 * @param icsUrl URL to the ICS feed
 * @param forceSync Force sync even if within interval
 * @returns Success status
 */
export async function syncEventsFromWebsite(
  icsUrl: string,
  forceSync: boolean = false
): Promise<{ success: boolean; events?: SyncedEvent[]; error?: string }> {
  try {
    // Check if we need to sync based on last sync timestamp
    if (!forceSync) {
      const lastSync = await AsyncStorage.getItem(SYNC_TIMESTAMP_KEY);
      if (lastSync) {
        const lastSyncTime = parseInt(lastSync, 10);
        const timeSinceSync = Date.now() - lastSyncTime;
        
        if (timeSinceSync < SYNC_INTERVAL_MS) {
          logger.log('[EventSync] Skipping sync, last sync was', Math.round(timeSinceSync / 60000), 'minutes ago');
          
          // Return cached events
          const cached = await getCachedSyncedEvents();
          return { success: true, events: cached };
        }
      }
    }
    
    // Fetch and parse events
    const events = await fetchEventsFromWebsite(icsUrl);
    
    // Store in AsyncStorage
    await AsyncStorage.setItem(EVENTS_SYNC_KEY, JSON.stringify(events));
    await AsyncStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
    
    logger.log('[EventSync] Successfully synced', events.length, 'events');
    return { success: true, events };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[EventSync] Sync failed:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Get cached synced events from AsyncStorage
 */
export async function getCachedSyncedEvents(): Promise<SyncedEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(EVENTS_SYNC_KEY);
    if (!raw) return [];
    
    const events = JSON.parse(raw);
    return Array.isArray(events) ? events : [];
  } catch (error) {
    logger.error('[EventSync] Failed to get cached events:', error);
    return [];
  }
}

/**
 * Clear cached synced events
 */
export async function clearCachedEvents(): Promise<void> {
  try {
    await AsyncStorage.removeItem(EVENTS_SYNC_KEY);
    await AsyncStorage.removeItem(SYNC_TIMESTAMP_KEY);
    logger.log('[EventSync] Cleared cached events');
  } catch (err) {
    logger.error('[EventSync] Failed to clear cache:', err);
  }
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<Date | null> {
  try {
    const timestamp = await AsyncStorage.getItem(SYNC_TIMESTAMP_KEY);
    if (!timestamp) return null;
    
    return new Date(parseInt(timestamp, 10));
  } catch (error) {
    logger.error('[EventSync] Failed to get last sync time:', error);
    return null;
  }
}
