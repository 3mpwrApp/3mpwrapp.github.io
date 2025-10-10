// Central retention and pruning helpers for local-only data
// Focus: usage buffer cap, temp evidence exports in cache, and evidence queue completed items

let AsyncStorage: any; try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

const USAGE_KEY = 'usageEvents:v1';

export type RetentionResult = { removed: number };

// Prune oldest usage events beyond 200 entries (defense-in-depth; usage.ts already caps at 500)
export async function pruneUsageBuffer(max = 200): Promise<RetentionResult> {
  try {
    const raw = await AsyncStorage?.getItem?.(USAGE_KEY);
    if (!raw) return { removed: 0 };
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return { removed: 0 };
    if (arr.length <= max) return { removed: 0 };
    const removed = arr.length - max;
    const keep = arr.slice(-max);
    await AsyncStorage?.setItem?.(USAGE_KEY, JSON.stringify(keep));
    return { removed };
  } catch {
    return { removed: 0 };
  }
}

// Reuse evidence queue maintenance for completed items and temp files
export async function pruneEvidenceArtifacts(): Promise<{ removed: number }> {
  try {
    const mod = await import('./evidenceQueue');
    const a = await mod.sweepQueueOldCompleted();
    const b = await mod.sweepTempEvidenceFilesOlderThan();
    return { removed: (a?.removed || 0) + (b?.removed || 0) };
  } catch { return { removed: 0 }; }
}

export async function runRetentionSweep(): Promise<{ removed: number }> {
  const [u, e] = await Promise.all([pruneUsageBuffer(), pruneEvidenceArtifacts()]);
  return { removed: (u.removed || 0) + (e.removed || 0) };
}
