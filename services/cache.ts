let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export async function getCachedJSON<T>(key: string, ttl: number = CACHE_TTL_MS): Promise<T | null> {
  if (!AsyncStorage) return null;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    
    const cached: CachedData<T> = JSON.parse(raw);
    const age = Date.now() - cached.timestamp;
    
    // Check if cache is expired
    if (age > ttl) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(key);
      return null;
    }
    
    return cached.data;
  } catch {
    return null;
  }
}

export async function setCachedJSON<T>(key: string, value: T): Promise<void> {
  if (!AsyncStorage) return;
  try {
    const cached: CachedData<T> = {
      data: value,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cached));
  } catch {}
}

export async function clearCache(keyPattern?: string): Promise<void> {
  if (!AsyncStorage) return;
  try {
    if (keyPattern) {
      // Clear specific pattern
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter((k: string) => k.includes(keyPattern));
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } else {
      // Clear all cache
      await AsyncStorage.clear();
    }
  } catch (err) {
    console.error('Error clearing cache:', err);
  }
}
