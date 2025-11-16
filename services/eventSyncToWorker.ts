/**
 * Event Sync to Cloudflare Worker Service
 * Syncs events from app to Cloudflare Worker for website display
 */

import { logger } from '../utils/logger';

const EVENT_SYNC_ENDPOINT = 'https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events';

export type EventSyncData = {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  time?: string;
  duration?: string;
  location?: string;
  isVirtual?: boolean;
  asl?: boolean;
  captions?: boolean;
  stepFree?: boolean;
  sensorySpace?: boolean;
  energyLevel?: string;
  requiresRSVP?: boolean;
  rsvpDetails?: string;
  category?: string;
  tags?: string[];
  organizer?: string;
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
};

/**
 * Sync an event to the Cloudflare Worker (website)
 */
export async function syncEventToWebsite(event: EventSyncData): Promise<boolean> {
  try {
    logger.log('[EventSyncWorker] Syncing event to Cloudflare Worker:', event.id);
    
    const response = await fetch(EVENT_SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[EventSyncWorker] Failed to sync event:', response.status, response.statusText, errorText);
      return false;
    }

    const result = await response.json();
    logger.log('[EventSyncWorker] Event synced successfully to worker:', event.id, result);
    return true;
  } catch (error) {
    logger.error('[EventSyncWorker] Error syncing event to worker:', error);
    return false;
  }
}

/**
 * Remove an event from the Cloudflare Worker (website)
 */
export async function removeEventFromWebsite(eventId: string): Promise<boolean> {
  try {
    logger.log('[EventSyncWorker] Removing event from Cloudflare Worker:', eventId);
    
    const response = await fetch(`${EVENT_SYNC_ENDPOINT}/${eventId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      logger.error('[EventSyncWorker] Failed to remove event:', response.status, response.statusText);
      return false;
    }

    logger.log('[EventSyncWorker] Event removed successfully from worker:', eventId);
    return true;
  } catch (error) {
    logger.error('[EventSyncWorker] Error removing event from worker:', error);
    return false;
  }
}

/**
 * Sync all events to Cloudflare Worker (bulk sync)
 */
export async function syncAllEventsToWebsite(events: EventSyncData[]): Promise<boolean> {
  try {
    logger.log('[EventSyncWorker] Bulk syncing events to Cloudflare Worker:', events.length);
    
    const response = await fetch(`${EVENT_SYNC_ENDPOINT}/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      logger.error('[EventSyncWorker] Failed to bulk sync events:', response.status, response.statusText);
      return false;
    }

    logger.log('[EventSyncWorker] All events synced successfully to worker');
    return true;
  } catch (error) {
    logger.error('[EventSyncWorker] Error bulk syncing events to worker:', error);
    return false;
  }
}
