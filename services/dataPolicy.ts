/**
 * Central data policy guard. Supports a strict BYOC mode where no app/server storage is used.
 * Strict mode is enabled when EXPO_PUBLIC_DATA_POLICY === 'strict_byoc'.
 */

export type DataPolicyMode = 'default' | 'strict_byoc';

const mode: DataPolicyMode = (process.env.EXPO_PUBLIC_DATA_POLICY as DataPolicyMode) || 'default';

export function isStrictBYOC(): boolean {
  return mode === 'strict_byoc';
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
