/**
 * Security Manager - Central coordinator for all security features
 * Manages initialization, monitoring, and enforcement of security policies
 * 
 * MAXIMUM PROTECTION MODE - Integrates all security subsystems
 */

import { Platform } from 'react-native';

import { logger } from '../../utils/logger';
import { logActivity } from '../activity';

import { getBiometricCapabilities } from './biometricAuth';
import { startMemoryProtection, stopMemoryProtection } from './memoryProtection';
import { isRASPActive, startRASPMonitoring, stopRASPMonitoring } from './raspEngine';
import { getSecurityState as getCoreState, initializeSecurityCore } from './securityCore';
import { performFullThreatScan } from './threatDetection';

export interface SecurityConfig {
  enableTamperDetection: boolean;
  enableRootJailbreakCheck: boolean;
  enableIntegrityValidation: boolean;
  enableSecureStorage: boolean;
  enableRASP: boolean;
  enableMemoryProtection: boolean;
  enableBiometric: boolean;
  strictBYOCMode: boolean;
  allowDebugging: boolean;
  raspCheckIntervalMs: number;
}

export interface SecurityState {
  initialized: boolean;
  isSecure: boolean;
  threats: SecurityThreat[];
  lastCheck: number;
  raspActive: boolean;
  biometricAvailable: boolean;
  riskScore: number;
}

export interface SecurityThreat {
  type: 'tamper' | 'root' | 'debug' | 'integrity' | 'network' | 'hook' | 'emulator';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  blocked: boolean;
}

export interface SecurityStatus {
  initialized: boolean;
  secure: boolean;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  threatCount: number;
  riskScore: number;
  raspActive: boolean;
  biometricAvailable: boolean;
  lastCheck: number;
  recommendations: string[];
}

let securityState: SecurityState = {
  initialized: false,
  isSecure: false,
  threats: [],
  lastCheck: 0,
  raspActive: false,
  biometricAvailable: false,
  riskScore: 0,
};

let securityConfig: SecurityConfig = {
  enableTamperDetection: true,
  enableRootJailbreakCheck: true,
  enableIntegrityValidation: true,
  enableSecureStorage: true,
  enableRASP: true,
  enableMemoryProtection: true,
  enableBiometric: true,
  strictBYOCMode: process.env.EXPO_PUBLIC_DATA_POLICY === 'strict_byoc',
  allowDebugging: __DEV__,
  raspCheckIntervalMs: 30000,
};

/**
 * Initialize security framework with MAXIMUM PROTECTION
 * Call this early in app lifecycle
 */

export async function initializeSecurity(config?: Partial<SecurityConfig>): Promise<boolean> {
  try {
    // Merge user config with defaults
    if (config) {
      securityConfig = { ...securityConfig, ...config };
    }

    // Initialize security core
    initializeSecurityCore();

    // Log security initialization
    await logActivity({
      type: 'security.init',
      metadata: {
        platform: Platform.OS,
        strictMode: securityConfig.strictBYOCMode,
        debugMode: securityConfig.allowDebugging,
        raspEnabled: securityConfig.enableRASP,
        memoryProtectionEnabled: securityConfig.enableMemoryProtection,
      }
    });

    // Perform comprehensive threat scan
    const threatScan = await performFullThreatScan();
    const threats = convertThreatScanToThreats(threatScan);

    // Start RASP monitoring if enabled
    if (securityConfig.enableRASP && !securityConfig.allowDebugging) {
      startRASPMonitoring({
        checkIntervalMs: securityConfig.raspCheckIntervalMs,
        enabled: true,
      });
    }

    // Start memory protection if enabled
    if (securityConfig.enableMemoryProtection) {
      startMemoryProtection({
        enabled: true,
        wipeOnBackground: true,
      });
    }

    // Check biometric capabilities
    const biometricCaps = await getBiometricCapabilities();

    securityState = {
      initialized: true,
      isSecure: threats.length === 0,
      threats,
      lastCheck: Date.now(),
      raspActive: isRASPActive(),
      biometricAvailable: biometricCaps.available && biometricCaps.enrolled,
      riskScore: threatScan.riskScore,
    };

    // Handle critical threats immediately
    const criticalThreats = threats.filter(t => t.severity === 'critical');
    if (criticalThreats.length > 0 && !securityConfig.allowDebugging) {
      await handleCriticalThreats(criticalThreats);
      return false;
    }

    logger.log('[Security] Framework initialized successfully');
    return true;
  } catch (error) {
    logger.error('Security initialization failed:', error);
    return false;
  }
}

