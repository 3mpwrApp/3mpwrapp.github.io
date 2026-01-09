import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../utils/logger';

/**
 * AsyncStorage persistence layer with:
 * - Serialization queue to prevent race conditions
 * - Write debouncing to batch operations
 * - Data validation and corruption detection
 * - Atomic multi-key operations
 */

interface QueuedWrite {
  key: string;
  value: string | null;
  timestamp: number;
}

interface PersistenceState {
  queue: Map<string, QueuedWrite>;
  isProcessing: boolean;
  debounceTimer: NodeJS.Timeout | null;
  lastWriteTime: number;
  writeCount: number;
  corruptionCount: number;
}

const state: PersistenceState = {
  queue: new Map(),
  isProcessing: false,
  debounceTimer: null,
  lastWriteTime: 0,
  writeCount: 0,
  corruptionCount: 0,
};

const DEBOUNCE_MS = 500;
const SAFE_DEFAULT_STATE: Record<string, any> = {
  'empowr.onboarded': '0',
  'empowr.authMode': 'signedOut',
  'empowr.user': null,
};

/**
 * Validate data integrity after read
 */
function validateData(data: any): boolean {
  try {
    // Basic validation - check if it's JSON-parseable
    if (typeof data === 'string') {
      if (data.startsWith('{') || data.startsWith('[')) {
        JSON.parse(data);
      }
    }
    return true;
  } catch (error) {
    logger.warn('[PersistenceQueue] Data validation failed:', error);
    return false;
  }
}

/**
 * Detect and handle corrupted data
 */
async function handleCorruptedData(key: string): Promise<void> {
  state.corruptionCount++;
  logger.error(`[PersistenceQueue] Data corruption detected for key: ${key}`);

  // Reset to safe state
  if (key in SAFE_DEFAULT_STATE) {
    try {
      const safeValue = SAFE_DEFAULT_STATE[key];
      if (safeValue === null) {
        await AsyncStorage.removeItem(key);
      } else {
        await AsyncStorage.setItem(key, safeValue);
      }
      logger.info(`[PersistenceQueue] Reset corrupted key to safe state: ${key}`);
    } catch (error) {
      logger.error(`[PersistenceQueue] Failed to reset corrupted key: ${key}`, error);
    }
  }

  // Warn developer if corruption happens frequently
  if (state.corruptionCount > 5) {
    logger.warn(
      '[PersistenceQueue] High corruption rate detected - check data sources'
    );
  }
}

/**
 * Process the queue - atomic multi-set operation
 */
async function processQueue(): Promise<void> {
  if (state.isProcessing || state.queue.size === 0) {
    return;
  }

  state.isProcessing = true;
  const startTime = performance.now();

  try {
    // Prepare batch write
    const batchOps: [string, string][] = [];
    const keysToDelete: string[] = [];

    for (const [key, write] of state.queue.entries()) {
      if (write.value === null) {
        keysToDelete.push(key);
      } else {
        batchOps.push([key, write.value]);
      }
    }

    // Execute atomic operations
    if (batchOps.length > 0) {
      await AsyncStorage.multiSet(batchOps);
    }
    if (keysToDelete.length > 0) {
      await AsyncStorage.multiRemove(keysToDelete);
    }

    const writeCount = state.queue.size;
    state.queue.clear();
    state.lastWriteTime = Date.now();
    state.writeCount += writeCount;

    const duration = performance.now() - startTime;
    logger.debug(
      `[PersistenceQueue] Processed ${writeCount} writes in ${duration.toFixed(2)}ms`
    );
  } catch (error) {
    logger.error('[PersistenceQueue] Failed to process queue:', error);
    // Keep items in queue for retry on next trigger
  } finally {
    state.isProcessing = false;
  }
}

/**
 * Queue a write operation with debouncing
 */
async function queueWrite(key: string, value: string | null): Promise<void> {
  // Add to queue
  state.queue.set(key, {
    key,
    value,
    timestamp: Date.now(),
  });

  // Clear existing debounce timer
  if (state.debounceTimer) {
    clearTimeout(state.debounceTimer);
  }

  // Set new debounce timer
  state.debounceTimer = (setTimeout(() => {
    state.debounceTimer = null;
    processQueue().catch((error) => {
      logger.error('[PersistenceQueue] Debounced queue processing failed:', error);
    });
  }, DEBOUNCE_MS)) as unknown as NodeJS.Timeout;
}

/**
 * Set item with race condition protection
 */
export async function setItem(key: string, value: string): Promise<void> {
  if (!AsyncStorage) {
    throw new Error('AsyncStorage not available');
  }
  await queueWrite(key, value);
}

/**
 * Remove item with race condition protection
 */
export async function removeItem(key: string): Promise<void> {
  if (!AsyncStorage) {
    throw new Error('AsyncStorage not available');
  }
  await queueWrite(key, null);
}

/**
 * Get item with validation
 */
export async function getItem(key: string): Promise<string | null> {
  if (!AsyncStorage) {
    throw new Error('AsyncStorage not available');
  }

  try {
    const value = await AsyncStorage.getItem(key);

    if (value && !validateData(value)) {
      await handleCorruptedData(key);
      return null;
    }

    return value;
  } catch (error) {
    logger.error(`[PersistenceQueue] Failed to get item: ${key}`, error);
    return null;
  }
}

/**
 * Multi-get with validation
 */
export async function multiGet(keys: string[]): Promise<(string | null)[]> {
  if (!AsyncStorage) {
    throw new Error('AsyncStorage not available');
  }

  try {
    const results = await AsyncStorage.multiGet(keys);
    return results.map(([, value]) => {
      if (value && !validateData(value)) {
        return null;
      }
      return value;
    });
  } catch (error) {
    logger.error('[PersistenceQueue] Failed to multi-get items:', error);
    return keys.map(() => null);
  }
}

/**
 * Flush all pending writes immediately
 */
export async function flush(): Promise<void> {
  if (state.debounceTimer) {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = null;
  }
  await processQueue();
}

/**
 * Get persistence statistics
 */
export function getStats(): {
  queueSize: number;
  isProcessing: boolean;
  totalWrites: number;
  corruptionCount: number;
  lastWriteTime: number;
  timeSinceLastWrite: number;
} {
  return {
    queueSize: state.queue.size,
    isProcessing: state.isProcessing,
    totalWrites: state.writeCount,
    corruptionCount: state.corruptionCount,
    lastWriteTime: state.lastWriteTime,
    timeSinceLastWrite: Date.now() - state.lastWriteTime,
  };
}

/**
 * Reset statistics
 */
export function resetStats(): void {
  state.writeCount = 0;
  state.corruptionCount = 0;
  state.lastWriteTime = 0;
}

/**
 * Clear all data (logout/reset)
 */
export async function clear(): Promise<void> {
  if (!AsyncStorage) {
    throw new Error('AsyncStorage not available');
  }

  // Flush pending writes first
  await flush();

  try {
    await AsyncStorage.clear();
    state.queue.clear();
    logger.debug('[PersistenceQueue] All data cleared');
  } catch (error) {
    logger.error('[PersistenceQueue] Failed to clear all data:', error);
    throw error;
  }
}
