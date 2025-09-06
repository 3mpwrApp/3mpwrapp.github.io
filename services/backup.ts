let AsyncStorage: any;
try { AsyncStorage = require("@react-native-async-storage/async-storage").default; } catch {}

const PREFIXES = [
  "empowr.", // general app keys
  "wellness_", // trackers
];

export type BackupBundle = { version: number; date: string; items: Record<string, string> };

export async function exportBackup(): Promise<BackupBundle | null> {
  if (!AsyncStorage) return null;
  try {
    const keys: string[] = await AsyncStorage.getAllKeys();
    const wanted = keys.filter((k) => PREFIXES.some((p) => k.startsWith(p)));
    const pairs = await AsyncStorage.multiGet(wanted);
    const items: Record<string, string> = {};
    pairs.forEach(([k, v]) => { if (k && v != null) items[k] = v; });
    return { version: 1, date: new Date().toISOString(), items };
  } catch {
    return null;
  }
}

export async function importBackup(bundle: BackupBundle): Promise<boolean> {
  if (!AsyncStorage || !bundle || !bundle.items) return false;
  try {
    const entries = Object.entries(bundle.items);
    await AsyncStorage.multiSet(entries as [string, string][]);
    return true;
  } catch {
    return false;
  }
}

export async function clearAllData(): Promise<boolean> {
  if (!AsyncStorage) return false;
  try {
    const keys: string[] = await AsyncStorage.getAllKeys();
    const wanted = keys.filter((k) => PREFIXES.some((p) => k.startsWith(p)));
    await AsyncStorage.multiRemove(wanted);
    return true;
  } catch {
    return false;
  }
}

