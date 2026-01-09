// @ts-ignore: crypto-js is not typed, using any for compatibility
import * as CryptoJS from 'crypto-js';

const CryptoJSAny = CryptoJS as any;

/**
 * Encryption utility for sensitive non-token data.
 * Uses AES encryption with crypto-js.
 * Tokens should use SecureStore instead.
 */

const ENCRYPTION_KEY = 'empowr-encryption-key-v1';

/**
 * Generate a secure salt for additional key derivation
 */
export function generateSalt(): string {
  return CryptoJSAny.lib.WordArray.random(128 / 8).toString();
}

/**
 * Simple encryption for user data (returns compact format)
 * Uses AES encryption with derived key
 */
export function encryptData(data: string, customKey?: string): string {
  try {
    const key = customKey || ENCRYPTION_KEY;
    const salt = generateSalt();
    const iv = CryptoJSAny.lib.WordArray.random(128 / 8).toString();

    // Derive key from password + salt
    const derivedKey = CryptoJSAny.PBKDF2(key, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    });

    // Encrypt with IV
    const ciphertext = CryptoJSAny.AES.encrypt(data, derivedKey, {
      iv: CryptoJSAny.enc.Hex.parse(iv),
      mode: CryptoJSAny.mode.CBC,
      padding: CryptoJSAny.pad.Pkcs7,
    }).toString();

    // Return compact format: salt$iv$ciphertext
    return `${salt}$${iv}$${ciphertext}`;
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Simple decryption for user data (parses compact format)
 * Reverses encryptData() operation
 */
export function decryptData(encryptedData: string, customKey?: string): string {
  try {
    const key = customKey || ENCRYPTION_KEY;
    const parts = encryptedData.split('$');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [salt, iv, ciphertext] = parts;

    // Derive key using same salt
    const derivedKey = CryptoJSAny.PBKDF2(key, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    });

    // Decrypt
    const decrypted = CryptoJSAny.AES.decrypt(ciphertext, derivedKey, {
      iv: CryptoJSAny.enc.Hex.parse(iv),
      mode: CryptoJSAny.mode.CBC,
      padding: CryptoJSAny.pad.Pkcs7,
    });

    const plaintext = decrypted.toString(CryptoJSAny.enc.Utf8);
    if (!plaintext) {
      throw new Error('Decryption resulted in empty string - likely wrong key');
    }
    return plaintext;
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
/**
 * Encrypt data using AES with IV for additional security
 * Returns object with separate salt, iv, and ciphertext
 */
export function encrypt(data: string, customKey?: string): {
  ciphertext: string;
  salt: string;
  iv: string;
} {
  try {
    const key = customKey || ENCRYPTION_KEY;
    const salt = generateSalt();
    const iv = CryptoJSAny.lib.WordArray.random(128 / 8).toString();

    // Derive key from password + salt
    const derivedKey = CryptoJSAny.PBKDF2(key, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    });

    // Encrypt with IV
    const ciphertext = CryptoJSAny.AES.encrypt(data, derivedKey, {
      iv: CryptoJSAny.enc.Hex.parse(iv),
      mode: CryptoJSAny.mode.CBC,
      padding: CryptoJSAny.pad.Pkcs7,
    }).toString();

    return {
      ciphertext,
      salt,
      iv,
    };
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Decrypt data that was encrypted with encrypt()
 * Takes object with separate salt, iv, and ciphertext
 */
export function decrypt(
  encryptedData: { ciphertext: string; salt: string; iv: string },
  customKey?: string
): string {
  try {
    const key = customKey || ENCRYPTION_KEY;

    // Derive key using same salt
    const derivedKey = CryptoJSAny.PBKDF2(key, encryptedData.salt, {
      keySize: 256 / 32,
      iterations: 1000,
    });

    // Decrypt
    const decrypted = CryptoJSAny.AES.decrypt(encryptedData.ciphertext, derivedKey, {
      iv: CryptoJSAny.enc.Hex.parse(encryptedData.iv),
      mode: CryptoJSAny.mode.CBC,
      padding: CryptoJSAny.pad.Pkcs7,
    });

    const plaintext = decrypted.toString(CryptoJSAny.enc.Utf8);
    if (!plaintext) {
      throw new Error('Decryption resulted in empty string - likely wrong key');
    }
    return plaintext;
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
/**
 * Encrypt a JSON object
 */
export function encryptJson<T extends Record<string, any>>(
  obj: T,
  customKey?: string
): {
  ciphertext: string;
  salt: string;
  iv: string;
} {
  return encrypt(JSON.stringify(obj), customKey);
}

/**
 * Decrypt and parse JSON
 */
export function decryptJson<T extends Record<string, any>>(
  encryptedData: { ciphertext: string; salt: string; iv: string },
  customKey?: string
): T {
  const plaintext = decrypt(encryptedData, customKey);
  return JSON.parse(plaintext);
}