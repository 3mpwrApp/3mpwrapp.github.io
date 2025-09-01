let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

export async function getCachedJSON<T>(key: string): Promise<T | null> {
  if (!AsyncStorage) return null;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCachedJSON<T>(key: string, value: T): Promise<void> {
  if (!AsyncStorage) return;
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

