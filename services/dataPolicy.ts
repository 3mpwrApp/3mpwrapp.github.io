/**
 * Data Policy Service
 * Manages data retention, privacy policies, and user data controls
 * 
 * pii-scan-ignore-file - Contains contact email addresses for privacy/policy info
 */

import { fetchWithRetry, getErrorMessage, isNetworkError } from '../utils/network';

export type DataPolicyMode = 'default' | 'hybrid_byoc' | 'strict_byoc';

const mode: DataPolicyMode = (process.env.EXPO_PUBLIC_DATA_POLICY as DataPolicyMode) || 'hybrid_byoc';

export function isStrictBYOC(): boolean {
  return mode === 'strict_byoc';
}

export function isHybridBYOC(): boolean {
  return mode === 'hybrid_byoc';
}

export function isBYOCEnabled(): boolean {
  return mode === 'hybrid_byoc' || mode === 'strict_byoc';
}

/**
 * Check if Firestore should be enabled for the current user.
 * ONLY empowrapp08162025@gmail.com gets Firestore access in ALL modes.
 * All other users use BYOC storage regardless of mode.
 */
export function isFirestoreEnabledForUser(userEmail?: string | null): boolean {
  // Only admin gets Firestore in ALL modes
  const ADMIN_EMAIL = 'empowrapp08162025@gmail.com';
  return userEmail === ADMIN_EMAIL;
}

/**
 * Check if BYOC mode should be active for the current user.
 * Returns true if user should use BYOC storage instead of Firestore.
 * Everyone except admin uses BYOC in ALL modes.
 */
export function isBYOCEnabledForUser(userEmail?: string | null): boolean {
  // Everyone except admin uses BYOC in ALL modes
  const ADMIN_EMAIL = 'empowrapp08162025@gmail.com';
  return userEmail !== ADMIN_EMAIL;
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

export function setBYOCConfig(cfg: BYOCConfig | null) {
  byocConfig = cfg;
}

export function getBYOCConfig(): BYOCConfig | null {
  return byocConfig;
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
