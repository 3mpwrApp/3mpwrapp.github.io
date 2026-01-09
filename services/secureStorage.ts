import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { decryptData, encryptData } from '../utils/encryption';
import { logger } from '../utils/logger';

/**
 * Secure storage service for sensitive data (auth tokens, credentials, etc)
 * Uses platform-native Keychain (iOS) and KeyStore (Android)
 * Fallback to encrypted AsyncStorage if SecureStore is unavailable
 */

interface SecureStorageError {
  code: string;
  message: string;
}

const FALLBACK_STORAGE: Map<string, string> = new Map();
let isSecureStoreAvailable = true;

/**
 * Initialize secure store - check if available on first run
 */
async function initSecureStore(): Promise<void> {
  try {
    // Try to set and get a test value
    const testKey = '__secure_store_test__';
    await SecureStore.setItemAsync(testKey, 'test');
    await SecureStore.getItemAsync(testKey);
    await SecureStore.deleteItemAsync(testKey);
    isSecureStoreAvailable = true;
  } catch (error) {
    logger.warn(
      '[SecureStorage] SecureStore unavailable, falling back to encrypted AsyncStorage:',
      error
    );
    isSecureStoreAvailable = false;
  }
}

/**
 * Save auth token to SecureStore
 * Uses platform-native encryption (Keychain on iOS, KeyStore on Android)
 */
export async function saveAuthToken(token: string): Promise<void> {
  const key = 'auth_token_v1';
  try {
    if (!isSecureStoreAvailable) {
      // Initialize on demand
      await initSecureStore();
    }

    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(key, token);
      logger.debug('[SecureStorage] Auth token saved to SecureStore');
    } else {
      // Fallback to encrypted AsyncStorage
      const encrypted = encryptData(token, key);
      await AsyncStorage.setItem(`encrypted_${key}`, encrypted);
      logger.warn('[SecureStorage] Auth token saved to encrypted AsyncStorage (fallback)');
    }
  } catch (error) {
    const err = error as SecureStorageError;
    logger.error('[SecureStorage] Failed to save auth token:', err);
    throw new Error(`Failed to save auth token: ${err.message}`);
  }
}

/**
 * Retrieve auth token from SecureStore
 */
export async function getAuthToken(): Promise<string | null> {
  const key = 'auth_token_v1';
  try {
    if (isSecureStoreAvailable) {
      const token = await SecureStore.getItemAsync(key);
      if (token) {
        logger.debug('[SecureStorage] Auth token retrieved from SecureStore');
      }
      return token || null;
    } else {
      // Fallback to encrypted AsyncStorage
      const encrypted = await AsyncStorage.getItem(`encrypted_${key}`);
      if (!encrypted) return null;
      
      try {
        const decrypted = decryptData(encrypted, key);
        return decrypted;
      } catch (error) {
        logger.warn('[SecureStorage] Failed to decrypt auth token, clearing corrupted data', error);
        await clearAuthToken();
        return null;
      }
    }
  } catch (error) {
    const err = error as SecureStorageError;
    logger.error('[SecureStorage] Failed to retrieve auth token:', err);
    // Return null on error rather than throwing - allow app to continue
    return null;
  }
}

/**
 * Clear auth token from SecureStore
 */
export async function clearAuthToken(): Promise<void> {
  const key = 'auth_token_v1';
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(key);
      logger.debug('[SecureStorage] Auth token cleared from SecureStore');
    } else {
      await AsyncStorage.removeItem(`encrypted_${key}`);
      logger.debug('[SecureStorage] Auth token cleared from encrypted AsyncStorage');
    }
  } catch (error) {
    const err = error as SecureStorageError;
    logger.error('[SecureStorage] Failed to clear auth token:', err);
    throw new Error(`Failed to clear auth token: ${err.message}`);
  }
}

/**
 * Save encrypted user credential
 */
export async function saveCredential(
  key: string,
  value: string
): Promise<void> {
  const fullKey = `credential_${key}_v1`;
  try {
    if (!isSecureStoreAvailable) {
      await initSecureStore();
    }

    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(fullKey, value);
      logger.debug(`[SecureStorage] Credential "${key}" saved to SecureStore`);
    } else {
      const encrypted = encryptData(value, fullKey);
      await AsyncStorage.setItem(`encrypted_${fullKey}`, encrypted);
      logger.warn(`[SecureStorage] Credential "${key}" saved to encrypted AsyncStorage (fallback)`);
    }
  } catch (error) {
    const err = error as SecureStorageError;
    logger.error(`[SecureStorage] Failed to save credential "${key}":`, err);
    throw new Error(`Failed to save credential: ${err.message}`);
  }
}

/**
 * Retrieve encrypted credential
 */
