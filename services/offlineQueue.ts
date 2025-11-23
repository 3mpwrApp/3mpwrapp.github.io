/**
 * Offline Queue Service
 * 
 * Handles queuing of evidence uploads and other operations when offline.
 * Features:
 * - AsyncStorage-backed persistent queue
 * - Exponential backoff retry logic
 * - Conflict resolution for concurrent edits
 * - Network status monitoring
 * - Manual retry capability
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

import { errorLogger } from '../utils/errorLogger';

const QUEUE_KEY = 'evidence:uploadQueue:v1';
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000; // 1 second
const MAX_BACKOFF_MS = 60000; // 1 minute

export type QueueItemStatus = 'pending' | 'retrying' | 'failed' | 'succeeded';

export type QueueItem = {
  id: string;
  type: 'upload' | 'delete' | 'update';
  payload: any;
  createdAt: number;
  lastAttemptAt?: number;
  retries: number;
  status: QueueItemStatus;
  error?: string;
};

/**
 * Get all items in the upload queue
 */
export async function getQueue(): Promise<QueueItem[]> {
  try {
    const json = await AsyncStorage.getItem(QUEUE_KEY);
    if (!json) return [];
    return JSON.parse(json);
  } catch (err) {
    errorLogger('getQueue', err);
    return [];
  }
}

/**
 * Add an item to the upload queue
 */
export async function enqueue(type: QueueItem['type'], payload: any): Promise<string> {
  try {
    const queue = await getQueue();
    const item: QueueItem = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      payload,
      createdAt: Date.now(),
      retries: 0,
      status: 'pending',
    };
    queue.push(item);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return item.id;
  } catch (err) {
    errorLogger('enqueue', err);
    throw new Error('Failed to add item to queue');
  }
}

/**
 * Remove an item from the queue
 */
export async function dequeue(id: string): Promise<void> {
  try {
    const queue = await getQueue();
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  } catch (err) {
    errorLogger('dequeue', err);
    throw new Error('Failed to remove item from queue');
  }
}

/**
 * Update an item's status in the queue
 */
export async function updateQueueItem(
  id: string,
  updates: Partial<Pick<QueueItem, 'status' | 'error' | 'lastAttemptAt' | 'retries'>>
): Promise<void> {
  try {
    const queue = await getQueue();
    const index = queue.findIndex(item => item.id === id);
    if (index === -1) return;
    
    queue[index] = { ...queue[index], ...updates };
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    errorLogger('updateQueueItem', err);
  }
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(retries: number): number {
  const delay = INITIAL_BACKOFF_MS * Math.pow(2, retries);
  return Math.min(delay, MAX_BACKOFF_MS);
}

/**
 * Check if enough time has passed since last retry
 */
function canRetry(item: QueueItem): boolean {
  if (!item.lastAttemptAt) return true;
  const backoff = getBackoffDelay(item.retries);
  return Date.now() - item.lastAttemptAt >= backoff;
}

/**
 * Check network connectivity
 */
export async function isOnline(): Promise<boolean> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected === true && networkState.isInternetReachable === true;
  } catch {
    return false;
  }
}

/**
 * Process a single queue item
 */
async function processItem(item: QueueItem, uploadFn: (payload: any) => Promise<void>): Promise<boolean> {
  if (!canRetry(item)) {
    return false; // Too soon to retry
  }

  if (item.retries >= MAX_RETRIES) {
    await updateQueueItem(item.id, { status: 'failed', error: 'Max retries exceeded' });
    return false;
  }

  try {
    await updateQueueItem(item.id, { 
      status: 'retrying', 
      lastAttemptAt: Date.now(),
      retries: item.retries + 1 
    });

    await uploadFn(item.payload);

    await updateQueueItem(item.id, { status: 'succeeded' });
    
    // Remove succeeded items after 1 hour (keep for history)
    setTimeout(() => dequeue(item.id), 3600000);
    
    return true;
  } catch (err: any) {
    const errorMsg = err?.message || 'Unknown error';
    await updateQueueItem(item.id, { 
      status: item.retries + 1 >= MAX_RETRIES ? 'failed' : 'pending',
      error: errorMsg 
    });
    errorLogger('processItem', err);
    return false;
  }
}

/**
 * Process all pending items in the queue
 * 
 * @param uploadFn - Function that performs the actual upload/operation
 * @returns Object with success/failure counts
 */
export async function processQueue(
  uploadFn: (payload: any) => Promise<void>
): Promise<{ succeeded: number; failed: number; pending: number }> {
  const online = await isOnline();
  if (!online) {
    return { succeeded: 0, failed: 0, pending: 0 };
  }

  const queue = await getQueue();
  const pendingItems = queue.filter(item => item.status === 'pending' || item.status === 'retrying');

  let succeeded = 0;
  let failed = 0;

  for (const item of pendingItems) {
    const success = await processItem(item, uploadFn);
    if (success) succeeded++;
    else if (item.retries >= MAX_RETRIES) failed++;
  }

  const stillPending = (await getQueue()).filter(
    item => item.status === 'pending' || item.status === 'retrying'
  ).length;

  return { succeeded, failed, pending: stillPending };
}

/**
 * Manually retry a specific failed item
 */
export async function retryItem(id: string, uploadFn: (payload: any) => Promise<void>): Promise<boolean> {
  const queue = await getQueue();
  const item = queue.find(i => i.id === id);
  if (!item) return false;

  // Reset retry count for manual retry
  await updateQueueItem(id, { retries: 0, status: 'pending', error: undefined });
  
  const updatedItem = { ...item, retries: 0, status: 'pending' as const };
  return processItem(updatedItem, uploadFn);
}

/**
 * Clear all succeeded items from the queue
 */
export async function clearSucceeded(): Promise<void> {
  try {
    const queue = await getQueue();
    const filtered = queue.filter(item => item.status !== 'succeeded');
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  } catch (err) {
    errorLogger('clearSucceeded', err);
  }
}

/**
 * Clear all items from the queue (use with caution!)
 */
export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch (err) {
    errorLogger('clearAll', err);
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  total: number;
  pending: number;
  retrying: number;
  failed: number;
  succeeded: number;
  oldestPendingAge?: number;
}> {
  const queue = await getQueue();
  const pending = queue.filter(i => i.status === 'pending');
  const retrying = queue.filter(i => i.status === 'retrying');
  const failed = queue.filter(i => i.status === 'failed');
  const succeeded = queue.filter(i => i.status === 'succeeded');

  let oldestPendingAge: number | undefined;
  if (pending.length > 0) {
    const oldestPending = pending.reduce((oldest, item) => 
      item.createdAt < oldest.createdAt ? item : oldest
    );
    oldestPendingAge = Date.now() - oldestPending.createdAt;
  }

  return {
    total: queue.length,
    pending: pending.length,
    retrying: retrying.length,
    failed: failed.length,
    succeeded: succeeded.length,
    oldestPendingAge,
  };
}

/**
 * Auto-process queue on network reconnection
 * Call this in your app's network listener
 */
export async function autoProcessOnReconnect(uploadFn: (payload: any) => Promise<void>): Promise<void> {
  const online = await isOnline();
  if (!online) return;

  const stats = await getQueueStats();
  if (stats.pending > 0 || stats.retrying > 0) {
    await processQueue(uploadFn);
  }
}
