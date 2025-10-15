/**
 * Permissions Manager - Minimal permissions and secure access control
 * Implements: principle of least privilege, permission auditing, secure defaults
 */

import { logger } from '../../utils/logger';

import { Platform } from 'react-native';

interface PermissionConfig {
  android: string[];
  ios: string[];
  description: string;
  required: boolean;
  purpose: string;
}

interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  expires?: 'never' | 'session' | number;
}

interface PermissionAuditEntry {
  permission: string;
  action: 'requested' | 'granted' | 'denied' | 'revoked';
  timestamp: number;
  purpose: string;
}

/**
 * Secure permissions management
 */

import { logger } from '../../utils/logger';
export class PermissionsManager {
  private auditLog: PermissionAuditEntry[] = [];
  private permissionCache: Map<string, PermissionStatus> = new Map();

  /**
   * Essential permissions only - following principle of least privilege
   */

import { logger } from '../../utils/logger';
  private readonly PERMISSION_CONFIGS: Record<string, PermissionConfig> = {
    // Local storage access - essential for offline-first operation
    STORAGE: {
      android: ['android.permission.WRITE_EXTERNAL_STORAGE', 'android.permission.READ_EXTERNAL_STORAGE'],
      ios: [], // iOS handles this through document picker
      description: 'Access to local storage for saving your data',
      required: true,
      purpose: 'Store your data locally on your device'
    },

    // Camera access - only for evidence collection
    CAMERA: {
      android: ['android.permission.CAMERA'],
      ios: ['NSCameraUsageDescription'],
      description: 'Camera access for evidence collection',
      required: false,
      purpose: 'Take photos of documents and evidence'
    },

    // Media library - only for evidence import
    MEDIA_LIBRARY: {
      android: ['android.permission.READ_EXTERNAL_STORAGE'],
      ios: ['NSPhotoLibraryUsageDescription'],
      description: 'Access to photo library for importing evidence',
      required: false,
      purpose: 'Import existing photos as evidence'
    },

    // Microphone - only for audio evidence
    MICROPHONE: {
      android: ['android.permission.RECORD_AUDIO'],
      ios: ['NSMicrophoneUsageDescription'],
      description: 'Microphone access for audio evidence',
      required: false,
      purpose: 'Record audio evidence and notes'
    },

    // Location - explicitly NOT requested for privacy
    // LOCATION: Intentionally excluded to protect user privacy

    // Contacts - explicitly NOT requested for privacy
    // CONTACTS: Intentionally excluded to protect user privacy

    // Calendar - explicitly NOT requested for privacy
    // CALENDAR: Intentionally excluded to protect user privacy

    // Phone/SMS - explicitly NOT requested for privacy
    // PHONE: Intentionally excluded to protect user privacy

    // Network state - for connection monitoring only
    NETWORK_STATE: {
      android: ['android.permission.ACCESS_NETWORK_STATE'],
      ios: [], // iOS handles this automatically
      description: 'Network state monitoring for security',
      required: true,
      purpose: 'Monitor network connections for security purposes'
    }
  };

  /**
   * Check if permission is granted
   */

import { logger } from '../../utils/logger';
  async checkPermission(permission: string): Promise<PermissionStatus> {
    try {
      // Check cache first
      const cached = this.permissionCache.get(permission);
      if (cached) {
        return cached;
      }

      // Get permission status based on platform
      let status: PermissionStatus = { granted: false, canAskAgain: true };

      if (Platform.OS === 'android') {
        status = await this.checkAndroidPermission(permission);
      } else if (Platform.OS === 'ios') {
        status = await this.checkIOSPermission(permission);
      }

      // Cache the result
      this.permissionCache.set(permission, status);

      // Audit the check
      this.auditPermission(permission, status.granted ? 'granted' : 'denied', this.PERMISSION_CONFIGS[permission]?.purpose || 'Unknown');

      return status;

    } catch (error) {
      logger.error(`Permission check failed for ${permission}:`, error);
      return { granted: false, canAskAgain: false };
    }
  }

  /**
   * Request permission with clear justification
   */

import { logger } from '../../utils/logger';
  async requestPermission(permission: string, justification?: string): Promise<PermissionStatus> {
    try {
      const config = this.PERMISSION_CONFIGS[permission];
      if (!config) {
        throw new Error(`Unknown permission: ${permission}`);
      }

      // Audit the request
      this.auditPermission(permission, 'requested', justification || config.purpose);

      // Check if already granted
      const currentStatus = await this.checkPermission(permission);
      if (currentStatus.granted) {
        return currentStatus;
      }

      // Request permission based on platform
      let status: PermissionStatus = { granted: false, canAskAgain: false };

      if (Platform.OS === 'android') {
        status = await this.requestAndroidPermission(permission, config);
      } else if (Platform.OS === 'ios') {
        status = await this.requestIOSPermission(permission, config);
      }

      // Update cache
      this.permissionCache.set(permission, status);

      // Audit the result
      this.auditPermission(permission, status.granted ? 'granted' : 'denied', config.purpose);

      return status;

    } catch (error) {
      logger.error(`Permission request failed for ${permission}:`, error);
      this.auditPermission(permission, 'denied', 'Request failed');
      return { granted: false, canAskAgain: false };
    }
  }

  /**
   * Check Android permission
   */

import { logger } from '../../utils/logger';
  private async checkAndroidPermission(_permission: string): Promise<PermissionStatus> {
    try {
      // This would use expo-permissions or react-native-permissions
      // For now, return a placeholder
      return { granted: true, canAskAgain: true };
    } catch (error) {
      logger.error('Android permission check failed:', error);
      return { granted: false, canAskAgain: true };
    }
  }

