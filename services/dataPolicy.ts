/**
 * Central data policy guard. Supports multiple BYOC modes:
 * - 'default': Firebase auth + Firebase storage (standard cloud app)
 * - 'hybrid_byoc': Firebase auth for login + User's own cloud for ALL data storage
 * - 'strict_byoc': No Firebase at all, 100% user-owned everything
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

export function getDataPolicyMode(): DataPolicyMode {
  return mode;
}

// Runtime, session-only BYOC config (not persisted)
export type BYOCConfig = {
  kind: 'webdav';
  endpoint: string; // e.g., https://dav.example.com/remote.php/dav/files/username/
  username?: string;
  password?: string;
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
