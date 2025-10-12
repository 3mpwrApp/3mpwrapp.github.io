/**
 * Enhanced Encryption - AES-256 with secure key management and platform keystore integration
 * Implements: device keystore/keychain, secure key generation, encrypted storage
 */


// Lazy imports for optional dependencies
let SecureStore: any;
let AsyncStorage: any;
let Crypto: any;
let CryptoJS: any;

try {
  SecureStore = require('expo-secure-store');
} catch {}

try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

try {
  Crypto = require('expo-crypto');
} catch {}

try {
  CryptoJS = require('crypto-js');
} catch {}

export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'AES-256-CBC';
  keyDerivation: 'PBKDF2' | 'scrypt' | 'Argon2id';
  iterations: number;
  saltLength: number;
  ivLength: number;
  tagLength: number;
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  tag?: string; // For GCM mode
  algorithm: string;
  keyDerivation: string;
  iterations: number;
}

export interface KeyInfo {
  id: string;
  created: number;
  algorithm: string;
  purpose: 'encryption' | 'signing' | 'mixed';
  hardware: boolean;
}

const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  iterations: 100000,
  saltLength: 32,
  ivLength: 12, // 96 bits for GCM
  tagLength: 16  // 128 bits for GCM
};

const MASTER_KEY_ID = 'empowr:master:key:v2';
const _KEY_REGISTRY_ID = 'secure_key_registry_v1';

/**
 * Enhanced encryption service with secure key management
 */
export class SecureEncryption {
  private config: EncryptionConfig;
  private masterKeyId: string;
  public initialized: boolean = false;

  constructor(config?: Partial<EncryptionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.masterKeyId = MASTER_KEY_ID;
  }

  /**
   * Initialize encryption service
   */
  async initialize(): Promise<boolean> {
    try {
      // Ensure master key exists
      await this.ensureMasterKey();
      
      // Verify encryption capabilities
      if (!CryptoJS) {
        throw new Error('CryptoJS not available - required for encryption');
      }

      this.initialized = true;
      return true;

    } catch (error) {
      console.error('Encryption initialization failed:', error);
      return false;
    }
  }

  /**
   * Generate and securely store master encryption key
   */
  private async ensureMasterKey(): Promise<string> {
    try {
      // Try to get existing master key
      let masterKey = await this.getStoredKey(this.masterKeyId);
      
      if (!masterKey) {
        // Generate new master key
        masterKey = await this.generateSecureKey();
        
        // Store in most secure location available
        await this.storeKeySecurely(this.masterKeyId, masterKey);
        
        // Log key generation (without the key itself)
        console.warn('New master encryption key generated');
      }

      return masterKey;

    } catch (error) {
      console.error('Master key management failed:', error);
      throw error;
    }
  }

  /**
   * Generate cryptographically secure random key
   */
  private async generateSecureKey(): Promise<string> {
    try {
      if (Crypto?.getRandomBytesAsync) {
        // Use expo-crypto for secure random generation
        const randomBytes = await Crypto.getRandomBytesAsync(32); // 256 bits
        return Array.from(randomBytes as Uint8Array)
          .map((b: number) => b.toString(16).padStart(2, '0'))
          .join('');
      } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        // Use Web Crypto API
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        return Array.from(randomBytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      } else {
        // Fallback to crypto-js (less secure)
        return CryptoJS.lib.WordArray.random(32).toString();
      }
    } catch (error) {
      console.error('Secure key generation failed, using fallback:', error);
      // Last resort: crypto-js random
      return CryptoJS.lib.WordArray.random(32).toString();
    }
  }

