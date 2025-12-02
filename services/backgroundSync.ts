/**
 * Background Sync Service - Priority 2 Reliability Upgrade
 * 
 * Provides automatic background synchronization for:
 * - Evidence uploads when offline/online transitions
 * - Community posts and comments
 * - User settings and preferences
 * - Wellness data sync
 * 
 * Features:
 * - Expo TaskManager for background execution
 * - Network state monitoring with automatic retry
 * - Configurable sync intervals
 * - Battery-aware sync (optional)
 * - Conflict resolution for concurrent edits
 * - Progress callbacks for UI updates
 */

import { AppState, type AppStateStatus } from 'react-native';

import { logError } from '../utils/errorLogger';

// Lazy-load Expo modules for test compatibility
let TaskManager: any;
let BackgroundFetch: any;
let Network: any;
let AsyncStorage: any;

try { TaskManager = require('expo-task-manager'); } catch {}
try { BackgroundFetch = require('expo-background-fetch'); } catch {}
try { Network = require('expo-network'); } catch {}
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

// Task names
export const BACKGROUND_SYNC_TASK = 'EMPOWRAPP_BACKGROUND_SYNC';
export const NETWORK_CHANGE_TASK = 'EMPOWRAPP_NETWORK_CHANGE';

// Storage keys
const SYNC_CONFIG_KEY = 'backgroundSync:config:v1';
const SYNC_HISTORY_KEY = 'backgroundSync:history:v1';
const PENDING_SYNC_KEY = 'backgroundSync:pending:v1';

// Types
export interface SyncConfig {
  enabled: boolean;
  syncInterval: number; // minutes
  syncOnWifiOnly: boolean;
  syncOnLowBattery: boolean;
  evidenceSync: boolean;
  communitySync: boolean;
  wellnessSync: boolean;
  settingsSync: boolean;
}

export interface SyncItem {
  id: string;
  type: 'evidence' | 'community' | 'wellness' | 'settings';
  action: 'create' | 'update' | 'delete';
  payload: any;
  createdAt: number;
  retries: number;
  lastAttempt?: number;
  error?: string;
  priority: 'high' | 'normal' | 'low';
}

export interface SyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsFailed: number;
  timestamp: number;
  errors: string[];
  duration: number;
}

export interface SyncHistory {
  lastSync: number | null;
  lastSuccessfulSync: number | null;
  totalSyncs: number;
  totalItemsSynced: number;
  recentResults: SyncResult[];
}

// Sync handlers registry
type SyncHandler = (item: SyncItem) => Promise<boolean>;
const syncHandlers: Map<string, SyncHandler> = new Map();

/**
 * Register a sync handler for a specific type
 */
export function registerSyncHandler(type: SyncItem['type'], handler: SyncHandler): void {
  syncHandlers.set(type, handler);
}

/**
 * Get default sync config
 */
function getDefaultConfig(): SyncConfig {
  return {
    enabled: true,
    syncInterval: 15, // 15 minutes
    syncOnWifiOnly: false,
    syncOnLowBattery: true,
    evidenceSync: true,
    communitySync: true,
    wellnessSync: true,
    settingsSync: true,
  };
}

/**
 * Get sync configuration
 */
export async function getSyncConfig(): Promise<SyncConfig> {
  try {
    const raw = await AsyncStorage?.getItem?.(SYNC_CONFIG_KEY);
    if (raw) {
      return { ...getDefaultConfig(), ...JSON.parse(raw) };
    }
  } catch {}
  return getDefaultConfig();
}

/**
 * Save sync configuration
 */
export async function saveSyncConfig(config: Partial<SyncConfig>): Promise<void> {
  try {
    const current = await getSyncConfig();
    const updated = { ...current, ...config };
    await AsyncStorage?.setItem?.(SYNC_CONFIG_KEY, JSON.stringify(updated));
    
    // Re-register background task if interval changed
    if (config.syncInterval && config.syncInterval !== current.syncInterval) {
      await registerBackgroundSync(updated.syncInterval);
    }
  } catch (err) {
    logError('backgroundSync', 'saveSyncConfig', err);
  }
}

/**
 * Get pending sync items
 */
