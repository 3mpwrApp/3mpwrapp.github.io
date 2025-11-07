/**
 * Auto-Sync Service for Events
 * Automatically syncs local events to Firestore production in background
 * Retries failed syncs when network is available
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../utils/logger';

import { isFirestoreSyncAvailable, syncEventToProduction } from './firestoreEventSync';

const SYNC_QUEUE_KEY = 'events:syncQueue:v1';
const SYNC_INTERVAL_MS = 60000; // Retry every 60 seconds
const MAX_RETRY_ATTEMPTS = 5;

export interface SyncQueueItem {
  eventId: string;
  eventData: any;
  userId: string;
  attempts: number;
  lastAttempt: number;
  addedAt: number;
}

/**
 * Add event to sync queue for background processing
 */
export async function addToSyncQueue(eventId: string, eventData: any, userId: string): Promise<void> {
  try {
    const queueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SyncQueueItem[] = queueData ? JSON.parse(queueData) : [];

    // Check if already in queue
    const existingIndex = queue.findIndex(item => item.eventId === eventId);
    
    if (existingIndex >= 0) {
      // Update existing entry
      queue[existingIndex] = {
        ...queue[existingIndex],
        eventData,
        attempts: 0, // Reset attempts on update
        lastAttempt: 0,
      };
    } else {
      // Add new entry
      queue.push({
        eventId,
        eventData,
        userId,
        attempts: 0,
        lastAttempt: 0,
        addedAt: Date.now(),
      });
    }

    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    logger.log('[AutoSync] Added to queue:', eventId);
  } catch (err) {
    logger.error('[AutoSync] Failed to add to queue:', err);
  }
}

/**
 * Remove event from sync queue
 */
export async function removeFromSyncQueue(eventId: string): Promise<void> {
  try {
    const queueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!queueData) return;

    const queue: SyncQueueItem[] = JSON.parse(queueData);
    const filtered = queue.filter(item => item.eventId !== eventId);
    
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
    logger.log('[AutoSync] Removed from queue:', eventId);
  } catch (err) {
    logger.error('[AutoSync] Failed to remove from queue:', err);
  }
}

/**
 * Get current sync queue
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const queueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queueData ? JSON.parse(queueData) : [];
  } catch (err) {
    logger.error('[AutoSync] Failed to get queue:', err);
    return [];
  }
}

/**
 * Process sync queue - attempts to sync all pending events
 * Returns number of successfully synced events
 */
