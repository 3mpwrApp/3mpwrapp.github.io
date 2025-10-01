import { addEvidenceNote, uploadEvidenceFileWithProgress, type EvidenceFile } from './evidence';
import { decryptString, encryptString } from './evidenceCrypto';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

export const EVIDENCE_QUEUE_KEY = 'evidence:uploadQueue:v1';
export const EVIDENCE_QUEUE_KEY_ENC = 'evidence:uploadQueue.enc:v1';

export type QueuedAttachment = { name: string; uri: string };
export type QueuedItem = { text: string; tags?: string[]; files?: QueuedAttachment[] };

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
    onProgress?.(i + 1, total, 100);
  }
  await clearQueue();
}