  /**
   * Store key in most secure storage available
   */
  private async storeKeySecurely(keyId: string, key: string): Promise<void> {
    try {
      if (SecureStore?.setItemAsync) {
        // Use Expo SecureStore with maximum security
        await SecureStore.setItemAsync(keyId, key, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          requireAuthentication: false // Set to true for biometric protection
        });
      } else if (AsyncStorage?.setItem) {
        // Fallback to AsyncStorage (less secure)
        console.warn('Using AsyncStorage for key storage - consider enabling SecureStore');
        await AsyncStorage.setItem(keyId, key);
      } else {
        throw new Error('No secure storage available');
      }
    } catch (error) {
      console.error('Key storage failed:', error);
      throw error;
    }
  }

  /**
   * Retrieve stored key
   */
  private async getStoredKey(keyId: string): Promise<string | null> {
    try {
      if (SecureStore?.getItemAsync) {
        return await SecureStore.getItemAsync(keyId);
      } else if (AsyncStorage?.getItem) {
        return await AsyncStorage.getItem(keyId);
      }
      return null;
    } catch (error) {
      console.error('Key retrieval failed:', error);
      return null;
    }
  }

  /**
   * Encrypt data with AES-256-GCM
   */
  async encrypt(plaintext: string, password?: string): Promise<EncryptedData> {
    if (!this.initialized) {
      throw new Error('Encryption service not initialized');
    }

    try {
      // Use provided password or master key
      const key = password || await this.getStoredKey(this.masterKeyId);
      if (!key) {
        throw new Error('No encryption key available');
      }

      // Generate random salt and IV
      const salt = CryptoJS.lib.WordArray.random(this.config.saltLength);
      const iv = CryptoJS.lib.WordArray.random(this.config.ivLength);

      // Derive key using PBKDF2
      const derivedKey = CryptoJS.PBKDF2(key, salt, {
        keySize: 256 / 32, // 256 bits
        iterations: this.config.iterations,
        hasher: CryptoJS.algo.SHA256
      });

      // Encrypt with AES-256-GCM (simulated with CBC + HMAC for crypto-js compatibility)
      let ciphertext: any;
      let tag: string | undefined;

      if (this.config.algorithm === 'AES-256-GCM') {
        // Note: crypto-js doesn't support GCM mode natively
        // This is a simplified implementation - in production, use a proper GCM library
        ciphertext = CryptoJS.AES.encrypt(plaintext, derivedKey, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
        
        // Generate authentication tag (simplified)
        const hmac = CryptoJS.HmacSHA256(ciphertext.toString(), derivedKey);
        tag = hmac.toString().substring(0, this.config.tagLength * 2);
      } else {
        // AES-256-CBC
        ciphertext = CryptoJS.AES.encrypt(plaintext, derivedKey, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
      }

      return {
        ciphertext: ciphertext.toString(),
        iv: iv.toString(),
        salt: salt.toString(),
        tag,
        algorithm: this.config.algorithm,
        keyDerivation: this.config.keyDerivation,
        iterations: this.config.iterations
      };

    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  /**
   * Decrypt data
   */
  async decrypt(encryptedData: EncryptedData, password?: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('Encryption service not initialized');
    }

    try {
      // Use provided password or master key
      const key = password || await this.getStoredKey(this.masterKeyId);
      if (!key) {
        throw new Error('No decryption key available');
      }

      // Derive key using same parameters
      const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
      
      const derivedKey = CryptoJS.PBKDF2(key, salt, {
        keySize: 256 / 32,
        iterations: encryptedData.iterations,
        hasher: CryptoJS.algo.SHA256
      });

      // Verify authentication tag if present
      if (encryptedData.tag && encryptedData.algorithm === 'AES-256-GCM') {
        const hmac = CryptoJS.HmacSHA256(encryptedData.ciphertext, derivedKey);
        const computedTag = hmac.toString().substring(0, this.config.tagLength * 2);
        
        if (computedTag !== encryptedData.tag) {
          throw new Error('Authentication tag verification failed');
        }
      }

      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(encryptedData.ciphertext, derivedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return decrypted.toString(CryptoJS.enc.Utf8);

    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  /**
   * Encrypt file data
   */
  async encryptFile(fileData: ArrayBuffer, password?: string): Promise<EncryptedData> {
    // Convert ArrayBuffer to base64 string
    const uint8Array = new Uint8Array(fileData);
    const base64String = btoa(String.fromCharCode(...uint8Array));
    
    return await this.encrypt(base64String, password);
  }

  /**
   * Decrypt file data
   */
  async decryptFile(encryptedData: EncryptedData, password?: string): Promise<ArrayBuffer> {
    const base64String = await this.decrypt(encryptedData, password);
    
    // Convert base64 string back to ArrayBuffer
    const binaryString = atob(base64String);
    const uint8Array = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    return uint8Array.buffer;
  }

  /**
   * Rotate master key
   */
  async rotateMasterKey(): Promise<boolean> {
    try {
      // Generate new master key
      const newKey = await this.generateSecureKey();
      
      // Store new key
      await this.storeKeySecurely(this.masterKeyId, newKey);
      
      console.warn('Master key rotated successfully');
      return true;

    } catch (error) {
      console.error('Key rotation failed:', error);
      return false;
    }
  }

  /**
   * Secure key deletion
   */
  async deleteKey(keyId: string): Promise<boolean> {
    try {
      if (SecureStore?.deleteItemAsync) {
        await SecureStore.deleteItemAsync(keyId);
      } else if (AsyncStorage?.removeItem) {
        await AsyncStorage.removeItem(keyId);
      }
      
      return true;

    } catch (error) {
      console.error('Key deletion failed:', error);
      return false;
    }
  }

  /**
   * Get encryption info
   */
  getEncryptionInfo(): { algorithm: string; keyDerivation: string; hardware: boolean } {
    return {
      algorithm: this.config.algorithm,
      keyDerivation: this.config.keyDerivation,
      hardware: !!SecureStore // Using SecureStore indicates hardware backing
    };
  }
}

// Global instance
export const secureEncryption = new SecureEncryption();

// Legacy compatibility functions
export async function encryptString(plaintext: string, password?: string): Promise<string> {
  if (!secureEncryption.initialized) {
    await secureEncryption.initialize();
  }
  
  const encrypted = await secureEncryption.encrypt(plaintext, password);
  return JSON.stringify(encrypted);
}

export async function decryptString(ciphertext: string, password?: string): Promise<string> {
  if (!secureEncryption.initialized) {
    await secureEncryption.initialize();
  }
  
  const encryptedData = JSON.parse(ciphertext) as EncryptedData;
  return await secureEncryption.decrypt(encryptedData, password);
}

// Initialize encryption on import
secureEncryption.initialize().catch(console.error);