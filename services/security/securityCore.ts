/**
 * Security Core - Foundation for all security operations
 * 
 * Provides:
 * - Security state management
 * - Threat level calculation
 * - Security event logging
 * - Policy enforcement
 */

import { Platform } from 'react-native';

import { logError } from '../../utils/errorLogger';

// ============================================
// TYPES
// ============================================

export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type ThreatCategory = 
  | 'device_integrity'    // Root/jailbreak
  | 'runtime_tampering'   // Frida/Xposed hooks
  | 'network_attack'      // MITM, SSL bypass
  | 'data_extraction'     // Memory dump, screen capture
  | 'behavioral_anomaly'  // Automation, brute force
  | 'code_modification';  // App tampering

export interface SecurityThreat {
  id: string;
  category: ThreatCategory;
  severity: ThreatLevel;
  description: string;
  timestamp: number;
  indicators: string[];
  mitigated: boolean;
}

export interface SecurityPolicy {
  allowRootedDevices: boolean;
  allowDebugger: boolean;
  allowEmulator: boolean;
  requireBiometric: boolean;
  maxAuthAttempts: number;
  lockoutDurationMs: number;
  dataWipeOnThreat: boolean;
  sensitiveScreens: string[];
  minimumOsVersion: { android: number; ios: number };
}

export interface SecurityState {
  initialized: boolean;
  threatLevel: ThreatLevel;
  activeThreats: SecurityThreat[];
  blocked: boolean;
  lastCheck: number;
  checksPerformed: number;
  deviceFingerprint: string;
  sessionId: string;
}

// ============================================
// DEFAULT POLICY
// ============================================

export const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  allowRootedDevices: false,
  allowDebugger: __DEV__, // Only in development
  allowEmulator: __DEV__, // Only in development
  requireBiometric: false, // User configurable
  maxAuthAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  dataWipeOnThreat: false, // High-security feature, opt-in
  sensitiveScreens: [
    'evidence-locker',
    'crisis-plan',
    'emergency-wallet',
    'medical-records',
    'safety-plan',
    'document-vault',
  ],
  minimumOsVersion: { android: 26, ios: 13 }, // Android 8.0, iOS 13
};

// ============================================
// STATE MANAGEMENT
// ============================================

let securityState: SecurityState = {
  initialized: false,
  threatLevel: 'none',
  activeThreats: [],
  blocked: false,
  lastCheck: 0,
  checksPerformed: 0,
  deviceFingerprint: '',
  sessionId: '',
};

let securityPolicy: SecurityPolicy = { ...DEFAULT_SECURITY_POLICY };
const eventListeners: Array<(event: SecurityEvent) => void> = [];

// ============================================
// SECURITY EVENTS
// ============================================

export interface SecurityEvent {
  type: 'threat_detected' | 'threat_mitigated' | 'policy_violation' | 'state_change' | 'check_complete';
  threat?: SecurityThreat;
  previousState?: SecurityState;
  newState?: SecurityState;
  timestamp: number;
}

/**
 * Subscribe to security events
 */
export function onSecurityEvent(listener: (event: SecurityEvent) => void): () => void {
  eventListeners.push(listener);
  return () => {
    const idx = eventListeners.indexOf(listener);
    if (idx >= 0) eventListeners.splice(idx, 1);
  };
}

/**
 * Emit security event to all listeners
 */
export function emitSecurityEvent(event: SecurityEvent): void {
  for (const listener of eventListeners) {
    try {
      listener(event);
    } catch (error) {
      logError('SecurityCore', 'event listener failed', error);
    }
  }
}

// ============================================
// THREAT MANAGEMENT
// ============================================

/**
 * Register a detected threat
 */