/**
 * Convert threat scan result to SecurityThreat array
 */
function convertThreatScanToThreats(scan: Awaited<ReturnType<typeof performFullThreatScan>>): SecurityThreat[] {
  const threats: SecurityThreat[] = [];
  const now = Date.now();

  if (scan.root.detected) {
    threats.push({
      type: 'root',
      severity: scan.root.confidence >= 80 ? 'critical' : 'high',
      message: 'Device appears to be rooted',
      timestamp: now,
      blocked: scan.root.confidence >= 80,
    });
  }

  if (scan.jailbreak.detected) {
    threats.push({
      type: 'root',
      severity: scan.jailbreak.confidence >= 80 ? 'critical' : 'high',
      message: 'Device appears to be jailbroken',
      timestamp: now,
      blocked: scan.jailbreak.confidence >= 80,
    });
  }

  if (scan.emulator.detected) {
    threats.push({
      type: 'emulator',
      severity: 'medium',
      message: 'Running in emulator/simulator',
      timestamp: now,
      blocked: false,
    });
  }

  if (scan.debugger.detected) {
    threats.push({
      type: 'debug',
      severity: 'high',
      message: 'Debugger detected',
      timestamp: now,
      blocked: !securityConfig.allowDebugging,
    });
  }

  if (scan.hooks.detected) {
    threats.push({
      type: 'hook',
      severity: 'critical',
      message: 'Hooking framework detected (Frida/Xposed)',
      timestamp: now,
      blocked: true,
    });
  }

  if (scan.proxy.detected) {
    threats.push({
      type: 'network',
      severity: 'medium',
      message: 'Network proxy detected',
      timestamp: now,
      blocked: false,
    });
  }

  return threats;
}

/**
 * Perform comprehensive security check
 */

export async function performSecurityCheck(): Promise<SecurityThreat[]> {
  const threats: SecurityThreat[] = [];
  const now = Date.now();

  try {
    // Check for rooting/jailbreaking
    if (securityConfig.enableRootJailbreakCheck) {
      const isRooted = await checkDeviceCompromise();
      if (isRooted) {
        threats.push({
          type: 'root',
          severity: 'high',
          message: 'Device appears to be rooted or jailbroken',
          timestamp: now,
          blocked: !securityConfig.allowDebugging
        });
      }
    }

    // Check for tampering
    if (securityConfig.enableTamperDetection) {
      const isTampered = await checkAppTampering();
      if (isTampered) {
        threats.push({
          type: 'tamper',
          severity: 'critical',
          message: 'App integrity violation detected',
          timestamp: now,
          blocked: true
        });
      }
    }

    // Check debug environment
    if (__DEV__ && !securityConfig.allowDebugging) {
      threats.push({
        type: 'debug',
        severity: 'medium',
        message: 'Development mode detected',
        timestamp: now,
        blocked: false
      });
    }

    // Log security check
    if (threats.length > 0) {
      await logActivity({
        type: 'security.threat',
        metadata: {
          threatCount: threats.length,
          highSeverityCount: threats.filter(t => t.severity === 'high' || t.severity === 'critical').length
        }
      });
    }

  } catch (error) {
    logger.error('Security check failed:', error);
    threats.push({
      type: 'integrity',
      severity: 'medium',
      message: 'Security check failed',
      timestamp: now,
      blocked: false
    });
  }

  return threats;
}

/**
 * Check for device compromise (root/jailbreak)
 */

async function checkDeviceCompromise(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return checkAndroidRoot();
  } else if (Platform.OS === 'ios') {
    return checkIOSJailbreak();
  }
  return false;
}

/**
 * Android root detection
 */

