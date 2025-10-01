// Evidence encryption helpers: device key management + JSON encrypt/decrypt
// Notes
// - We lazy-require optional native modules to avoid breaking Jest/web
// - CryptoJS is required at runtime only when used; callers should install it in app builds

let SecureStore: any;
let AsyncStorage: any;
try {
  // Lazy init; these may be undefined in test or web environments
  SecureStore = require('expo-secure-store');
  
} catch {}
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
  
} catch {}

const DEVICE_KEY = 'evidence:deviceKey:v1';
export const ENCRYPTED_NOTES_KEY = 'evidence:notes.enc:v1';
const LEGACY_NOTES_KEY = 'evidence:notes:v1';

// Generate a random key string; prefer crypto, fallback to Math.random
async function generateKeyString(): Promise<string> {
  try {
    const Crypto = require('expo-crypto');
    
    const b = await Crypto.getRandomBytesAsync(32);
    // Convert to hex to avoid Buffer dependency
    return Array.from(b as number[])
      .map((x) => Number(x).toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return Array.from({ length: 44 })
      .map(() => Math.floor(Math.random() * 64))
      .map((n) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[n])
      .join('');
  }
}

export async function getOrCreateDeviceKey(): Promise<string> {
  try {
    const existing = (await SecureStore?.getItemAsync?.(DEVICE_KEY)) || (await AsyncStorage?.getItem?.(DEVICE_KEY));
    if (existing) return existing;
    const k = await generateKeyString();
    // Prefer SecureStore; fall back to AsyncStorage if unavailable
    if (SecureStore?.setItemAsync) await SecureStore.setItemAsync(DEVICE_KEY, k, { keychainAccessible: SecureStore?.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    else await AsyncStorage?.setItem?.(DEVICE_KEY, k);
    return k;
  } catch {
    // Last resort: ephemeral key (not persisted) — caller should handle failures gracefully
    return generateKeyString();
  }
}

function getCryptoJS(): any | null {
  try {
    return require('crypto-js');
    
  } catch {
    return null;
  }
}

export async function encryptString(plaintext: string, passOrKey?: string): Promise<string> {
  const CryptoJS = getCryptoJS();
  if (!CryptoJS) throw new Error('Crypto unavailable');
  const secret = passOrKey || (await getOrCreateDeviceKey());
  // Using passphrase mode provides built-in salt/IV handling
  return CryptoJS.AES.encrypt(plaintext, secret).toString();
}

export async function decryptString(ciphertext: string, passOrKey?: string): Promise<string> {
  const CryptoJS = getCryptoJS();
  if (!CryptoJS) throw new Error('Crypto unavailable');
  const secret = passOrKey || (await getOrCreateDeviceKey());
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export type EvidenceLocalNote = { id: string; text: string; date: string; tags?: string[]; files?: { name: string; uri: string }[] };

export async function loadEncryptedNotes(): Promise<EvidenceLocalNote[]> {
  try {
    const blob = (await AsyncStorage?.getItem?.(ENCRYPTED_NOTES_KEY)) || '';
    if (!blob) return [];
    const json = await decryptString(blob);
    if (!json) return [];
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) return arr as EvidenceLocalNote[];
    return [];
  } catch {
    return [];
  }
}

export async function saveEncryptedNotes(notes: EvidenceLocalNote[]): Promise<void> {
  try {
    const json = JSON.stringify(notes);
    const enc = await encryptString(json);
    await AsyncStorage?.setItem?.(ENCRYPTED_NOTES_KEY, enc);
  } catch {
    // ignore
  }
}

export async function migrateLegacyNotes(): Promise<void> {
  try {
    const raw = (await AsyncStorage?.getItem?.(LEGACY_NOTES_KEY)) || '';
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) await saveEncryptedNotes(arr);
    await AsyncStorage?.removeItem?.(LEGACY_NOTES_KEY);
  } catch {
    // ignore
  }
}

export async function rotateDeviceKeyAndReencrypt(): Promise<boolean> {
  try {
    const blob = (await AsyncStorage?.getItem?.(ENCRYPTED_NOTES_KEY)) || '';
    let notes: EvidenceLocalNote[] = [];
    if (blob) {
      try {
        const json = await decryptString(blob);
        notes = json ? (JSON.parse(json) as EvidenceLocalNote[]) : [];
      } catch {
        notes = [];
      }
    }
    // Generate and store a new key
    const newKey = await generateKeyString();
    if (SecureStore?.setItemAsync) await SecureStore.setItemAsync(DEVICE_KEY, newKey, { keychainAccessible: SecureStore?.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    else await AsyncStorage?.setItem?.(DEVICE_KEY, newKey);
    // Re-encrypt with new key
    const CryptoJS = getCryptoJS();
    if (!CryptoJS) throw new Error('Crypto unavailable');
    const enc = CryptoJS.AES.encrypt(JSON.stringify(notes), newKey).toString();
    await AsyncStorage?.setItem?.(ENCRYPTED_NOTES_KEY, enc);
    return true;
  } catch {
    return false;
  }
}

// Export/import helpers using a user-provided passphrase
export async function exportNotesEncrypted(notes: EvidenceLocalNote[], passphrase: string): Promise<string> {
  const CryptoJS = getCryptoJS();
  if (!CryptoJS) throw new Error('Crypto unavailable');
  const payload = JSON.stringify({ v: 1, ts: Date.now(), notes });
  const c = CryptoJS.AES.encrypt(payload, passphrase).toString();
  // Write to a cache file
  try {
    const FS = require('expo-file-system');
    
    const path = FS.cacheDirectory + `evidence_export_${Date.now()}.empowr.enc`;
    await FS.writeAsStringAsync(path, c);
    return path;
  } catch {
    throw new Error('Export write failed');
  }
}

export async function importNotesEncrypted(filePath: string, passphrase: string): Promise<EvidenceLocalNote[]> {
  try {
    const FS = require('expo-file-system');
    
    const c = await FS.readAsStringAsync(filePath);
    const json = await decryptString(c, passphrase);
    const parsed = JSON.parse(json);
    if (parsed && parsed.notes && Array.isArray(parsed.notes)) return parsed.notes as EvidenceLocalNote[];
    return [];
  } catch {
    throw new Error('Import failed');
  }
}