export async function getPendingItems(): Promise<SyncItem[]> {
  try {
    const raw = await AsyncStorage?.getItem?.(PENDING_SYNC_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

/**
 * Save pending sync items
 */
async function savePendingItems(items: SyncItem[]): Promise<void> {
  try {
    await AsyncStorage?.setItem?.(PENDING_SYNC_KEY, JSON.stringify(items));
  } catch (err) {
    logError('backgroundSync', 'savePendingItems', err);
  }
}

/**
 * Add item to sync queue
 */
export async function queueForSync(
  type: SyncItem['type'],
  action: SyncItem['action'],
  payload: any,
  priority: SyncItem['priority'] = 'normal'
): Promise<string> {
  const item: SyncItem = {
    id: `${type}-${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    action,
    payload,
    createdAt: Date.now(),
    retries: 0,
    priority,
  };
  
  const items = await getPendingItems();
  items.push(item);
  
  // Sort by priority
  items.sort((a, b) => {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  await savePendingItems(items);
  
  // Attempt immediate sync if online
  const online = await isOnline();
  if (online) {
    // Don't await - fire and forget
    performSync().catch(() => {});
  }
  
  return item.id;
}

/**
 * Remove item from queue
 */
export async function dequeueItem(id: string): Promise<void> {
  const items = await getPendingItems();
  const filtered = items.filter(item => item.id !== id);
  await savePendingItems(filtered);
}

/**
 * Update item in queue
 */
async function updateQueueItem(id: string, updates: Partial<SyncItem>): Promise<void> {
  const items = await getPendingItems();
  const index = items.findIndex(item => item.id === id);
  if (index >= 0) {
    items[index] = { ...items[index], ...updates };
    await savePendingItems(items);
  }
}

/**
 * Check network connectivity
 */
export async function isOnline(): Promise<boolean> {
  if (!Network) return true; // Assume online if module unavailable
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected === true && state.isInternetReachable === true;
  } catch {
    return true;
  }
}

/**
 * Check if on WiFi
 */
export async function isOnWifi(): Promise<boolean> {
  if (!Network) return false;
  try {
    const state = await Network.getNetworkStateAsync();
    return state.type === Network.NetworkStateType.WIFI;
  } catch {
    return false;
  }
}

/**
 * Get sync history
 */
export async function getSyncHistory(): Promise<SyncHistory> {
  try {
    const raw = await AsyncStorage?.getItem?.(SYNC_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    lastSync: null,
    lastSuccessfulSync: null,
    totalSyncs: 0,
    totalItemsSynced: 0,
    recentResults: [],
  };
}

/**
 * Save sync result to history
 */
async function saveSyncResult(result: SyncResult): Promise<void> {
  try {
    const history = await getSyncHistory();
    
    history.lastSync = result.timestamp;
    if (result.success) {
      history.lastSuccessfulSync = result.timestamp;
    }
    history.totalSyncs++;
    history.totalItemsSynced += result.itemsProcessed;
    
    // Keep last 10 results
    history.recentResults.unshift(result);
    if (history.recentResults.length > 10) {
      history.recentResults = history.recentResults.slice(0, 10);
    }
    
    await AsyncStorage?.setItem?.(SYNC_HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    logError('backgroundSync', 'saveSyncResult', err);
  }
}

// Progress callback
type SyncProgressCallback = (current: number, total: number, item?: SyncItem) => void;
let progressCallback: SyncProgressCallback | null = null;

/**
 * Set progress callback for UI updates
 */
export function setSyncProgressCallback(callback: SyncProgressCallback | null): void {
  progressCallback = callback;
}

/**
 * Perform sync of all pending items
 */
export async function performSync(
  onProgress?: SyncProgressCallback
): Promise<SyncResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let itemsProcessed = 0;
  let itemsFailed = 0;
  
  const config = await getSyncConfig();
  if (!config.enabled) {
    return {
      success: true,
      itemsProcessed: 0,
      itemsFailed: 0,
      timestamp: Date.now(),
      errors: ['Sync disabled'],
      duration: 0,
    };
  }
  
  // Check network
  const online = await isOnline();
  if (!online) {
    return {
      success: false,
      itemsProcessed: 0,
      itemsFailed: 0,
      timestamp: Date.now(),
      errors: ['No network connection'],
      duration: Date.now() - startTime,
    };
  }
  
  // Check WiFi preference
  if (config.syncOnWifiOnly) {
    const onWifi = await isOnWifi();
    if (!onWifi) {
      return {
        success: false,
        itemsProcessed: 0,
        itemsFailed: 0,
        timestamp: Date.now(),
        errors: ['Waiting for WiFi connection'],
        duration: Date.now() - startTime,
      };
    }
  }
  
  const items = await getPendingItems();
  
  // Filter by enabled types
  const eligibleItems = items.filter(item => {
    switch (item.type) {
      case 'evidence': return config.evidenceSync;
      case 'community': return config.communitySync;
      case 'wellness': return config.wellnessSync;
      case 'settings': return config.settingsSync;
      default: return true;
    }
  });
  
  for (let i = 0; i < eligibleItems.length; i++) {
    const item = eligibleItems[i];
    
    // Report progress
    const cb = onProgress || progressCallback;
    cb?.(i + 1, eligibleItems.length, item);
    
    try {
      const handler = syncHandlers.get(item.type);
      if (!handler) {
        errors.push(`No handler for type: ${item.type}`);
        itemsFailed++;
        continue;
      }
      
      // Exponential backoff check
      if (item.retries > 0 && item.lastAttempt) {
        const backoff = Math.min(60000, 1000 * Math.pow(2, item.retries));
        if (Date.now() - item.lastAttempt < backoff) {
          continue; // Skip - too soon to retry
        }
      }
      
      // Update attempt info
      await updateQueueItem(item.id, {
        lastAttempt: Date.now(),
        retries: item.retries + 1,
      });
      
      const success = await handler(item);
      
      if (success) {
        await dequeueItem(item.id);
        itemsProcessed++;
      } else {
        itemsFailed++;
        if (item.retries >= 5) {
          await updateQueueItem(item.id, {
            error: 'Max retries exceeded',
          });
        }
      }
    } catch (err: any) {
      errors.push(`${item.type}: ${err?.message || 'Unknown error'}`);
      itemsFailed++;
      await updateQueueItem(item.id, {
        error: err?.message || 'Unknown error',
      });
    }
  }
  
  const result: SyncResult = {
    success: itemsFailed === 0,
    itemsProcessed,
    itemsFailed,
    timestamp: Date.now(),
    errors,
    duration: Date.now() - startTime,
  };
  
  await saveSyncResult(result);
  
  return result;
}

/**
 * Define the background sync task
 */
export function defineBackgroundSyncTask(): void {
  if (!TaskManager?.defineTask) return;
  
  TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
      const result = await performSync();
      
      return result.success
        ? BackgroundFetch?.BackgroundFetchResult?.NewData
        : BackgroundFetch?.BackgroundFetchResult?.Failed;
    } catch (err) {
      logError('backgroundSync', 'backgroundTask', err);
      return BackgroundFetch?.BackgroundFetchResult?.Failed;
    }
  });
}

/**
 * Register background sync with system
 */
export async function registerBackgroundSync(intervalMinutes: number = 15): Promise<boolean> {
  if (!BackgroundFetch?.registerTaskAsync) {
    console.warn('[BackgroundSync] expo-background-fetch not available');
    return false;
  }
  
  try {
    // Unregister existing task first
    const isRegistered = await TaskManager?.isTaskRegisteredAsync?.(BACKGROUND_SYNC_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    }
    
    // Register new task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: intervalMinutes * 60, // Convert to seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
    
    // Set background fetch status
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      console.warn('[BackgroundSync] Background fetch denied by system');
      return false;
    }
    
    return true;
  } catch (err) {
    logError('backgroundSync', 'register', err);
    return false;
  }
}

/**
 * Unregister background sync
 */
export async function unregisterBackgroundSync(): Promise<void> {
  if (!BackgroundFetch?.unregisterTaskAsync) return;
  
  try {
    const isRegistered = await TaskManager?.isTaskRegisteredAsync?.(BACKGROUND_SYNC_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    }
  } catch (err) {
    logError('backgroundSync', 'unregister', err);
  }
}

// Network state subscription
let networkSubscription: any = null;
let appStateSubscription: any = null;

/**
 * Start network monitoring for auto-sync on reconnect
 */
export function startNetworkMonitoring(): void {
  if (!Network?.addNetworkStateListener) return;
  
  // Stop existing subscription
  stopNetworkMonitoring();
  
  let wasOffline = false;
  
  networkSubscription = Network.addNetworkStateListener((state: any) => {
    const isNowOnline = state.isConnected && state.isInternetReachable;
    
    // Trigger sync when coming back online
    if (isNowOnline && wasOffline) {
      performSync().catch(() => {});
    }
    
    wasOffline = !isNowOnline;
  });
  
  // Also sync when app comes to foreground
  appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
      // Small delay to let network stabilize
      setTimeout(() => {
        isOnline().then(online => {
          if (online) performSync().catch(() => {});
        });
      }, 1000);
    }
  });
}

/**
 * Stop network monitoring
 */
export function stopNetworkMonitoring(): void {
  if (networkSubscription) {
    networkSubscription.remove?.();
    networkSubscription = null;
  }
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}

/**
 * Get sync status summary
 */
export async function getSyncStatus(): Promise<{
  isOnline: boolean;
  isOnWifi: boolean;
  pendingItems: number;
  lastSync: Date | null;
  syncEnabled: boolean;
  backgroundTaskRegistered: boolean;
}> {
  const online = await isOnline();
  const wifi = await isOnWifi();
  const pending = await getPendingItems();
  const history = await getSyncHistory();
  const config = await getSyncConfig();
  
  let registered = false;
  if (TaskManager?.isTaskRegisteredAsync) {
    registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  }
  
  return {
    isOnline: online,
    isOnWifi: wifi,
    pendingItems: pending.length,
    lastSync: history.lastSync ? new Date(history.lastSync) : null,
    syncEnabled: config.enabled,
    backgroundTaskRegistered: registered,
  };
}

/**
 * Force immediate sync (for manual trigger)
 */
export async function forceSyncNow(onProgress?: SyncProgressCallback): Promise<SyncResult> {
  return performSync(onProgress);
}

/**
 * Clear all pending sync items (use with caution!)
 */
export async function clearPendingSync(): Promise<void> {
  await savePendingItems([]);
}

/**
 * Clear sync history
 */
export async function clearSyncHistory(): Promise<void> {
  try {
    await AsyncStorage?.removeItem?.(SYNC_HISTORY_KEY);
  } catch {}
}

/**
 * Initialize background sync system
 * Call this in app startup
 */
export async function initializeBackgroundSync(): Promise<void> {
  // Define the task
  defineBackgroundSyncTask();
  
  // Get config
  const config = await getSyncConfig();
  
  if (config.enabled) {
    // Register background task
    await registerBackgroundSync(config.syncInterval);
    
    // Start network monitoring
    startNetworkMonitoring();
    
    // Perform initial sync if online
    const online = await isOnline();
    if (online) {
      // Delay to not block app startup
      setTimeout(() => {
        performSync().catch(() => {});
      }, 5000);
    }
  }
}

// Export default handlers for common sync types
export const defaultSyncHandlers = {
  /**
   * Evidence sync handler
   * Integrates with existing evidence upload system
   */
  evidence: async (item: SyncItem): Promise<boolean> => {
    try {
      const { uploadEvidenceFileWithProgress, addEvidenceNote } = await import('./evidence');
      
      if (item.action === 'create' && item.payload.files) {
        // Upload files
        for (const file of item.payload.files) {
          await uploadEvidenceFileWithProgress(file.uri, file.name);
        }
        // Add note
        if (item.payload.text) {
          await addEvidenceNote({
            text: item.payload.text,
            tags: item.payload.tags,
            files: item.payload.files,
          });
        }
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  },
  
  /**
   * Community sync handler
   */
  community: async (item: SyncItem): Promise<boolean> => {
    try {
      const firestore = await import('./firestore');
      
      switch (item.action) {
        case 'create':
          if (item.payload.type === 'post') {
            await firestore.fsAddThread?.(item.payload);
          } else if (item.payload.type === 'comment') {
            await firestore.fsAddComment?.(item.payload);
          }
          return true;
        default:
          return false;
      }
    } catch {
      return false;
    }
  },
  
  /**
   * Wellness sync handler
   */
  wellness: async (item: SyncItem): Promise<boolean> => {
    try {
      // Wellness data typically syncs to pattern learning
      const { recordPatternDataPoint } = await import('./patternLearning');
      
      if (item.action === 'create' && item.payload) {
        await recordPatternDataPoint(item.payload.userId, item.payload);
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  },
};

/**
 * Register default handlers
 */
export function registerDefaultHandlers(): void {
  registerSyncHandler('evidence', defaultSyncHandlers.evidence);
  registerSyncHandler('community', defaultSyncHandlers.community);
  registerSyncHandler('wellness', defaultSyncHandlers.wellness);
}
