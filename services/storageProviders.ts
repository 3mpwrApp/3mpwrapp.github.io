import { getBYOCConfig, isBYOCEnabled, type BYOCConfig } from './dataPolicy';

export type StorageProvider = {
  id: 'ephemeral' | 'webdav';
  name: string;
  save: (path: string, data: string | Uint8Array, contentType?: string) => Promise<boolean>;
  load: (path: string) => Promise<string | Uint8Array | null>;
  remove: (path: string) => Promise<boolean>;
};

function getHeaders(cfg: BYOCConfig): Record<string, string> {
  const headers: Record<string, string> = {};
  if (cfg.username && cfg.password) {
    const token = typeof btoa !== 'undefined'
      ? btoa(`${cfg.username}:${cfg.password}`)
      : Buffer.from(`${cfg.username}:${cfg.password}`, 'utf8').toString('base64');
    headers['Authorization'] = `Basic ${token}`;
  }
  return headers;
}

const webdavProvider: StorageProvider = {
  id: 'webdav',
  name: 'WebDAV',
  async save(path, data, contentType) {
    const cfg = getBYOCConfig();
    if (!cfg || cfg.kind !== 'webdav') return false;
    try {
  const headers = getHeaders(cfg);
  if (contentType) headers['Content-Type'] = contentType;
  const body: BodyInit = typeof data === 'string' ? data : (data as unknown as ArrayBufferView as any);
      const res = await fetch(cfg.endpoint.replace(/\/$/, '') + '/' + path.replace(/^\//, ''), {
        method: 'PUT', headers, body,
      });
      return res.ok || res.status === 201 || res.status === 204;
    } catch { return false; }
  },
  async load(path) {
    const cfg = getBYOCConfig();
    if (!cfg || cfg.kind !== 'webdav') return null;
    try {
      const headers = getHeaders(cfg);
      const res = await fetch(cfg.endpoint.replace(/\/$/, '') + '/' + path.replace(/^\//, ''), { headers });
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      return new Uint8Array(buf);
    } catch { return null; }
  },
  async remove(path) {
    const cfg = getBYOCConfig();
    if (!cfg || cfg.kind !== 'webdav') return false;
    try {
      const headers = getHeaders(cfg);
      const res = await fetch(cfg.endpoint.replace(/\/$/, '') + '/' + path.replace(/^\//, ''), { method: 'DELETE', headers });
      return res.ok || res.status === 404; // 404 means it's already gone
    } catch { return false; }
  },
};

// Ephemeral provider: no persistence, returns success without storing.
const ephemeralProvider: StorageProvider = {
  id: 'ephemeral',
  name: 'Ephemeral (no storage)',
  async save() { return true; },
  async load() { return null; },
  async remove() { return true; },
};

export function getActiveStorage(): StorageProvider {
  // BYOC mode (hybrid or strict) requires a BYOC provider; if none configured, use ephemeral to avoid writing to app storage.
  const cfg = getBYOCConfig();
  if (isBYOCEnabled()) {
    if (cfg?.kind === 'webdav') return webdavProvider;
    return ephemeralProvider;
  }
  // Default mode: still prefer BYOC if configured; otherwise ephemeral
  if (cfg?.kind === 'webdav') return webdavProvider;
  return ephemeralProvider;
}
