/**
 * Cloud Sync Service
 * 
 * Provides cross-platform synchronization for all user data.
 * Users can use the app on mobile or web browser and have their
 * settings, bookmarks, favorites, mood entries, and preferences sync seamlessly.
 * 
 * Architecture:
 * - AsyncStorage for local persistence (works offline)
 * - Firestore for cloud sync (authenticated users only)
 * - Debounced writes to prevent excessive API calls
 * - Merge strategy: newer data wins, with local fallback
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import { auth, db } from '../firebase/config';

import { isCloudConsentEnabled } from './consent';

// ===== CONFIGURATION =====

const SYNC_DEBOUNCE_MS = 3000; // Wait 3 seconds after last change
const SYNC_COLLECTION = 'user_sync';
const SYNC_DOC = 'app_data';

// Storage keys that should be synced to cloud
const SYNCABLE_KEYS = [
  // User settings and preferences
  'settings:v1',
  'empowr.a11y.settings.v1',
  'empowr.profile.local.v1',
  'jurisdiction:selected:v1',
  
  // User content
  'bookmarks:v1',
  'favorites:v1',
  'mood:entries:v1',
  
  // Cognitive comfort
  'cognitiveComfort:navigationHistory:v1',
  'cognitiveComfort:sessionSummary:v1',
  'cognitiveComfort:preferences:v1',
  
  // Progress and state
  'coachProgress:v1',
  'onboarding:first7:v1',
  'complexityMode:v1',
  'energyCoins:v1',
  'resilience:v1',
  
  // Privacy preferences (to remember across devices)
  'privacy:consent:v1',
];

// Keys that should NEVER be synced (sensitive/device-specific)
const NEVER_SYNC_KEYS = [
  'auth:',           // Auth tokens
  'device:',         // Device-specific data
  'cache:',          // Cached data
  'evidence:',       // Evidence locker (too large, handled separately)
  'notification:',   // Device notification tokens
];

// ===== STATE =====

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let lastSyncTime = 0;
let isSyncing = false;
let syncListeners: Set<(status: SyncStatus) => void> = new Set();

export type SyncStatus = 
  | 'idle' 
  | 'syncing' 
  | 'synced' 
  | 'error' 
  | 'offline' 
  | 'disabled';

let currentStatus: SyncStatus = 'idle';

// ===== HELPERS =====

/**
 * Check if cloud sync is available
 */
export function canSyncToCloud(): boolean {
  try {
    if (!auth?.currentUser?.uid) return false;
    if (!db) return false;
    if (auth.currentUser.isAnonymous) return false;
    if (!isCloudConsentEnabled()) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a storage key should be synced
 */
function shouldSyncKey(key: string): boolean {
  // Check exclusion list
  if (NEVER_SYNC_KEYS.some(prefix => key.startsWith(prefix))) {
    return false;
  }
  // Check inclusion list
  return SYNCABLE_KEYS.includes(key);
}

/**
 * Get Firestore document reference for user's synced data
 */
function getSyncDocRef() {
  const uid = auth?.currentUser?.uid;
  if (!uid || !db) return null;
  return doc(db, 'users', uid, SYNC_COLLECTION, SYNC_DOC);
}

/**
 * Notify listeners of status change
 */
function setStatus(status: SyncStatus) {
  currentStatus = status;
  syncListeners.forEach(listener => {
    try {
      listener(status);
    } catch {}
  });
}

// ===== MAIN API =====

/**
 * Subscribe to sync status changes
 */
export function subscribeSyncStatus(listener: (status: SyncStatus) => void): () => void {
  syncListeners.add(listener);
  // Immediately notify with current status
  listener(currentStatus);
  return () => syncListeners.delete(listener);
}

/**
 * Get current sync status
 */
export function getSyncStatus(): SyncStatus {
  return currentStatus;
}

/**
 * Get time since last successful sync
 */
export function getLastSyncTime(): number {
  return lastSyncTime;
}

/**
 * Schedule a sync to cloud (debounced)
 * Call this whenever local data changes
 */
export function scheduleSyncToCloud(): void {
  if (!canSyncToCloud()) {
    setStatus('disabled');
    return;
  }
  
  // Clear existing timeout
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  
  // Schedule new sync
  syncTimeout = setTimeout(async () => {
    try {
      await syncToCloud();
    } catch (error) {
      if (__DEV__) console.warn('[CloudSync] Scheduled sync failed:', error);
    }
  }, SYNC_DEBOUNCE_MS);
}

/**
 * Immediately sync all syncable data to Firestore
 */
export async function syncToCloud(): Promise<void> {
  if (!canSyncToCloud()) {
    setStatus('disabled');
    return;
  }
  
  if (isSyncing) {
    if (__DEV__) console.warn('[CloudSync] Already syncing, skipping');
    return;
  }
  
  const docRef = getSyncDocRef();
  if (!docRef) return;
  
  isSyncing = true;
  setStatus('syncing');
  
  try {
    // Gather all syncable data from AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    const syncableKeys = allKeys.filter(shouldSyncKey);
    const pairs = await AsyncStorage.multiGet(syncableKeys);
    
    // Build data object
    const syncData: Record<string, unknown> = {};
    for (const [key, value] of pairs) {
      if (key && value) {
        try {
          syncData[key] = JSON.parse(value);
        } catch {
          syncData[key] = value; // Store as string if not JSON
        }
      }
    }
    
    // Write to Firestore
    await setDoc(docRef, {
      data: syncData,
      keys: syncableKeys,
      updatedAt: serverTimestamp(),
      deviceInfo: {
        platform: typeof navigator !== 'undefined' ? 'web' : 'native',
        syncedAt: Date.now(),
      },
    }, { merge: true });
    
    lastSyncTime = Date.now();
    setStatus('synced');
    
    if (__DEV__) console.warn('[CloudSync] Synced', syncableKeys.length, 'keys to cloud');
  } catch (error) {
    setStatus('error');
    if (__DEV__) console.error('[CloudSync] Sync failed:', error);
    throw error;
  } finally {
    isSyncing = false;
  }
}

/**
 * Load data from Firestore and merge with local storage
 * Cloud data takes precedence for conflict resolution
 */
export async function loadFromCloud(): Promise<boolean> {
  if (!canSyncToCloud()) {
    setStatus('disabled');
    return false;
  }
  
  const docRef = getSyncDocRef();
  if (!docRef) return false;
  
  setStatus('syncing');
  
  try {
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      setStatus('idle');
      return false;
    }
    
    const cloudData = snapshot.data();
    const data = cloudData?.data as Record<string, unknown> | undefined;
    
    if (!data || typeof data !== 'object') {
      setStatus('idle');
      return false;
    }
    
    // Get cloud update time
    const cloudUpdatedAt = cloudData?.updatedAt instanceof Timestamp 
      ? cloudData.updatedAt.toMillis() 
      : 0;
    
    // Get local data for comparison
    const allKeys = await AsyncStorage.getAllKeys();
    const syncableKeys = allKeys.filter(shouldSyncKey);
    const localPairs = await AsyncStorage.multiGet(syncableKeys);
    const localData: Record<string, string | null> = {};
    for (const [key, value] of localPairs) {
      if (key) localData[key] = value;
    }
    
    // Merge: cloud data wins, but preserve any local-only keys
    const toWrite: Array<[string, string]> = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (shouldSyncKey(key) && value !== undefined) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        toWrite.push([key, stringValue]);
      }
    }
    
    if (toWrite.length > 0) {
      await AsyncStorage.multiSet(toWrite);
    }
    
    lastSyncTime = cloudUpdatedAt || Date.now();
    setStatus('synced');
    
    if (__DEV__) console.warn('[CloudSync] Loaded', toWrite.length, 'keys from cloud');
    return true;
  } catch (error) {
    setStatus('error');
    if (__DEV__) console.error('[CloudSync] Load from cloud failed:', error);
    return false;
  }
}

