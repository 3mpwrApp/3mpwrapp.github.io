import { trackEvent } from './analyticsClient';
import { ANALYTICS_EVENTS } from './analyticsEvents';
import { addEvidenceNote, uploadEvidenceFileWithProgress, type EvidenceFile } from './evidence';
import { decryptString, encryptString } from './evidenceCrypto';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

export const EVIDENCE_QUEUE_KEY = 'evidence:uploadQueue:v1';
export const EVIDENCE_QUEUE_KEY_ENC = 'evidence:uploadQueue.enc:v1';

export type QueuedAttachment = { name: string; uri: string };
export type QueuedItem = { text: string; tags?: string[]; files?: QueuedAttachment[]; createdAt?: number; completedAt?: number };

const PRUNE_META_KEY = 'maintenance:lastPrune';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function now() { return Date.now(); }
async function getItem(key: string) { try { return await AsyncStorage?.getItem?.(key); } catch { return null; } }
async function setItem(key: string, val: string) { try { await AsyncStorage?.setItem?.(key, val); } catch {} }
async function logMaintenance(event: string, data: any) {
  try { trackEvent(event, data); } catch {}
}

export async function getQueue(): Promise<QueuedItem[]> {
  try {
    // Prefer encrypted queue
    const enc = await AsyncStorage?.getItem?.(EVIDENCE_QUEUE_KEY_ENC);
    if (enc) {
      try {
        const json = await decryptString(enc);
        return json ? (JSON.parse(json) as QueuedItem[]) : [];
      } catch {
        // fall through to plaintext
      }
    }
    const raw = (await AsyncStorage?.getItem?.(EVIDENCE_QUEUE_KEY)) || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function setQueue(items: QueuedItem[]) {
  try {
    const json = JSON.stringify(items);
    const c = await encryptString(json);
    await AsyncStorage?.setItem?.(EVIDENCE_QUEUE_KEY_ENC, c);
    // Remove legacy plaintext key
    await AsyncStorage?.removeItem?.(EVIDENCE_QUEUE_KEY);
  } catch {
    // Fallback to plaintext if crypto unavailable
    try { await AsyncStorage?.setItem?.(EVIDENCE_QUEUE_KEY, JSON.stringify(items)); } catch {}
  }
}

export async function clearQueue() {
  try {
    await AsyncStorage?.removeItem?.(EVIDENCE_QUEUE_KEY_ENC);
    await AsyncStorage?.removeItem?.(EVIDENCE_QUEUE_KEY);
  } catch {}
}

export async function processQueue(onProgress?: (index: number, total: number, pct?: number) => void) {
  const items = await getQueue();
  const total = items.length;
  for (let i = 0; i < items.length; i++) {
    const n = items[i];
    onProgress?.(i + 1, total, 0);
    let uploaded: EvidenceFile[] = [];
    if (n.files?.length) {
      for (const f of n.files) {
        // best-effort progress; callers may ignore pct
        const file = await uploadEvidenceFileWithProgress(f.uri, f.name, (p) => onProgress?.(i + 1, total, p));
        uploaded.push(file);
      }
    }
    await addEvidenceNote({ text: n.text, tags: n.tags, files: uploaded });
    // mark completed timestamp to support pruning
    n.completedAt = now();
    onProgress?.(i + 1, total, 100);
  }
  await clearQueue();
}

// Sweep completed items older than 30 days from the queue (idempotent)
export async function sweepQueueOldCompleted(): Promise<{ removed: number }> {
  const items = await getQueue();
  const cutoff = now() - THIRTY_DAYS_MS;
  const keep: QueuedItem[] = [];
  let removed = 0;
  for (const it of items) {
    if (it.completedAt && it.completedAt < cutoff) { removed++; continue; }
    keep.push(it);
  }
  if (removed) await setQueue(keep);
  return { removed };
}

// Best-effort: remove temp evidence exports/summaries older than 7 days from cache
export async function sweepTempEvidenceFilesOlderThan(maxAgeMs = SEVEN_DAYS_MS): Promise<{ removed: number }> {
  try {
    const FS = await import('expo-file-system');
    const dir = FS.cacheDirectory;
    if (!dir) return { removed: 0 };
    const names: string[] = await FS.readDirectoryAsync(dir);
    const nowMs = now();
    let removed = 0;
    // Only touch files we create with known prefixes (safety)
    const allowPrefixes = ['evidence_', 'evidence_summary_', 'evidence_export_'];
    for (const name of names) {
      if (!allowPrefixes.some((p) => name.startsWith(p))) continue;
      try {
        const p = dir + name;
        const info: any = await FS.getInfoAsync(p);
        const mtimeMs = info?.modificationTime ? info.modificationTime * 1000 : 0;
        if (info?.exists && mtimeMs && nowMs - mtimeMs > maxAgeMs) {
          await FS.deleteAsync(p, { idempotent: true });
          removed++;
        }
      } catch {}
    }
    return { removed };
  } catch {
    return { removed: 0 };
  }
}

// Run pruning on app start and when 12h elapsed since last run
export async function maybeRunPruneCycle(): Promise<void> {
  const raw = await getItem(PRUNE_META_KEY);
  const last = raw ? parseInt(raw, 10) : 0;
  const elapsed = now() - last;
  if (!last || elapsed >= TWELVE_HOURS_MS) {
    const [{ removed }, tmp] = await Promise.all([
      sweepQueueOldCompleted(),
      sweepTempEvidenceFilesOlderThan().catch(() => ({ removed: 0 })),
    ]);
    await setItem(PRUNE_META_KEY, String(now()));
    await logMaintenance(ANALYTICS_EVENTS.EVIDENCE_QUEUE_PROCESSED, {
      removed_queue_completed: removed,
      removed_temp_evidence: tmp.removed,
      since_ms: elapsed || null,
    });
  }
}

