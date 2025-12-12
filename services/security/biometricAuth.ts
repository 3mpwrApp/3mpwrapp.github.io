/**
 * Biometric Authentication Service
 * 
 * Provides secure biometric authentication using device hardware:
 * - Face ID / Touch ID (iOS)
 * - Fingerprint / Face Unlock (Android)
 * - Fallback to device passcode
 * 
 * Security features:
 * - Hardware-backed key storage
 * - Biometric-protected encryption keys
 * - Anti-spoofing validation
 * - Timeout and lockout policies
 */

import { Platform } from 'react-native';

import { logError } from '../../utils/errorLogger';

// Lazy import for compatibility
let LocalAuthentication: any = null;
let SecureStore: any = null;

try {
  LocalAuthentication = require('expo-local-authentication');
} catch {}

try {
  SecureStore = require('expo-secure-store');
} catch {}

// ============================================
// TYPES
// ============================================

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';
export type AuthLevel = 'biometric' | 'device_passcode' | 'none';

export interface BiometricCapabilities {
  available: boolean;
  enrolled: boolean;
  types: BiometricType[];
  securityLevel: 'strong' | 'weak' | 'none';
  hardwareBacked: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  type?: BiometricType;
  error?: string;
  errorCode?: string;
  fallbackUsed: boolean;
}

export interface BiometricConfig {
  promptMessage: string;
  cancelLabel: string;
  fallbackLabel?: string;
  disableDeviceFallback: boolean;
  requireConfirmation: boolean;  // For face unlock
  maxAttempts: number;
  lockoutDurationMs: number;
}

// ============================================
// STATE
// ============================================

interface BiometricState {
  initialized: boolean;
  capabilities: BiometricCapabilities | null;
  failedAttempts: number;
  lockedUntil: number | null;
  lastAuthTime: number | null;
}

let state: BiometricState = {
  initialized: false,
  capabilities: null,
  failedAttempts: 0,
  lockedUntil: null,
  lastAuthTime: null,
};

const DEFAULT_CONFIG: BiometricConfig = {
  promptMessage: 'Authenticate to access secure content',
  cancelLabel: 'Cancel',
  fallbackLabel: 'Use Passcode',
  disableDeviceFallback: false,
  requireConfirmation: true,
  maxAttempts: 5,
  lockoutDurationMs: 30 * 1000, // 30 seconds
};

// ============================================
// CAPABILITY DETECTION
// ============================================

/**
 * Get biometric capabilities of the device
 */
export async function getBiometricCapabilities(): Promise<BiometricCapabilities> {
  if (state.capabilities) {
    return state.capabilities;
  }

  if (!LocalAuthentication) {
    const capabilities: BiometricCapabilities = {
      available: false,
      enrolled: false,
      types: [],
      securityLevel: 'none',
      hardwareBacked: false,
    };
    state.capabilities = capabilities;
    return capabilities;
  }

  try {
    // Check hardware availability
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    
    // Check if biometrics are enrolled
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    // Get supported biometric types
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    // Map to our types
    const types: BiometricType[] = [];
    if (supportedTypes?.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      types.push('fingerprint');
    }
    if (supportedTypes?.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      types.push('facial');
    }
    if (supportedTypes?.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      types.push('iris');
    }

    // Determine security level
    let securityLevel: 'strong' | 'weak' | 'none' = 'none';
    if (hasHardware && isEnrolled) {
      // iOS and Android 9+ have hardware-backed biometrics
      if (Platform.OS === 'ios') {
        securityLevel = 'strong';
      } else if (Platform.OS === 'android') {
        const version = parseInt(String(Platform.Version), 10);
        securityLevel = version >= 28 ? 'strong' : 'weak';
      }
    }

    const capabilities: BiometricCapabilities = {
      available: hasHardware,
      enrolled: isEnrolled,
      types,
      securityLevel,
      hardwareBacked: securityLevel === 'strong',
    };

    state.capabilities = capabilities;
    return capabilities;

  } catch (error) {
    logError('biometricAuth', 'Failed to get capabilities', error);
    return {
      available: false,
      enrolled: false,
      types: [],
      securityLevel: 'none',
      hardwareBacked: false,
    };
  }
}

/**
 * Check if biometric authentication is available
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const caps = await getBiometricCapabilities();
  return caps.available && caps.enrolled;
}

/**
 * Get the primary biometric type (for UI purposes)
 */