export async function processSyncQueue(): Promise<{ synced: number; failed: number; pending: number }> {
  try {
    const isSyncAvailable = await isFirestoreSyncAvailable();
    if (!isSyncAvailable) {
      logger.log('[AutoSync] Sync not available, skipping queue processing');
      return { synced: 0, failed: 0, pending: 0 };
    }

    const queue = await getSyncQueue();
    if (queue.length === 0) {
      return { synced: 0, failed: 0, pending: 0 };
    }

    logger.log('[AutoSync] Processing queue:', queue.length, 'items');

    let syncedCount = 0;
    let failedCount = 0;
    const updatedQueue: SyncQueueItem[] = [];

    for (const item of queue) {
      // Skip if recently attempted (within last 30 seconds)
      if (Date.now() - item.lastAttempt < 30000) {
        updatedQueue.push(item);
        continue;
      }

      // Skip if max attempts reached
      if (item.attempts >= MAX_RETRY_ATTEMPTS) {
        logger.warn('[AutoSync] Max retries reached for:', item.eventId);
        failedCount++;
        continue;
      }

      try {
        logger.log('[AutoSync] Attempting sync:', item.eventId, `(attempt ${item.attempts + 1}/${MAX_RETRY_ATTEMPTS})`);
        
        const eventPayload = {
          id: item.eventData.id,
          title: item.eventData.title,
          description: item.eventData.description,
          date: new Date(item.eventData.date),
          time: item.eventData.time,
          duration: item.eventData.duration,
          location: item.eventData.location,
          isVirtual: item.eventData.isVirtual,
          asl: item.eventData.asl,
          captions: item.eventData.captions,
          stepFree: item.eventData.stepFree,
          sensorySpace: item.eventData.sensorySpace,
          energyLevel: item.eventData.energyLevel,
          requiresRSVP: item.eventData.requiresRSVP,
          rsvpDetails: item.eventData.rsvpDetails,
          createdBy: item.userId,
          createdAt: item.eventData.createdAt || Date.now(),
          status: 'published',
          category: 'community',
        };

        // Sync to both production and preview collections
        const productionSuccess = await syncEventToProduction(eventPayload, item.userId, 'events_production');
        const previewSuccess = await syncEventToProduction(eventPayload, item.userId, 'events_preview');
        
        const success = productionSuccess && previewSuccess;

        if (success) {
          syncedCount++;
          logger.log('[AutoSync] ✓ Synced to both collections:', item.eventId);
          // Don't add to updated queue (successfully synced)
        } else if (productionSuccess || previewSuccess) {
          // Partial success - retry to sync to both
          logger.warn('[AutoSync] ⚠ Partial sync (prod:', productionSuccess, 'preview:', previewSuccess, '):', item.eventId);
          updatedQueue.push({
            ...item,
            attempts: item.attempts + 1,
            lastAttempt: Date.now(),
          });
          failedCount++;
        } else {
          // Retry later
          updatedQueue.push({
            ...item,
            attempts: item.attempts + 1,
            lastAttempt: Date.now(),
          });
          failedCount++;
          logger.warn('[AutoSync] ✗ Sync failed:', item.eventId);
        }
      } catch (err) {
        logger.error('[AutoSync] Error syncing:', item.eventId, err);
        updatedQueue.push({
          ...item,
          attempts: item.attempts + 1,
          lastAttempt: Date.now(),
        });
        failedCount++;
      }
    }

    // Update queue with failed items
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));

    logger.log('[AutoSync] Queue processed:', {
      synced: syncedCount,
      failed: failedCount,
      pending: updatedQueue.length,
    });

    return {
      synced: syncedCount,
      failed: failedCount,
      pending: updatedQueue.length,
    };
  } catch (err) {
    logger.error('[AutoSync] Failed to process queue:', err);
    return { synced: 0, failed: 0, pending: 0 };
  }
}

/**
 * Start background sync service
 * Processes sync queue at regular intervals
 * @returns Stop function to cancel background sync
 */
export function startBackgroundSync(): () => void {
  logger.log('[AutoSync] Starting background sync service');

  // Process immediately
  processSyncQueue().catch(err => {
    logger.error('[AutoSync] Initial processing failed:', err);
  });

  // Then process at intervals
  const intervalId = setInterval(() => {
    processSyncQueue().catch(err => {
      logger.error('[AutoSync] Periodic processing failed:', err);
    });
  }, SYNC_INTERVAL_MS);

  // Return cleanup function
  return () => {
    logger.log('[AutoSync] Stopping background sync service');
    clearInterval(intervalId);
  };
}

/**
 * Clear sync queue (for testing or reset)
 */
export async function clearSyncQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    logger.log('[AutoSync] Queue cleared');
  } catch (err) {
    logger.error('[AutoSync] Failed to clear queue:', err);
  }
}

/**
 * Get sync queue stats
 */
export async function getSyncQueueStats(): Promise<{
  total: number;
  pending: number;
  failed: number;
  oldestPending: number | null;
}> {
  try {
    const queue = await getSyncQueue();
    
    const pending = queue.filter(item => item.attempts < MAX_RETRY_ATTEMPTS).length;
    const failed = queue.filter(item => item.attempts >= MAX_RETRY_ATTEMPTS).length;
    const oldestPending = queue.length > 0 
      ? Math.min(...queue.map(item => item.addedAt))
      : null;

    return {
      total: queue.length,
      pending,
      failed,
      oldestPending,
    };
  } catch (err) {
    logger.error('[AutoSync] Failed to get stats:', err);
    return {
      total: 0,
      pending: 0,
      failed: 0,
      oldestPending: null,
    };
  }
}