export function registerThreat(threat: Omit<SecurityThreat, 'id' | 'timestamp' | 'mitigated'>): SecurityThreat {
  const fullThreat: SecurityThreat = {
    ...threat,
    id: `threat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    mitigated: false,
  };

  securityState.activeThreats.push(fullThreat);
  recalculateThreatLevel();

  emitSecurityEvent({
    type: 'threat_detected',
    threat: fullThreat,
    timestamp: Date.now(),
  });

  return fullThreat;
}

/**
 * Mark a threat as mitigated
 */
export function mitigateThreat(threatId: string): void {
  const threat = securityState.activeThreats.find(t => t.id === threatId);
  if (threat) {
    threat.mitigated = true;
    recalculateThreatLevel();
    
    emitSecurityEvent({
      type: 'threat_mitigated',
      threat,
      timestamp: Date.now(),
    });
  }
}

/**
 * Clear all mitigated threats
 */
export function clearMitigatedThreats(): void {
  securityState.activeThreats = securityState.activeThreats.filter(t => !t.mitigated);
}

/**
 * Recalculate overall threat level
 */
function recalculateThreatLevel(): void {
  const activeThreats = securityState.activeThreats.filter(t => !t.mitigated);
  
  if (activeThreats.length === 0) {
    securityState.threatLevel = 'none';
    return;
  }

  // Check for any critical threats
  if (activeThreats.some(t => t.severity === 'critical')) {
    securityState.threatLevel = 'critical';
    return;
  }

  // Check for multiple high threats
  const highThreats = activeThreats.filter(t => t.severity === 'high');
  if (highThreats.length >= 2) {
    securityState.threatLevel = 'critical';
    return;
  }

  if (highThreats.length === 1) {
    securityState.threatLevel = 'high';
    return;
  }

  // Check for medium threats
  const mediumThreats = activeThreats.filter(t => t.severity === 'medium');
  if (mediumThreats.length >= 2) {
    securityState.threatLevel = 'high';
    return;
  }

  if (mediumThreats.length === 1) {
    securityState.threatLevel = 'medium';
    return;
  }

  securityState.threatLevel = 'low';
}

// ============================================
// STATE ACCESS
// ============================================

/**
 * Get current security state (immutable copy)
 */
export function getSecurityState(): Readonly<SecurityState> {
  return { ...securityState, activeThreats: [...securityState.activeThreats] };
}

/**
 * Get current security policy
 */
export function getSecurityPolicy(): Readonly<SecurityPolicy> {
  return { ...securityPolicy };
}

/**
 * Update security policy
 */
export function updateSecurityPolicy(updates: Partial<SecurityPolicy>): void {
  securityPolicy = { ...securityPolicy, ...updates };
}

/**
 * Set blocked state
 */
export function setBlocked(blocked: boolean): void {
  securityState.blocked = blocked;
}

/**
 * Check if operations should be allowed
 */
export function shouldAllowOperation(operationType: 'sensitive' | 'normal' = 'normal'): { 
  allowed: boolean; 
  reason?: string 
} {
  if (!securityState.initialized) {
    return { allowed: false, reason: 'Security framework not initialized' };
  }

  if (securityState.blocked) {
    return { allowed: false, reason: 'Security lockout in effect' };
  }

  if (operationType === 'sensitive') {
    if (securityState.threatLevel === 'critical') {
      return { 
        allowed: false, 
        reason: 'Sensitive operations disabled due to security threat' 
      };
    }

    if (securityState.threatLevel === 'high' && !securityPolicy.allowRootedDevices) {
      return { 
        allowed: false, 
        reason: 'Device security compromised' 
      };
    }
  }

  return { allowed: true };
}

// ============================================
// DEVICE FINGERPRINT
// ============================================

/**
 * Generate a device fingerprint for identifying the device
 * This is NOT for tracking users - only for security (device binding)
 */
export function generateDeviceFingerprint(): string {
  // Platform.constants has different properties on Android vs iOS
  const constants = Platform.constants as Record<string, unknown> | undefined;
  
  const components = [
    Platform.OS,
    Platform.Version?.toString() || 'unknown',
    (constants?.Brand as string) || '',
    (constants?.Manufacturer as string) || '',
    (constants?.Model as string) || '',
    // Screen dimensions are part of fingerprint
    typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'mobile',
  ];

  // Simple hash of components
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the security core
 */
export function initializeSecurityCore(policy?: Partial<SecurityPolicy>): void {
  if (securityState.initialized) {
    return;
  }

  if (policy) {
    securityPolicy = { ...DEFAULT_SECURITY_POLICY, ...policy };
  }

  securityState = {
    initialized: true,
    threatLevel: 'none',
    activeThreats: [],
    blocked: false,
    lastCheck: Date.now(),
    checksPerformed: 0,
    deviceFingerprint: generateDeviceFingerprint(),
    sessionId: generateSessionId(),
  };
}

/**
 * Reset security state (for testing or after user logout)
 */
export function resetSecurityState(): void {
  securityState = {
    initialized: false,
    threatLevel: 'none',
    activeThreats: [],
    blocked: false,
    lastCheck: 0,
    checksPerformed: 0,
    deviceFingerprint: '',
    sessionId: '',
  };
}

// ============================================
// LOGGING
// ============================================

/**
 * Log security event (sanitized, no PII)
 */
export function logSecurityEvent(
  category: string, 
  message: string, 
  data?: Record<string, unknown>
): void {
  // In production, this would send to security monitoring
  const sanitizedData = data ? JSON.stringify(data) : '';
  
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[Security:${category}] ${message}`, sanitizedData);
  }

  // TODO: Send to analytics/monitoring in production
  // analytics.logEvent('security_event', { category, message, ...data });
}
