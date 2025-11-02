/**
 * Cloud Provider Service
 * 
 * Unified API for different cloud storage providers:
 * - Firebase (user's own Firebase project)
 * - WebDAV (Nextcloud, ownCloud, personal server)
 * - Local (no cloud, device storage only)
 * 
 * This allows users to choose their own cloud storage provider
 * while maintaining consistent functionality across the app.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type CloudProvider = 'firebase' | 'webdav' | 'none';

const STORAGE_KEY = 'empowr.cloud.provider';

/**
 * Get the currently selected cloud provider
 */
export async function getCloudProvider(): Promise<CloudProvider> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === 'firebase' || saved === 'webdav' || saved === 'none') {
      return saved;
    }
    // Default to Firebase for backwards compatibility
    return 'firebase';
  } catch {
    return 'firebase';
  }
}

/**
 * Set the cloud provider
 */
export async function setCloudProvider(provider: CloudProvider): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, provider);
  } catch (error) {
    console.error('[CloudProvider] Failed to save provider:', error);
  }
}

/**
 * Check if cloud features are available based on provider
 */
export async function isCloudAvailable(): Promise<boolean> {
  const provider = await getCloudProvider();
  return provider !== 'none';
}

/**
 * Get cloud provider display name
 */
export function getProviderDisplayName(provider: CloudProvider): string {
  switch (provider) {
    case 'firebase':
      return 'Firebase (Your Project)';
    case 'webdav':
      return 'WebDAV (Your Server)';
    case 'none':
      return 'Local Only';
    default:
      return 'Unknown';
  }
}

/**
 * Get cloud provider description
 */
export function getProviderDescription(provider: CloudProvider): string {
  switch (provider) {
    case 'firebase':
      return 'Your data stored in YOUR Firebase project. You own 100% of your data.';
    case 'webdav':
      return 'Your data stored on YOUR personal server (Nextcloud, ownCloud, etc.).';
    case 'none':
      return 'All data stored on this device only. No cloud backup or sync.';
    default:
      return '';
  }
}

/**
 * Check if a specific cloud feature is supported by the current provider
 */
export async function isFeatureSupported(feature: 'backup' | 'sync' | 'chat' | 'notifications'): Promise<boolean> {
  const provider = await getCloudProvider();
  
  switch (feature) {
    case 'backup':
      // All providers support backup (local, WebDAV, Firebase)
      return true;
    
    case 'sync':
      // Firebase and WebDAV support sync, local does not
      return provider === 'firebase' || provider === 'webdav';
    
    case 'chat':
      // Only Firebase supports real-time chat (Firestore)
      return provider === 'firebase';
    
    case 'notifications':
      // Only Firebase supports push notifications (FCM)
      return provider === 'firebase';
    
    default:
      return false;
  }
}

/**
 * Get cloud provider icon name
 */
export function getProviderIcon(provider: CloudProvider): string {
  switch (provider) {
    case 'firebase':
      return 'flame';
    case 'webdav':
      return 'cloud';
    case 'none':
      return 'phone-portrait';
    default:
      return 'help-circle';
  }
}

/**
 * Validate cloud provider configuration
 */
export async function validateProviderConfig(provider: CloudProvider): Promise<{ valid: boolean; error?: string }> {
  switch (provider) {
    case 'firebase':
      // Check if Firebase is configured
      try {
        const config = await import('../firebase/config');
        if (!config.db || !config.storage) {
          return { valid: false, error: 'Firebase not configured. Check firebase/config.ts' };
        }
        return { valid: true };
      } catch {
        return { valid: false, error: 'Firebase not available' };
      }
    
    case 'webdav':
      // Check if WebDAV is configured
      try {
        const { getBYOCConfig } = await import('./dataPolicy');
        const config = getBYOCConfig();
        if (!config || !config.endpoint) {
          return { valid: false, error: 'WebDAV not configured. Set endpoint in Settings > Privacy' };
        }
        return { valid: true };
      } catch {
        return { valid: false, error: 'WebDAV configuration error' };
      }
    
    case 'none':
      // Local storage always valid
      return { valid: true };
    
    default:
      return { valid: false, error: 'Unknown provider' };
  }
}

/**
 * Get recommended provider based on user needs
 */
export function getRecommendedProvider(needs: {
  privacy?: 'high' | 'medium' | 'low';
  features?: ('chat' | 'sync' | 'notifications')[];
  technicalSkill?: 'beginner' | 'intermediate' | 'advanced';
}): { provider: CloudProvider; reason: string } {
  const { privacy = 'medium', features = [], technicalSkill = 'beginner' } = needs;
  
  // Maximum privacy - recommend local only
  if (privacy === 'high' && !features.length) {
    return {
      provider: 'none',
      reason: 'Maximum privacy with local-only storage. No data leaves your device.'
    };
  }
  
  // Need chat or notifications - requires Firebase
  if (features.includes('chat') || features.includes('notifications')) {
    return {
      provider: 'firebase',
      reason: 'Real-time chat and push notifications require Firebase (your own project).'
    };
  }
  
  // Advanced user wanting maximum control - recommend WebDAV
  if (technicalSkill === 'advanced' && privacy === 'high') {
    return {
      provider: 'webdav',
      reason: 'Full control with your own server. Compatible with Nextcloud/ownCloud.'
    };
  }
  
  // Default - Firebase (easiest setup, most features)
  return {
    provider: 'firebase',
    reason: 'Best balance of features and ease of use. Your own Firebase project.'
  };
}
