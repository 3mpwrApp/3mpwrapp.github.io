/**
 * Data Policy Service
 * Manages data retention, privacy policies, and user data controls
 *
 * pii-scan-ignore-file - Contains contact email addresses for privacy/policy info
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchWithRetry, getErrorMessage, isNetworkError } from '../utils/network';
import { logger } from '../utils/logger';

// AsyncStorage key for persisting BYOC config
const BYOC_CONFIG_KEY = '@byoc_config';

export type DataPolicyMode = 'default' | 'hybrid_byoc' | 'strict_byoc';

// STRATEGIC CHANGE: Default to 'default' (local AsyncStorage) instead of 'hybrid_byoc'
// This removes onboarding complexity - users can enable BYOC later in Settings
// Preserves trust moat (BYOC exists) while removing adoption barrier
const mode: DataPolicyMode = (process.env.EXPO_PUBLIC_DATA_POLICY as DataPolicyMode) || 'default';

export function isStrictBYOC(): boolean {
  return mode === 'strict_byoc';
}

export function isHybridBYOC(): boolean {
  return mode === 'hybrid_byoc';
}

export function isBYOCEnabled(): boolean {
  return mode === 'hybrid_byoc' || mode === 'strict_byoc';
}

// Super Admin email (founder with god-mode Firestore access)
// Matches SUPER_ADMIN_EMAIL in context/AuthContext.tsx
const SUPER_ADMIN_EMAIL = 'empowrapp08162025@gmail.com';

/**
 * Check if Firestore should be enabled for the current user.
 * ONLY Super Admin (founder) gets Firestore access in ALL modes.
 * All other users (including general admins) use BYOC storage.
 */
export function isFirestoreEnabledForUser(userEmail?: string | null): boolean {
  return userEmail === SUPER_ADMIN_EMAIL;
}

/**
 * Check if BYOC mode should be active for the current user.
 * Returns true if user should use BYOC storage instead of Firestore.
 * Everyone except Super Admin uses BYOC in ALL modes.
 */
export function isBYOCEnabledForUser(userEmail?: string | null): boolean {
  return userEmail !== SUPER_ADMIN_EMAIL;
}

export function getDataPolicyMode(): DataPolicyMode {
  return mode;
}

// Runtime, session-only BYOC config (not persisted)
export type BYOCConfig = {
  kind: 'webdav' | 'gdrive';
  endpoint?: string; // e.g., https://dav.example.com/remote.php/dav/files/username/ (for WebDAV)
  username?: string;
  password?: string;
  // Google Drive specific
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  folderId?: string;
};

let byocConfig: BYOCConfig | null = null;

export async function setBYOCConfig(cfg: BYOCConfig | null): Promise<void> {
  byocConfig = cfg;

  try {
    if (cfg) {
      await AsyncStorage.setItem(BYOC_CONFIG_KEY, JSON.stringify(cfg));
      logger.log('[BYOC] Config persisted to storage');
    } else {
      await AsyncStorage.removeItem(BYOC_CONFIG_KEY);
      logger.log('[BYOC] Config removed from storage');
    }
  } catch (error) {
    logger.error('[BYOC] Failed to persist config:', error);
  }
}

export function getBYOCConfig(): BYOCConfig | null {
  return byocConfig;
}

/**
 * Load BYOC configuration from storage
 * Call this on app startup to restore the session
 */
export async function loadBYOCConfig(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(BYOC_CONFIG_KEY);
    if (stored) {
      byocConfig = JSON.parse(stored);
      logger.log('[BYOC] Config loaded from storage');
    }
  } catch (error) {
    logger.error('[BYOC] Failed to load config:', error);
  }
}

/**
 * Quick connection probe. For WebDAV, try a HEAD to endpoint root.
 * Never store creds; use basic auth for this probe only.
 */
export async function testBYOCConnection(cfg: BYOCConfig): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    if (!cfg.endpoint) {
      return { ok: false, error: 'No endpoint configured' };
    }
    
    const headers: Record<string, string> = {};
    if (cfg.username && cfg.password) {
      const token = typeof btoa !== 'undefined'
        ? btoa(`${cfg.username}:${cfg.password}`)
        : Buffer.from(`${cfg.username}:${cfg.password}`, 'utf8').toString('base64');
      headers['Authorization'] = `Basic ${token}`;
    }
    
    // Use network utility with 10s timeout and 2 retries
    const res = await fetchWithRetry(cfg.endpoint, { 
      method: 'HEAD', 
      headers,
      timeout: 10000,
      retries: 2,
    });
    
    return { ok: res.ok, status: res.status };
  } catch (error) {
    // Provide user-friendly error message
    const message = isNetworkError(error) ? getErrorMessage(error) : 'Connection failed';
    return { ok: false, error: message };
  }
}
