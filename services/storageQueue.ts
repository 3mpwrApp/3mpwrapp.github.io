import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../utils/logger';

/**
 * Storage Queue Service
 * Prevents race conditions in AsyncStorage by queueing writes
 * Debounces writes to batch changes within 500ms window
 * Validates data on read to detect corruption
 */

interface StorageOperation {
  type: 'set' | 'remove';
  key: string;
  value?: string;
}

interface QueueState {
  operations: StorageOperation[];
  debounceTimer: NodeJS.Timeout | null;
  isProcessing: boolean;
}

const queue: QueueState = {
  operations: [],
  debounceTimer: null,
  isProcessing: false,
};

const DEBOUNCE_DELAY = 500; // ms
const CORRUPTION_MARKERS = ['CORRUPTED', '\x00', '\uffff'];

/**
 * Checks if data appears corrupted
 */
function isDataCorrupted(data: string): boolean {
  if (!data || typeof data !== 'string') return false;
  return CORRUPTION_MARKERS.some(marker => data.includes(marker));
}

/**
 * Processes all queued operations atomically
 */
async function processQueue(): Promise<void> {
  if (queue.isProcessing || queue.operations.length === 0) {
    return;
  }

  queue.isProcessing = true;

  try {
    const setOps: Array<[string, string]> = [];
    const removeKeys: string[] = [];

    // Group operations - later operations override earlier ones for same key
    const keyMap = new Map<string, StorageOperation>();
    for (const op of queue.operations) {
      keyMap.set(op.key, op);
    }

    // Separate into set and remove operations
    for (const op of keyMap.values()) {
      if (op.type === 'set' && op.value !== undefined) {
        setOps.push([op.key, op.value]);
      } else if (op.type === 'remove') {
        removeKeys.push(op.key);
      }
    }

    // Execute atomic operations
    const promises: Promise<void>[] = [];

    if (setOps.length > 0) {
      promises.push(
        AsyncStorage.multiSet(setOps).catch(error => {
          logger.error('[StorageQueue] Failed to write to AsyncStorage:', error);
          throw error;
        })
      );
    }

    if (removeKeys.length > 0) {
      promises.push(
        AsyncStorage.multiRemove(removeKeys).catch(error => {
          logger.error('[StorageQueue] Failed to remove from AsyncStorage:', error);
          throw error;
        })
      );
    }

    await Promise.all(promises);
    queue.operations = [];
    logger.debug(`[StorageQueue] Flushed ${setOps.length + removeKeys.length} operations`);
  } catch (error) {
    logger.error('[StorageQueue] Error processing queue:', error);
    // Keep operations in queue for retry on next flush
    throw error;
  } finally {
    queue.isProcessing = false;
  }
}

/**
 * Schedules queue processing with debounce
 */
function scheduleFlush(): void {
  // Clear existing timer
  if (queue.debounceTimer) {
    clearTimeout(queue.debounceTimer);
  }

  // Schedule new flush
  queue.debounceTimer = setTimeout(() => {
    queue.debounceTimer = null;
    processQueue().catch(error => {
      logger.error('[StorageQueue] Queue processing failed:', error);
    });
  }, DEBOUNCE_DELAY) as unknown as NodeJS.Timeout;
}

/**
 * Queues a set operation - batches with other operations
 */
export async function queueSet(key: string, value: string): Promise<void> {
  if (!key) {
    throw new Error('[StorageQueue] Key cannot be empty');
  }

  queue.operations.push({
    type: 'set',
    key,
    value,
  });

  scheduleFlush();
  logger.debug(`[StorageQueue] Queued set operation for key: ${key}`);
}

/**
 * Queues a remove operation - batches with other operations
 */
export async function queueRemove(key: string): Promise<void> {
  if (!key) {
    throw new Error('[StorageQueue] Key cannot be empty');
  }

  queue.operations.push({
    type: 'remove',
    key,
  });

  scheduleFlush();
  logger.debug(`[StorageQueue] Queued remove operation for key: ${key}`);
}

/**
 * Queues multiple set operations atomically
 */
export async function queueMultiSet(items: Array<[string, string]>): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('[StorageQueue] Items must be a non-empty array');
  }

  for (const [key, value] of items) {
    if (!key) {
      throw new Error('[StorageQueue] All keys must be non-empty');
    }
    queue.operations.push({
      type: 'set',
      key,
      value,
    });
  }

  scheduleFlush();
  logger.debug(`[StorageQueue] Queued ${items.length} multi-set operations`);
}

/**
 * Queues multiple remove operations atomically
 */
export async function queueMultiRemove(keys: string[]): Promise<void> {
  if (!Array.isArray(keys) || keys.length === 0) {
    throw new Error('[StorageQueue] Keys must be a non-empty array');
  }

  for (const key of keys) {
    if (!key) {
      throw new Error('[StorageQueue] All keys must be non-empty');
    }
    queue.operations.push({
      type: 'remove',
      key,
    });
  }

  scheduleFlush();
  logger.debug(`[StorageQueue] Queued ${keys.length} multi-remove operations`);
}

/**
 * Flushes all pending operations immediately
 */
export async function flush(): Promise<void> {
  if (queue.debounceTimer) {
    clearTimeout(queue.debounceTimer);
    queue.debounceTimer = null;
  }

  if (queue.operations.length > 0) {
    await processQueue();
  }
  logger.debug('[StorageQueue] Flushed pending operations');
}

/**
 * Persists application state - validates and handles corruption
 */
export async function persistState(
  stateKey: string,
  stateData: Record<string, any>
): Promise<void> {
  try {
    const serialized = JSON.stringify(stateData);
    
    if (isDataCorrupted(serialized)) {
      throw new Error('[StorageQueue] State data appears corrupted, aborting persist');
    }

    await queueSet(stateKey, serialized);
  } catch (error) {
    logger.error(`[StorageQueue] Failed to persist state (${stateKey}):`, error);
    throw error;
  }
}

/**
 * Retrieves and validates persisted state
 */
export async function getPersistedState<T extends Record<string, any>>(
  stateKey: string
): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(stateKey);
    
    if (!data) {
      return null;
    }

    if (isDataCorrupted(data)) {
      logger.warn(`[StorageQueue] Detected corrupted state (${stateKey}), clearing`);
      await queueRemove(stateKey);
      await flush();
      return null;
    }

    try {
      return JSON.parse(data) as T;
    } catch (parseError) {
      logger.error(`[StorageQueue] Failed to parse state (${stateKey}):`, parseError);
      await queueRemove(stateKey);
      await flush();
      return null;
    }
  } catch (error) {
    logger.error(`[StorageQueue] Failed to retrieve state (${stateKey}):`, error);
    return null;
  }
}

/**
 * Gets current queue size (for debugging/monitoring)
 */
export function getQueueSize(): number {
  return queue.operations.length;
}

/**
 * Gets whether queue is currently processing
 */
export function isProcessing(): boolean {
  return queue.isProcessing;
}

/**
 * Clears all pending operations (use with caution)
 */
export function clearQueue(): void {
  if (queue.debounceTimer) {
    clearTimeout(queue.debounceTimer);
    queue.debounceTimer = null;
  }
  const count = queue.operations.length;
  queue.operations = [];
  logger.warn(`[StorageQueue] Cleared ${count} pending operations`);
}