/**
 * Initialize cloud sync on app start
 * Should be called after authentication is complete
 */
export async function initializeCloudSync(): Promise<void> {
  if (!canSyncToCloud()) {
    if (__DEV__) console.warn('[CloudSync] Cloud sync not available');
    setStatus('disabled');
    return;
  }
  
  try {
    // First, load from cloud to get latest data from other devices
    await loadFromCloud();
    
    // Then sync any local changes that might have happened while offline
    await syncToCloud();
    
    if (__DEV__) console.warn('[CloudSync] Initialized successfully');
  } catch (error) {
    if (__DEV__) console.warn('[CloudSync] Initialization error:', error);
    setStatus('error');
  }
}

/**
 * Force a full sync (useful after settings changes)
 */
export async function forceSync(): Promise<void> {
  // Clear any pending debounced sync
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }
  
  await syncToCloud();
}

/**
 * Clear all cloud data (for account deletion or privacy)
 */
export async function clearCloudData(): Promise<void> {
  const docRef = getSyncDocRef();
  if (!docRef) return;
  
  try {
    await setDoc(docRef, {
      data: {},
      keys: [],
      clearedAt: serverTimestamp(),
    });
    
    if (__DEV__) console.warn('[CloudSync] Cloud data cleared');
  } catch (error) {
    if (__DEV__) console.error('[CloudSync] Failed to clear cloud data:', error);
    throw error;
  }
}

// ===== REACT HOOK =====

/**
 * React hook for cloud sync status and controls
 */
export function useCloudSync() {
  const [status, setStatusState] = useState<SyncStatus>(currentStatus);
  const [lastSync, setLastSync] = useState<number>(lastSyncTime);
  
  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((newStatus) => {
      setStatusState(newStatus);
      setLastSync(lastSyncTime);
    });
    return unsubscribe;
  }, []);
  
  const sync = useCallback(async () => {
    await forceSync();
  }, []);
  
  const reload = useCallback(async () => {
    await loadFromCloud();
  }, []);
  
  return {
    status,
    lastSync,
    canSync: canSyncToCloud(),
    sync,
    reload,
    initialize: initializeCloudSync,
  };
}

export default {
  canSyncToCloud,
  syncToCloud,
  loadFromCloud,
  scheduleSyncToCloud,
  initializeCloudSync,
  forceSync,
  clearCloudData,
  getSyncStatus,
  getLastSyncTime,
  subscribeSyncStatus,
  useCloudSync,
};
