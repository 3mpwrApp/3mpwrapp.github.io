/**
 * Central data policy guard. Supports multiple BYOC modes:
 * - 'default': Firebase auth + Firebase storage (standard cloud app)
 * - 'hybrid_byoc': Firebase auth for login + User's own cloud for ALL data storage
 * - 'strict_byoc': No Firebase at all, 100% user-owned everything
 */

export type DataPolicyMode = 'default' | 'hybrid_byoc' | 'strict_byoc';

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
export async function testBYOCConnection(cfg: BYOCConfig): Promise<{ ok: boolean; status?: number }> {
  try {
    const headers: Record<string, string> = {};
    if (cfg.username && cfg.password) {
      const token = typeof btoa !== 'undefined'
        ? btoa(`${cfg.username}:${cfg.password}`)
        : Buffer.from(`${cfg.username}:${cfg.password}`, 'utf8').toString('base64');
      headers['Authorization'] = `Basic ${token}`;
    }
    const res = await fetch(cfg.endpoint, { method: 'HEAD', headers });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false };
  }
}
