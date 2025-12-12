/**
 * Memory Protection Service
 * 
 * Protects sensitive data in memory from:
 * - Memory dumping attacks
 * - Debugging inspection
 * - Cold boot attacks
 * - Memory scanning malware
 * 
 * Features:
 * - Sensitive data obfuscation
 * - Automatic memory cleanup
 * - Secure string handling
 * - Memory scrambling
 */

import { AppState, type AppStateStatus } from 'react-native';

import { logError } from '../../utils/errorLogger';

// ============================================
// TYPES
// ============================================

interface SensitiveData {
  id: string;
  data: Uint8Array;
  mask: Uint8Array;
  createdAt: number;
  accessCount: number;
  maxAge: number;
  destroyed: boolean;
}

interface MemoryProtectionConfig {
  enabled: boolean;
  maxDataAge: number;          // Auto-destroy after this many ms
  wipeOnBackground: boolean;   // Wipe when app goes to background
  scrambleInterval: number;    // Re-scramble data periodically
  maxStoredItems: number;      // Limit stored items
}

// ============================================
// STATE
// ============================================

const sensitiveDataStore: Map<string, SensitiveData> = new Map();
let scrambleInterval: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: { remove: () => void } | null = null;

const config: MemoryProtectionConfig = {
  enabled: true,
  maxDataAge: 5 * 60 * 1000,     // 5 minutes
  wipeOnBackground: true,
  scrambleInterval: 30 * 1000,   // 30 seconds
  maxStoredItems: 50,
};

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Generate random mask for XOR scrambling
 */
function generateMask(length: number): Uint8Array {
  const mask = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(mask);
  } else {
    for (let i = 0; i < length; i++) {
      mask[i] = Math.floor(Math.random() * 256);
    }
  }
  return mask;
}

/**
 * XOR data with mask
 */
function xorData(data: Uint8Array, mask: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ mask[i % mask.length];
  }
  return result;
}

/**
 * Convert string to Uint8Array
 */
function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Convert Uint8Array to string
 */
function bytesToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

/**
 * Securely overwrite memory
 */
function secureWipe(data: Uint8Array): void {
  // Multiple passes to ensure data is truly overwritten
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < data.length; i++) {
      data[i] = pass === 0 ? 0x00 : pass === 1 ? 0xFF : Math.floor(Math.random() * 256);
    }
  }
  // Final zero pass
  data.fill(0);
}

// ============================================
// SECURE STRING CLASS
// ============================================

/**
 * SecureString - A string that's protected in memory
 * The actual value is XOR-scrambled and can be retrieved only when needed
 */
export class SecureString {
  private id: string;
  private destroyed: boolean = false;