async function checkAndroidRoot(): Promise<boolean> {
  try {
    // In production, this would check for root management apps, binaries, and system properties
    logger.warn('Android root detection (placeholder implementation)');
    return false;

  } catch {
    return false;
  }
}

/**
 * iOS jailbreak detection
 */

async function checkIOSJailbreak(): Promise<boolean> {
  try {
    // In production, this would check for jailbreak files, schemes, and sandbox violations
    logger.warn('iOS jailbreak detection (placeholder implementation)');
    return false;

  } catch {
    return false;
  }
}

/**
 * App tampering detection
 */

async function checkAppTampering(): Promise<boolean> {
  try {
    // Check application signature/integrity
    // This should be implemented with native modules for real security
    
    // Placeholder checks:
    // 1. Bundle signature verification
    // 2. Critical file integrity
    // 3. Runtime environment validation
    
    return false; // Placeholder - implement native checking
  } catch {
    return true; // Assume tampering if check fails
  }
}

/**
 * Handle critical security threats
 */

async function handleCriticalThreats(threats: SecurityThreat[]): Promise<void> {
  try {
    // Log critical threats
    await logActivity({
      type: 'security.violation',
      metadata: {
        threats: threats.map(t => ({
          type: t.type,
          severity: t.severity,
          blocked: t.blocked
        }))
      }
    });

    // In production, you might:
    // 1. Display security warning to user
    // 2. Disable sensitive features
    // 3. Exit app if threats are too severe
    // 4. Report to security monitoring system

    logger.warn('Critical security threats detected:', threats);
  } catch (error) {
    logger.error('Failed to handle critical threats:', error);
  }
}

/**
 * Get current security state
 */

export function getSecurityState(): SecurityState {
  return { ...securityState };
}

/**
 * Get comprehensive security status
 */
export function getSecurityStatus(): SecurityStatus {
  const coreState = getCoreState();
  
  const recommendations: string[] = [];
  
  if (securityState.threats.some(t => t.type === 'root')) {
    recommendations.push('Consider using a non-rooted device for sensitive operations');
  }
  
  if (!securityState.biometricAvailable) {
    recommendations.push('Enable biometric authentication for additional security');
  }
  
  if (!securityState.raspActive && !securityConfig.allowDebugging) {
    recommendations.push('RASP monitoring is not active');
  }
  
  if (securityState.threats.some(t => t.type === 'hook')) {
    recommendations.push('Remove hooking frameworks like Frida or Xposed');
  }

  return {
    initialized: securityState.initialized,
    secure: securityState.isSecure,
    threatLevel: coreState.threatLevel,
    threatCount: securityState.threats.length,
    riskScore: securityState.riskScore,
    raspActive: securityState.raspActive,
    biometricAvailable: securityState.biometricAvailable,
    lastCheck: securityState.lastCheck,
    recommendations,
  };
}

/**
 * Stop all security monitoring
 */
export function stopSecurityMonitoring(): void {
  stopRASPMonitoring();
  stopMemoryProtection();
  logger.log('[Security] All monitoring stopped');
}

/**
 * Update security configuration
 */

export function updateSecurityConfig(updates: Partial<SecurityConfig>): void {
  securityConfig = { ...securityConfig, ...updates };
}

/**
 * Periodic security monitoring
 * Call this periodically to maintain security posture
 */

export async function monitorSecurity(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCheck = now - securityState.lastCheck;
  
  // Check every 5 minutes in production
  if (timeSinceLastCheck > 5 * 60 * 1000 || !securityState.initialized) {
    const threats = await performSecurityCheck();
    securityState.threats = threats;
    securityState.isSecure = threats.length === 0;
    securityState.lastCheck = now;

    // Handle new critical threats
    const criticalThreats = threats.filter(t => t.severity === 'critical');
    if (criticalThreats.length > 0 && !securityConfig.allowDebugging) {
      await handleCriticalThreats(criticalThreats);
    }
  }
}

/**
 * Export security utilities
 */

export {
    securityConfig
};

export default {
  initializeSecurity,
  performSecurityCheck,
  getSecurityState,
  getSecurityStatus,
  updateSecurityConfig,
  monitorSecurity,
  stopSecurityMonitoring,
};