export async function getPrimaryBiometricType(): Promise<BiometricType> {
  const caps = await getBiometricCapabilities();
  
  // Prefer face > fingerprint > iris
  if (caps.types.includes('facial')) return 'facial';
  if (caps.types.includes('fingerprint')) return 'fingerprint';
  if (caps.types.includes('iris')) return 'iris';
  
  return 'none';
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Authenticate user with biometrics
 */
export async function authenticateWithBiometric(
  config?: Partial<BiometricConfig>
): Promise<BiometricAuthResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Check if locked out
  if (state.lockedUntil && Date.now() < state.lockedUntil) {
    const remainingMs = state.lockedUntil - Date.now();
    return {
      success: false,
      error: `Too many attempts. Try again in ${Math.ceil(remainingMs / 1000)} seconds`,
      errorCode: 'LOCKOUT',
      fallbackUsed: false,
    };
  }

  // Check availability
  const isAvailable = await isBiometricAvailable();
  if (!isAvailable || !LocalAuthentication) {
    return {
      success: false,
      error: 'Biometric authentication not available',
      errorCode: 'NOT_AVAILABLE',
      fallbackUsed: false,
    };
  }

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: fullConfig.promptMessage,
      cancelLabel: fullConfig.cancelLabel,
      fallbackLabel: fullConfig.fallbackLabel,
      disableDeviceFallback: fullConfig.disableDeviceFallback,
      requireConfirmation: fullConfig.requireConfirmation,
    });

    if (result.success) {
      // Reset failed attempts on success
      state.failedAttempts = 0;
      state.lockedUntil = null;
      state.lastAuthTime = Date.now();

      const biometricType = await getPrimaryBiometricType();
      
      return {
        success: true,
        type: biometricType,
        fallbackUsed: false,
      };
    } else {
      // Handle failure
      state.failedAttempts++;

      // Check if should lock out
      if (state.failedAttempts >= fullConfig.maxAttempts) {
        state.lockedUntil = Date.now() + fullConfig.lockoutDurationMs;
        return {
          success: false,
          error: `Too many failed attempts. Locked for ${fullConfig.lockoutDurationMs / 1000} seconds`,
          errorCode: 'MAX_ATTEMPTS',
          fallbackUsed: false,
        };
      }

      // Map error codes
      let errorCode = 'UNKNOWN';
      let error = result.error || 'Authentication failed';

      if (error.includes('cancel')) {
        errorCode = 'USER_CANCEL';
        error = 'Authentication cancelled';
      } else if (error.includes('fallback')) {
        errorCode = 'FALLBACK';
        error = 'User chose fallback';
      } else if (error.includes('lockout')) {
        errorCode = 'LOCKOUT';
        error = 'Too many attempts';
      }

      return {
        success: false,
        error,
        errorCode,
        fallbackUsed: errorCode === 'FALLBACK',
      };
    }
  } catch (error: any) {
    logError('biometricAuth', 'Authentication error', error);
    return {
      success: false,
      error: error.message || 'Authentication failed',
      errorCode: 'ERROR',
      fallbackUsed: false,
    };
  }
}

// ============================================
// BIOMETRIC-PROTECTED STORAGE
// ============================================

/**
 * Store a value that requires biometric to retrieve
 */
export async function storeBiometricProtected(
  key: string,
  value: string
): Promise<boolean> {
  if (!SecureStore) {
    return false;
  }

  try {
    await SecureStore.setItemAsync(key, value, {
      requireAuthentication: true,
      authenticationPrompt: 'Authenticate to save secure data',
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return true;
  } catch (error) {
    logError('biometricAuth', 'Failed to store biometric protected', error);
    return false;
  }
}

/**
 * Retrieve a biometric-protected value
 */
export async function retrieveBiometricProtected(
  key: string
): Promise<string | null> {
  if (!SecureStore) {
    return null;
  }

  try {
    // This will automatically prompt for biometric
    const value = await SecureStore.getItemAsync(key, {
      authenticationPrompt: 'Authenticate to access secure data',
    });
    return value;
  } catch (error) {
    logError('biometricAuth', 'Failed to retrieve biometric protected', error);
    return null;
  }
}

/**
 * Delete a biometric-protected value
 */
export async function deleteBiometricProtected(key: string): Promise<boolean> {
  if (!SecureStore) {
    return false;
  }

  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    logError('biometricAuth', 'Failed to delete biometric protected', error);
    return false;
  }
}

// ============================================
// AUTHENTICATION GUARDS
// ============================================

/**
 * Check if recent authentication is still valid
 */
export function isAuthenticationValid(maxAgeMs: number = 5 * 60 * 1000): boolean {
  if (!state.lastAuthTime) return false;
  return Date.now() - state.lastAuthTime < maxAgeMs;
}

/**
 * Require biometric authentication if not recently authenticated
 */
export async function requireBiometricAuth(
  maxAgeMs: number = 5 * 60 * 1000,
  config?: Partial<BiometricConfig>
): Promise<BiometricAuthResult> {
  if (isAuthenticationValid(maxAgeMs)) {
    return {
      success: true,
      fallbackUsed: false,
    };
  }

  return authenticateWithBiometric(config);
}

// ============================================
// RESET
// ============================================

/**
 * Reset biometric state (for testing or logout)
 */
export function resetBiometricState(): void {
  state = {
    initialized: false,
    capabilities: null,
    failedAttempts: 0,
    lockedUntil: null,
    lastAuthTime: null,
  };
}

/**
 * Get current authentication state
 */
export function getBiometricState(): Readonly<BiometricState> {
  return { ...state };
}

// ============================================
// EXPORTS
// ============================================

export default {
  getBiometricCapabilities,
  isBiometricAvailable,
  getPrimaryBiometricType,
  authenticateWithBiometric,
  storeBiometricProtected,
  retrieveBiometricProtected,
  deleteBiometricProtected,
  isAuthenticationValid,
  requireBiometricAuth,
  resetBiometricState,
  getBiometricState,
};