  /**
   * Check iOS permission
   */

import { logger } from '../../utils/logger';
  private async checkIOSPermission(_permission: string): Promise<PermissionStatus> {
    try {
      // This would use expo-permissions or react-native-permissions
      // For now, return a placeholder
      return { granted: true, canAskAgain: true };
    } catch (error) {
      logger.error('iOS permission check failed:', error);
      return { granted: false, canAskAgain: true };
    }
  }

  /**
   * Request Android permission
   */

import { logger } from '../../utils/logger';
  private async requestAndroidPermission(permission: string, config: PermissionConfig): Promise<PermissionStatus> {
    try {
      // This would use expo-permissions or react-native-permissions
      // Show rationale if needed
      logger.warn(`Requesting Android permission: ${permission}`);
      logger.warn(`Purpose: ${config.purpose}`);
      
      // Simulate permission request
      return { granted: true, canAskAgain: true };
    } catch (error) {
      logger.error('Android permission request failed:', error);
      return { granted: false, canAskAgain: false };
    }
  }

  /**
   * Request iOS permission
   */

import { logger } from '../../utils/logger';
  private async requestIOSPermission(permission: string, config: PermissionConfig): Promise<PermissionStatus> {
    try {
      // This would use expo-permissions or react-native-permissions
      logger.warn(`Requesting iOS permission: ${permission}`);
      logger.warn(`Purpose: ${config.purpose}`);
      
      // Simulate permission request
      return { granted: true, canAskAgain: true };
    } catch (error) {
      logger.error('iOS permission request failed:', error);
      return { granted: false, canAskAgain: false };
    }
  }

  /**
   * Audit permission activity
   */

import { logger } from '../../utils/logger';
  private auditPermission(permission: string, action: PermissionAuditEntry['action'], purpose: string): void {
    this.auditLog.push({
      permission,
      action,
      timestamp: Date.now(),
      purpose
    });

    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
  }

  /**
   * Get all required permissions
   */

import { logger } from '../../utils/logger';
  getRequiredPermissions(): string[] {
    return Object.keys(this.PERMISSION_CONFIGS)
      .filter(key => this.PERMISSION_CONFIGS[key].required);
  }

  /**
   * Get all optional permissions
   */

import { logger } from '../../utils/logger';
  getOptionalPermissions(): string[] {
    return Object.keys(this.PERMISSION_CONFIGS)
      .filter(key => !this.PERMISSION_CONFIGS[key].required);
  }

  /**
   * Get permission purpose/justification
   */

import { logger } from '../../utils/logger';
  getPermissionPurpose(permission: string): string {
    return this.PERMISSION_CONFIGS[permission]?.purpose || 'Unknown purpose';
  }

  /**
   * Get permission audit log
   */

import { logger } from '../../utils/logger';
  getAuditLog(): PermissionAuditEntry[] {
    return [...this.auditLog];
  }

  /**
   * Clear permission cache (force recheck)
   */

import { logger } from '../../utils/logger';
  clearCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Check if all required permissions are granted
   */

import { logger } from '../../utils/logger';
  async checkRequiredPermissions(): Promise<{ allGranted: boolean; missing: string[] }> {
    const required = this.getRequiredPermissions();
    const missing: string[] = [];

    for (const permission of required) {
      const status = await this.checkPermission(permission);
      if (!status.granted) {
        missing.push(permission);
      }
    }

    return {
      allGranted: missing.length === 0,
      missing
    };
  }

  /**
   * Request all required permissions
   */

import { logger } from '../../utils/logger';
  async requestRequiredPermissions(): Promise<{ allGranted: boolean; results: Record<string, PermissionStatus> }> {
    const required = this.getRequiredPermissions();
    const results: Record<string, PermissionStatus> = {};

    for (const permission of required) {
      results[permission] = await this.requestPermission(permission);
    }

    const allGranted = Object.values(results).every(status => status.granted);

    return { allGranted, results };
  }

  /**
   * Generate permission manifest for documentation
   */

import { logger } from '../../utils/logger';
  generateManifest(): { android: string[]; ios: string[]; purposes: Record<string, string> } {
    const android: string[] = [];
    const ios: string[] = [];
    const purposes: Record<string, string> = {};

    Object.entries(this.PERMISSION_CONFIGS).forEach(([key, config]) => {
      android.push(...config.android);
      ios.push(...config.ios);
      purposes[key] = config.purpose;
    });

    return {
      android: [...new Set(android)],
      ios: [...new Set(ios)],
      purposes
    };
  }
}

// Global permissions manager
export const permissionsManager = new PermissionsManager();

// Convenience functions
export async function checkStoragePermission(): Promise<boolean> {
  const status = await permissionsManager.checkPermission('STORAGE');
  return status.granted;
}

export async function requestCameraPermission(): Promise<boolean> {
  const status = await permissionsManager.requestPermission('CAMERA');
  return status.granted;
}

export async function requestMediaLibraryPermission(): Promise<boolean> {
  const status = await permissionsManager.requestPermission('MEDIA_LIBRARY');
  return status.granted;
}

export async function requestMicrophonePermission(): Promise<boolean> {
  const status = await permissionsManager.requestPermission('MICROPHONE');
  return status.granted;
}

export { type PermissionAuditEntry, type PermissionConfig, type PermissionStatus };

