/**
 * Device Security - Device integrity and environment validation
 * Detects: rooting/jailbreaking, emulators, debugging, unsafe environments
 */

import { Platform } from 'react-native';

import { logger } from '../../utils/logger';

// Optional import - gracefully handle missing native module
let LocalAuthentication: any = null;
try {
  LocalAuthentication = require('expo-local-authentication');
} catch {
  // Module not available - biometric features will be disabled
}


export interface SecurityEnvironment {
  isRooted: boolean;
  isJailbroken: boolean;
  isEmulator: boolean;
  isDebugging: boolean;
  isTampered: boolean;
  biometricCapable: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityDeviceInfo {
  platform: string;
  version: string;
  model: string;
  isPhysicalDevice: boolean;
  securityPatchLevel?: string;
}

/**
 * Device security validation service
 */
export class DeviceSecurityValidator {
  private lastCheck: SecurityEnvironment | null = null;
  private lastCheckTime: number = 0;

  constructor() {
    // Initialize with default state
    this.lastCheck = null;
  }

  /**
   * Comprehensive device security assessment
   */
  async assessDeviceSecurity(): Promise<SecurityEnvironment> {
    const now = Date.now();
    
    // Cache results for 5 minutes
    if (this.lastCheck && (now - this.lastCheckTime) < 5 * 60 * 1000) {
      return this.lastCheck;
    }

    try {
      const isRooted = Platform.OS === 'android' ? await this.checkAndroidRoot() : false;
      const isJailbroken = Platform.OS === 'ios' ? await this.checkIOSJailbreak() : false;
      const isEmulator = await this.detectEmulator();
      const isDebugging = await this.detectDebugging();
      const isTampered = await this.detectTampering();
      const biometricCapable = await this.checkBiometricCapability();

      // Calculate risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      
      if (isRooted || isJailbroken) {
        riskLevel = 'critical';
      } else if (isDebugging || isTampered) {
        riskLevel = 'high';
      } else if (isEmulator) {
        riskLevel = 'medium';
      }

      const result: SecurityEnvironment = {
        isRooted,
        isJailbroken,
        isEmulator,
        isDebugging,
        isTampered,
        biometricCapable,
        riskLevel
      };

      this.lastCheck = result;
      this.lastCheckTime = now;

      return result;

    } catch (error) {
      logger.error('Device security assessment failed:', error);
      
      // Return safe defaults on error
      return {
        isRooted: false,
        isJailbroken: false,
        isEmulator: false,
        isDebugging: false,
        isTampered: false,
        biometricCapable: false,
        riskLevel: 'medium' // Assume medium risk if we can't check
      };
    }
  }

  /**
   * Check for Android root
   */
  private async checkAndroidRoot(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      // Basic root detection - in production this would be more comprehensive
      // Check for su binary availability, root management apps, etc.
      logger.warn('Android root detection (placeholder implementation)');
      return false;

    } catch (error) {
      logger.error('Android root check failed:', error);
      return false;
    }
  }

  /**
   * Check for iOS jailbreak
   */
  private async checkIOSJailbreak(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      // Basic jailbreak detection - in production this would be more comprehensive
      logger.warn('iOS jailbreak detection (placeholder implementation)');
      return false;

    } catch (error) {
      logger.error('iOS jailbreak check failed:', error);
      return false;
    }
  }

  /**
   * Detect if running on emulator
   */
  private async detectEmulator(): Promise<boolean> {
    try {
      // Basic emulator detection
      logger.warn('Emulator detection (placeholder implementation)');
      return false;

    } catch (error) {
      logger.error('Emulator detection failed:', error);
      return false;
    }
  }

  /**
   * Detect debugging environment
   */
  private async detectDebugging(): Promise<boolean> {
    try {
      // Check for debugging indicators
      const isDebugMode = __DEV__;
      const hasDevTools = typeof (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';
      
      return isDebugMode || hasDevTools;

    } catch (error) {
      logger.error('Debug detection failed:', error);
      return false;
    }
  }

  /**
   * Detect environment tampering
   */
  private async detectTampering(): Promise<boolean> {
    try {
      // Basic tampering detection
      logger.warn('Tampering detection (placeholder implementation)');
      return false;

    } catch (error) {
      logger.error('Tampering detection failed:', error);
      return false;
    }
  }

  /**
   * Check biometric authentication capability
   */
  private async checkBiometricCapability(): Promise<boolean> {
    try {
      if (!LocalAuthentication) {
        return false;
      }
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      return hasHardware && isEnrolled;

    } catch (error) {
      logger.error('Biometric capability check failed:', error);
      return false;
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<SecurityDeviceInfo> {
    try {
      return {
        platform: Platform.OS,
        version: Platform.Version.toString(),
        model: 'Unknown', // Would use device info library in production
        isPhysicalDevice: true, // Would detect emulator in production
        securityPatchLevel: undefined // Android only, would require native code
      };

    } catch (error) {
      logger.error('Device info retrieval failed:', error);
      
      return {
        platform: 'unknown',
        version: 'unknown',
        model: 'unknown',
        isPhysicalDevice: true
      };
    }
  }

  /**
   * Force refresh security assessment
   */
  async refreshSecurityAssessment(): Promise<SecurityEnvironment> {
    this.lastCheck = null;
    this.lastCheckTime = 0;
    
    return await this.assessDeviceSecurity();
  }

  /**
   * Get cached security assessment
   */
  getCachedAssessment(): SecurityEnvironment | null {
    return this.lastCheck;
  }

  /**
   * Sanitize environment for security
   */
  sanitizeEnvironment(): void {
    try {
      // Remove development tools in production
      if (!__DEV__) {
        delete (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
        delete (globalThis as any).__REDUX_DEVTOOLS_EXTENSION__;
      }

      logger.warn('Environment sanitized');

    } catch (error) {
      logger.warn('Environment sanitization failed:', error);
    }
  }
}

// Global device security validator
export const deviceSecurity = new DeviceSecurityValidator();

// Convenience functions
export async function isDeviceSecure(): Promise<boolean> {
  const assessment = await deviceSecurity.assessDeviceSecurity();
  return assessment.riskLevel === 'low' || assessment.riskLevel === 'medium';
}

export async function getSecurityRiskLevel(): Promise<'low' | 'medium' | 'high' | 'critical'> {
  const assessment = await deviceSecurity.assessDeviceSecurity();
  return assessment.riskLevel;
}

export async function canUseBiometrics(): Promise<boolean> {
  const assessment = await deviceSecurity.assessDeviceSecurity();
  return assessment.biometricCapable;
}