  constructor(value: string, options?: { maxAge?: number }) {
    this.id = `ss_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    const bytes = stringToBytes(value);
    const mask = generateMask(bytes.length);
    const scrambled = xorData(bytes, mask);

    // Clear original bytes
    secureWipe(bytes);

    sensitiveDataStore.set(this.id, {
      id: this.id,
      data: scrambled,
      mask,
      createdAt: Date.now(),
      accessCount: 0,
      maxAge: options?.maxAge ?? config.maxDataAge,
      destroyed: false,
    });

    // Enforce max items
    if (sensitiveDataStore.size > config.maxStoredItems) {
      pruneOldestItems();
    }
  }

  /**
   * Get the original value (use sparingly!)
   */
  getValue(): string {
    if (this.destroyed) {
      throw new Error('SecureString has been destroyed');
    }

    const entry = sensitiveDataStore.get(this.id);
    if (!entry || entry.destroyed) {
      throw new Error('SecureString data not found or destroyed');
    }

    // Check age
    if (Date.now() - entry.createdAt > entry.maxAge) {
      this.destroy();
      throw new Error('SecureString has expired');
    }

    entry.accessCount++;

    // Unscramble
    const unscrambled = xorData(entry.data, entry.mask);
    const value = bytesToString(unscrambled);

    // Immediately wipe unscrambled data
    secureWipe(unscrambled);

    return value;
  }

  /**
   * Safely use the value in a callback
   */
  use<T>(callback: (value: string) => T): T {
    const value = this.getValue();
    try {
      return callback(value);
    } finally {
      // Value goes out of scope and can be GC'd
    }
  }

  /**
   * Destroy this secure string
   */
  destroy(): void {
    if (this.destroyed) return;

    const entry = sensitiveDataStore.get(this.id);
    if (entry) {
      secureWipe(entry.data);
      secureWipe(entry.mask);
      entry.destroyed = true;
      sensitiveDataStore.delete(this.id);
    }

    this.destroyed = true;
  }

  /**
   * Check if still valid
   */
  isValid(): boolean {
    if (this.destroyed) return false;
    
    const entry = sensitiveDataStore.get(this.id);
    if (!entry || entry.destroyed) return false;
    
    return Date.now() - entry.createdAt <= entry.maxAge;
  }

  /**
   * Get remaining time before expiry
   */
  getRemainingTime(): number {
    if (this.destroyed) return 0;
    
    const entry = sensitiveDataStore.get(this.id);
    if (!entry) return 0;
    
    return Math.max(0, entry.maxAge - (Date.now() - entry.createdAt));
  }
}

// ============================================
// MEMORY PROTECTION FUNCTIONS
// ============================================

/**
 * Store sensitive bytes in protected memory
 */
export function protectBytes(
  id: string,
  data: Uint8Array,
  options?: { maxAge?: number }
): void {
  // Wipe existing if present
  if (sensitiveDataStore.has(id)) {
    wipeProtectedData(id);
  }

  const mask = generateMask(data.length);
  const scrambled = xorData(data, mask);

  sensitiveDataStore.set(id, {
    id,
    data: scrambled,
    mask,
    createdAt: Date.now(),
    accessCount: 0,
    maxAge: options?.maxAge ?? config.maxDataAge,
    destroyed: false,
  });

  // Clear original
  secureWipe(data);
}

/**
 * Retrieve protected bytes
 */
export function retrieveProtectedBytes(id: string): Uint8Array | null {
  const entry = sensitiveDataStore.get(id);
  if (!entry || entry.destroyed) return null;

  // Check age
  if (Date.now() - entry.createdAt > entry.maxAge) {
    wipeProtectedData(id);
    return null;
  }

  entry.accessCount++;
  return xorData(entry.data, entry.mask);
}

/**
 * Wipe protected data
 */
export function wipeProtectedData(id: string): void {
  const entry = sensitiveDataStore.get(id);
  if (entry) {
    secureWipe(entry.data);
    secureWipe(entry.mask);
    entry.destroyed = true;
    sensitiveDataStore.delete(id);
  }
}

/**
 * Wipe all protected data
 */
export function wipeAllProtectedData(): void {
  for (const [_id, entry] of sensitiveDataStore) {
    secureWipe(entry.data);
    secureWipe(entry.mask);
    entry.destroyed = true;
  }
  sensitiveDataStore.clear();
}

// ============================================
// SCRAMBLING
// ============================================

/**
 * Re-scramble all protected data with new masks
 * This defeats memory scanning attacks
 */
export function rescrambleAllData(): void {
  for (const [_id, entry] of sensitiveDataStore) {
    if (entry.destroyed) continue;

    // Unscramble with old mask
    const original = xorData(entry.data, entry.mask);

    // Generate new mask
    const newMask = generateMask(original.length);
    const newScrambled = xorData(original, newMask);

    // Wipe old data
    secureWipe(entry.data);
    secureWipe(entry.mask);
    secureWipe(original);

    // Update with new scrambled data
    entry.data = newScrambled;
    entry.mask = newMask;
  }
}

/**
 * Prune expired entries
 */
function pruneExpiredData(): void {
  const now = Date.now();
  for (const [id, entry] of sensitiveDataStore) {
    if (now - entry.createdAt > entry.maxAge) {
      wipeProtectedData(id);
    }
  }
}

/**
 * Prune oldest items when at capacity
 */
function pruneOldestItems(): void {
  const entries = Array.from(sensitiveDataStore.values())
    .sort((a, b) => a.createdAt - b.createdAt);

  // Remove oldest 20%
  const toRemove = Math.ceil(entries.length * 0.2);
  for (let i = 0; i < toRemove; i++) {
    wipeProtectedData(entries[i].id);
  }
}

// ============================================
// LIFECYCLE MANAGEMENT
// ============================================

/**
 * Handle app state changes
 */
function handleAppStateChange(state: AppStateStatus): void {
  if (state === 'background' && config.wipeOnBackground) {
    // Wipe all sensitive data when app goes to background
    wipeAllProtectedData();
  }
}

/**
 * Start memory protection monitoring
 */
export function startMemoryProtection(
  customConfig?: Partial<MemoryProtectionConfig>
): void {
  if (customConfig) {
    Object.assign(config, customConfig);
  }

  if (!config.enabled) return;

  // Set up periodic scrambling
  if (config.scrambleInterval > 0 && !scrambleInterval) {
    scrambleInterval = setInterval(() => {
      rescrambleAllData();
      pruneExpiredData();
    }, config.scrambleInterval);
  }

  // Set up app state monitoring
  if (config.wipeOnBackground && !appStateSubscription) {
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  }
}

/**
 * Stop memory protection monitoring
 */
export function stopMemoryProtection(): void {
  if (scrambleInterval) {
    clearInterval(scrambleInterval);
    scrambleInterval = null;
  }

  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}

// ============================================
// UTILITIES
// ============================================

/**
 * Create a secure string from a regular string
 */
export function createSecureString(value: string, maxAge?: number): SecureString {
  return new SecureString(value, maxAge ? { maxAge } : undefined);
}

/**
 * Compare two secure strings without exposing them
 */
export function secureCompare(a: SecureString, b: SecureString): boolean {
  try {
    const aEntry = sensitiveDataStore.get((a as any).id);
    const bEntry = sensitiveDataStore.get((b as any).id);

    if (!aEntry || !bEntry || aEntry.destroyed || bEntry.destroyed) {
      return false;
    }

    // Unscramble both
    const aData = xorData(aEntry.data, aEntry.mask);
    const bData = xorData(bEntry.data, bEntry.mask);

    // Constant-time comparison
    if (aData.length !== bData.length) {
      secureWipe(aData);
      secureWipe(bData);
      return false;
    }

    let result = 0;
    for (let i = 0; i < aData.length; i++) {
      result |= aData[i] ^ bData[i];
    }

    secureWipe(aData);
    secureWipe(bData);

    return result === 0;
  } catch (error) {
    logError('memoryProtection', 'Secure compare failed', error);
    return false;
  }
}

/**
 * Get memory protection statistics
 */
export function getMemoryProtectionStats(): {
  itemCount: number;
  oldestItemAge: number;
  totalBytes: number;
} {
  let oldestAge = 0;
  let totalBytes = 0;
  const now = Date.now();

  for (const entry of sensitiveDataStore.values()) {
    if (!entry.destroyed) {
      const age = now - entry.createdAt;
      if (age > oldestAge) oldestAge = age;
      totalBytes += entry.data.length + entry.mask.length;
    }
  }

  return {
    itemCount: sensitiveDataStore.size,
    oldestItemAge: oldestAge,
    totalBytes,
  };
}

// ============================================
// EXPORTS
// ============================================

export default {
  SecureString,
  createSecureString,
  protectBytes,
  retrieveProtectedBytes,
  wipeProtectedData,
  wipeAllProtectedData,
  rescrambleAllData,
  startMemoryProtection,
  stopMemoryProtection,
  secureCompare,
  getMemoryProtectionStats,
};