export async function getCredential(key: string): Promise<string | null> {
  const fullKey = `credential_${key}_v1`;
  try {
    if (isSecureStoreAvailable) {
      const value = await SecureStore.getItemAsync(fullKey);
      return value || null;
    } else {
      const encrypted = await AsyncStorage.getItem(`encrypted_${fullKey}`);
      if (!encrypted) return null;
      
      try {
        return decryptData(encrypted, fullKey);
      } catch (error) {
        logger.warn(`[SecureStorage] Failed to decrypt credential "${key}", clearing corrupted data`, error);
        await clearCredential(key);
        return null;
      }
    }
  } catch (error) {
    const err = error as SecureStorageError;
    logger.error(`[SecureStorage] Failed to retrieve credential "${key}":`, err);
    return null;
  }
}

/**
 * Clear specific credential
 */
export async function clearCredential(key: string): Promise<void> {
  const fullKey = `credential_${key}_v1`;
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(fullKey);
      logger.debug(`[SecureStorage] Credential "${key}" cleared from SecureStore`);
    } else {
      await AsyncStorage.removeItem(`encrypted_${fullKey}`);
      logger.debug(`[SecureStorage] Credential "${key}" cleared from encrypted AsyncStorage`);
    }
  } catch (error) {
    const err = error as SecureStorageError;
    logger.error(`[SecureStorage] Failed to clear credential "${key}":`, err);
    throw new Error(`Failed to clear credential: ${err.message}`);
  }
}

/**
 * Clear all credentials (user logout)
 */
export async function clearAllCredentials(): Promise<void> {
  try {
    const keysToDelete = Array.from(FALLBACK_STORAGE.keys());

    // Clear all fallback storage
    FALLBACK_STORAGE.clear();

    // Clear all AsyncStorage and SecureStore items that match our patterns
    const patterns = ['auth_token_', 'credential_', 'encrypted_'];
    for (const key of keysToDelete) {
      if (patterns.some((p) => key.includes(p))) {
        try {
          if (isSecureStoreAvailable) {
            await SecureStore.deleteItemAsync(key);
          }
          await AsyncStorage.removeItem(key);
        } catch (e) {
          // Continue on individual delete failures
        }
      }
    }

    // Also clear all matching keys from AsyncStorage
    const allAsyncKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allAsyncKeys.filter(k => patterns.some(p => k.includes(p)));
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }

    logger.debug('[SecureStorage] All credentials cleared');
  } catch (error) {
    const err = error as SecureStorageError;
    logger.error('[SecureStorage] Failed to clear all credentials:', err);
    throw new Error(`Failed to clear all credentials: ${err.message}`);
  }
}

/**
 * Check if SecureStore is available on this device
 */
export function isSecureStoreSupported(): boolean {
  return isSecureStoreAvailable;
}

/**
 * Initialize SecureStore on app startup
 */
export async function initializeSecureStorage(): Promise<void> {
  try {
    await initSecureStore();
    logger.debug(
      `[SecureStorage] Initialized - SecureStore available: ${isSecureStoreAvailable}`
    );
  } catch (error) {
    logger.error('[SecureStorage] Initialization failed:', error);
  }
}

/**
 * Saves encrypted user data to AsyncStorage
 */
export async function saveUserData(key: string, value: unknown): Promise<void> {
  try {
    if (value === null || value === undefined) {
      await AsyncStorage.removeItem(`userdata_${key}`);
      return;
    }

    const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
    const encrypted = encryptData(jsonString, key);
    await AsyncStorage.setItem(`userdata_${key}`, encrypted);
    logger.debug(`[SecureStorage] User data saved (${key})`);
  } catch (error) {
    const err = error as SecureStorageError;
    logger.error(`[SecureStorage] Failed to save user data (${key}):`, err);
    throw new Error(`Failed to save user data: ${err.message}`);
  }
}

/**
 * Retrieves and decrypts user data from AsyncStorage
 */
export async function getUserData<T = unknown>(key: string): Promise<T | null> {
  try {
    const encrypted = await AsyncStorage.getItem(`userdata_${key}`);
    if (!encrypted) return null;

    try {
      const decrypted = decryptData(encrypted, key);
      
      // Try to parse as JSON if it looks like JSON
      if (decrypted.startsWith('{') || decrypted.startsWith('[')) {
        try {
          return JSON.parse(decrypted) as T;
        } catch {
          // Not valid JSON, return as string
          return decrypted as T;
        }
      }
      
      return decrypted as T;
    } catch (error) {
      logger.warn(`[SecureStorage] Failed to decrypt user data (${key}), clearing corrupted data`, error);
      await AsyncStorage.removeItem(`userdata_${key}`);
      return null;
    }
  } catch (error) {
    const err = error as SecureStorageError;
    logger.error(`[SecureStorage] Failed to retrieve user data (${key}):`, err);
    return null;
  }
}
